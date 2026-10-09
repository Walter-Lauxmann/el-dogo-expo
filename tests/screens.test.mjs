import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url);
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const ts=require('typescript');
const src=fileURLToPath(new URL('../src/',import.meta.url));
let state;
let params={id:'1'};
const native={
 View:({children})=>React.createElement('div',null,children),
 Text:({children})=>React.createElement('span',null,children),
 Pressable:({children})=>React.createElement('button',null,children),
 TextInput:({value})=>React.createElement('input',{value,readOnly:true}),
 Image:({accessibilityLabel})=>React.createElement('img',{alt:accessibilityLabel}),
 ActivityIndicator:()=>React.createElement('span',null,'Cargando sesión'),
 StyleSheet:{create:value=>value},
};
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file);
 const source=readFileSync(file,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};cache.set(file,module.exports);
 function localRequire(spec){
  if(spec==='react-native')return native;
  if(spec==='expo-router')return {router:{push(){},back(){},replace(){}},useLocalSearchParams:()=>params,Redirect:({href})=>React.createElement('span',null,'Redirigir '+href)};
  if(spec.includes('context/VeterinariaContext'))return {useVeterinaria:()=>state};
  if(!spec.startsWith('.'))return require(spec);
  let next=path.resolve(path.dirname(file),spec);
  if(!path.extname(next)){try{readFileSync(next+'.jsx');next+='.jsx';}catch{next+='.js';}}
  return load(next);
 }
 new Function('require','module','exports',js)(localRequire,module,module.exports);
 cache.set(file,module.exports);return module.exports;
}
function render(route){return renderToStaticMarkup(React.createElement(load(path.join(src,'app',route+'.jsx')).default));}
const noop=()=>{};
function signedIn(){return {session:{user:{rol:'admin',email:'ana@example.com'}},restoring:false,busy:false,loading:false,
 clientes:[{id:1,nombre:'Ana',apellido:'Pérez'}],mascotas:[{id:2,nombre:'Dogo',especie:'Perro',clientesId:1}],
 form:{kind:'mascotas',values:{nombre:'Dogo',clientesId:'1'}},photo:null,
 refresh:noop,openForm:noop,remove:noop,setForm:noop,setPhoto:noop,choosePhoto:noop,save:noop,logout:noop,login:noop};}
test('Rutas privadas: esperan sesión y redirigen al login sin credenciales',()=>{
 for(const route of ['clientes','mascotas','formulario','config','cliente/[id]']){
  state={...signedIn(),session:null,restoring:true};assert.match(render(route),/Cargando sesión/);
  state={...signedIn(),session:null};assert.match(render(route),/Redirigir \/</);
 }
});
test('Pantallas separadas: listas, detalle, formulario y ajustes',()=>{
 state=signedIn();assert.match(render('clientes'),/Ana/);assert.match(render('mascotas'),/Dogo/);
 assert.ok(render('cliente/[id]').replace(/<[^>]*>/g,'').includes('Mascotas (1)'));
 const petForm=render('formulario');assert.match(petForm,/Tomar foto/);assert.match(petForm,/Elegir de la galería/);assert.match(petForm,/Dueño/);
 state.form={kind:'clientes',values:{nombre:'Ana'}};
 const clientForm=render('formulario');assert.match(clientForm,/Apellido/);assert.match(clientForm,/Tomar foto/);assert.doesNotMatch(clientForm,/Dueño/);
 assert.match(render('config'),/Cerrar sesión/);
});
test('Login y rutas sin ficha: muestran el estado correspondiente',()=>{
 state={...signedIn(),session:null};assert.match(render('index'),/Iniciar sesión/);
 state=signedIn();assert.match(render('index'),/Redirigir \/clientes/);
 state.form=null;assert.match(render('formulario'),/Redirigir \/clientes/);
 params={id:'999'};assert.match(render('cliente/[id]'),/Cliente no encontrado/);params={id:'1'};
});
