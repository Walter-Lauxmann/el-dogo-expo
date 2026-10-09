import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
process.env.EXPO_PUBLIC_API_URL='http://test:3000/';
const source=await readFile(new URL('../src/api.js',import.meta.url),'utf8');
const {createApi,petBody,clientBody,photoUrl}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('Contrato NestJS: token, PATCH y JSON',async()=>{
 const original=global.fetch;let call;
 global.fetch=async(url,options)=>{call={url,...options};return {ok:true,text:async()=>'{"id":1}'};};
 try {assert.deepEqual(await createApi('abc')('/clientes/1','PATCH',{nombre:'Ana'}),{id:1});
 assert.equal(call.url,'http://test:3000/clientes/1');assert.equal(call.method,'PATCH');assert.equal(call.headers.Authorization,'Bearer abc');assert.equal(JSON.parse(call.body).nombre,'Ana');}
 finally {global.fetch=original;}
});
test('401 cierra sesión y conserva mensajes de validación',async()=>{
 const original=global.fetch;let expired=false;
 global.fetch=async()=>({ok:false,status:401,text:async()=>JSON.stringify({message:['Sesión vencida']})});
 try {await assert.rejects(createApi('abc',()=>expired=true)('/clientes'),/Sesión vencida/);assert.equal(expired,true);}finally{global.fetch=original;}
});
test('Mascota: campos permitidos y URL de foto',()=>{
 const body=petBody({nombre:'Dogo',especie:'Perro',clientesId:'3',id:99,cliente:{}},null);
 assert.equal(body.clientesId,3);assert.equal('id' in body,false);assert.equal('cliente' in body,false);
 assert.equal(photoUrl('a b.jpg'),'http://test:3000/uploads/mascotas/a%20b.jpg');
});
test('Foto nativa: archivo legible y sin cabecera multipart manual',async()=>{
 const OriginalForm=global.FormData, originalFetch=global.fetch;
 class NativeForm { entries=[];append(key,value){this.entries.push([key,value]);} }
 global.FormData=NativeForm;let call;
 global.fetch=async(url,options)=>{call=options;return {ok:true,text:async()=>'{}'};};
 try{const body=petBody({nombre:'Dogo',especie:'Perro',clientesId:'2'},{uri:'file:///foto.jpg',file:photoFile('mascota.jpg','image/jpeg')});
 assert.equal(body.entries.find(([k])=>k==='foto')[1].name,'mascota.jpg');assert.equal(typeof body.entries.find(([k])=>k==='foto')[1].bytes,'function');
 await createApi('abc')('/mascotas','POST',body);assert.equal(call.headers['Content-Type'],undefined);assert.equal(call.body,body);
 }finally{global.FormData=OriginalForm;global.fetch=originalFetch;}
});

test('Cliente: conserva foto existente y excluye campos de cuenta', () => {
 const body=clientBody({nombre:' Ana ',apellido:' Pérez ',foto:'anterior.jpg',id:9,rol:'admin',usuario_id:1},null);
 assert.equal(body.nombre,'Ana');assert.equal(body.foto,'anterior.jpg');
 assert.equal('id' in body,false);assert.equal('rol' in body,false);assert.equal('usuario_id' in body,false);
 assert.equal(photoUrl('cliente.jpg','clientes'),'http://test:3000/uploads/clientes/cliente.jpg');
});
test('Cliente: nueva foto reemplaza referencia anterior en multipart', async () => {
 const OriginalForm=global.FormData,originalFetch=global.fetch;
 class NativeForm { entries=[];append(key,value){this.entries.push([key,value]);} }
 global.FormData=NativeForm;let call;
 global.fetch=async(url,options)=>{call={url,...options};return {ok:true,text:async()=>'{}'};};
 try {
  const body=clientBody({nombre:'Ana',foto:'anterior.jpg'},{uri:'file:///captura.png',file:photoFile('cliente.png','image/png')});
  const photos=body.entries.filter(([key])=>key==='foto');assert.equal(photos.length,1);
  assert.equal(photos[0][1].name,'cliente.png');assert.equal(typeof photos[0][1].bytes,'function');
  await createApi('abc')('/clientes/2','PATCH',body);assert.equal(call.url,'http://test:3000/clientes/2');assert.equal(call.method,'PATCH');assert.equal(call.headers['Content-Type'],undefined);
 } finally {global.FormData=OriginalForm;global.fetch=originalFetch;}
});
test('Referencias de fotos existentes: URL completa y ruta uploads',()=>{
 assert.equal(photoUrl('https://example.com/foto.jpg','clientes'),'https://example.com/foto.jpg');
 assert.equal(photoUrl('/uploads/clientes/foto.jpg','clientes'),'http://test:3000/uploads/clientes/foto.jpg');
 assert.equal(photoUrl(null,'clientes'),null);
});

function photoFile(name,type) { return {name,type,bytes:async()=>new Uint8Array([255,216,255,217])}; }

// Se usa el serializador instalado de Expo, sustituyendo solamente el lector de Blob nativo.
test('Expo SDK: reproduce el fallo URI y serializa fotos de ambos formularios', async()=>{
 const ts=await import('typescript');
 const raw=await readFile(new URL('../node_modules/expo/src/winter/fetch/convertFormData.ts',import.meta.url),'utf8');
 const nativeFree=raw.replace(/import \{ blobToArrayBufferAsync \} from [^;]+;/, 'const blobToArrayBufferAsync = async (blob) => blob.arrayBuffer();');
 const compiled=ts.transpileModule(nativeFree,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 const {convertFormDataAsync}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
 const OriginalForm=global.FormData;
 class ExpoForm { parts=[]; append(key,value){this.parts.push([key,value]);} entries(){return this.parts.values();} }
 global.FormData=ExpoForm;
 try {
  const old=new ExpoForm();old.append('foto',{uri:'file:///foto.jpg',name:'foto.jpg',type:'image/jpeg'});
  await assert.rejects(convertFormDataAsync(old),/Unsupported FormDataPart implementation/);
  for(const build of [petBody,clientBody]) {
   const file=photoFile('foto.jpg','image/jpeg');
   const form=build({nombre:'Ana',clientesId:'2',foto:'anterior.jpg'},{uri:'file:///foto.jpg',file});
   const result=await convertFormDataAsync(form,'testBoundary');
   const body=Buffer.from(result.body);
   assert.match(body.toString(),/name="foto"; filename="foto.jpg"/);
   assert.match(body.toString(),/content-type: image\/jpeg/);
   assert.ok(body.includes(Buffer.from(await file.bytes())));
   assert.equal(form.parts.filter(([key])=>key==='foto').length,1);
  }
 } finally {global.FormData=OriginalForm;}
});
