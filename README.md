# Veterinaria El Dogo · React Native con Expo

La app móvil está en una carpeta independiente. El frontend web en ../el-dogo-react y Express se conservaron. Se integra NestJS: la web usa localhost:3000, /auth/login y passwordPlain, que coinciden con sus controladores.

## Paso 1: entender la migración
React conserva componentes, estado y efectos. React Native cambia la interfaz: div → View; texto → Text; input → TextInput; button → Pressable; CSS/Tailwind → StyleSheet. src/app contiene una pantalla por ruta; src/components reúne componentes reutilizables; src/context/VeterinariaContext.jsx comparte sesión y datos; src/api.js centraliza la comunicación con NestJS. Expo Router define las pantallas en src/app y conserva la sesión en el layout. El botón Atrás vuelve por el historial de rutas.

## Paso 2: iniciar el backend
En otra terminal:

    cd C:\wamp64\www\react\veterinaria\backend-nest
    npm run start:dev

MySQL debe estar iniciado y configurado según app.module.ts. No se crearon usuarios ni se importó SQL. Usá un usuario existente. No ejecutes simultáneamente otro servidor en el puerto 3000.

## Paso 3: conectar el teléfono
La configuración local .env contiene EXPO_PUBLIC_API_URL=http://192.168.1.11:3000, IP Wi-Fi detectada el 8 de octubre de 2026. Si cambia la IP, actualizá ese archivo. El teléfono y la computadora deben estar en la misma red. Desde el navegador del teléfono, abrí http://192.168.1.11:3000 para comprobar acceso al servidor.

localhost en el teléfono apunta al teléfono. Para un emulador Android usar http://10.0.2.2:3000. Esta variable contiene una URL pública, nunca claves o contraseñas. .env está excluido de Git.

## Paso 4: ejecutar Expo Go

    cd C:\wamp64\www\react\veterinaria\el-dogo-expo
    npm start

Abrí Expo Go y escaneá el QR. La plantilla oficial descargada usa Expo SDK 57, React 19.2.3 y React Native 0.86.3. Expo Go debe ser compatible con ese SDK. Si cambiás .env, reiniciá Expo. Las instrucciones de iOS y Android usan la misma app; no se configuró una nueva versión web.

## Paso 5: sesión, datos e imágenes
El login envía email y passwordPlain. SecureStore guarda token y usuario en Android/iOS. Cada petición agrega Authorization: Bearer. Un 401 cierra la sesión. Las cargas tienen tiempo límite y los errores se muestran sin vaciar formularios.

Clientes: listado, búsqueda, alta, edición, eliminación y detalle con mascotas. Los campos se ajustaron a la entidad real: nombre, apellido, documento, direccion, localidad, telefono, email y foto opcional. Los IDs los genera MySQL. Admin/veterinario pueden crear y editar clientes; admin puede eliminarlos, según las reglas existentes del backend.

Mascotas: listado, búsqueda, alta, edición, eliminación, dueño, historia clínica y fotos de galería o tomadas con la cámara. El selector devuelve una URI; se crea un File de expo-file-system y petBody/clientBody lo agregan a FormData. Expo SDK 57 lee sus bytes; el objeto antiguo {uri,name,type} produce Unsupported FormDataPart implementation. No se fuerza Content-Type multipart: el cliente genera su separador. Las actualizaciones usan PATCH, como NestJS, y no envían id ni la relación cliente dentro del cuerpo. El detalle usa clientesId y compara IDs como texto para admitir bigint.

Ajustes: datos de sesión y cierre de sesión. La gestión de usuarios sigue en construcción, igual que en la web.

## Paso 6: cambios puntuales en NestJS
- CreateClienteDto ya no exige usuario/password/rol, que no pertenecen a la entidad Cliente. La foto es opcional.
- CreateMascotaDto convierte clientesId a número y lo valida como entero positivo; foto e historia son texto opcional.
- Los servicios agregan valores vacíos para foto/historia solamente al crear. Editar sin foto conserva la existente.
- ValidationPipe aplica transformaciones.
- PATCH mascotas acepta archivos con el mismo almacenamiento de POST. Se cambiaron dos imports de alias a rutas relativas para la ejecución compilada.

No se cambió la base de datos, el frontend web ni Express.

## Paso 7: verificaciones

    npm test
    npm run lint
    npm run typecheck
    npx expo export --platform android --output-dir dist

Siete pruebas del servicio verifican token y PATCH, vencimiento de sesión, campos permitidos, URL de foto y multipart nativo. Son pruebas con respuestas simuladas. Lint terminó sin errores; TypeScript completó la revisión configurada para JavaScript. Expo confirmó que las dependencias finales están actualizadas y son compatibles con el SDK. NestJS compiló con npm run build. Expo exportó el bundle Android: esto verifica compilación, no instala un APK ni prueba un dispositivo.

Prueba manual pendiente: login real; crear/editar cliente; crear mascota con foto; cambiar foto; abrir dueño y mascotas; probar permisos y errores; cerrar sesión y reabrir. El puerto 3000 no tenía servidor escuchando al comprobarlo. La ejecución móvil y MySQL requieren verificación real. iOS no se probó.

La instalación informó 28 alertas de dependencias (10 moderadas, 18 altas). El informe propone también degradaciones incompatibles de Expo/React Native; no se aplicó audit fix --force. Revisar actualizaciones compatibles antes de publicar.

## Material de referencia
Los cuatro apuntes Word y veterinaria.sql fueron copiados a la raíz del proyecto y ya pudieron revisarse. Consultá REVISION-REFERENCIAS.md: el SQL actualizado contiene usuarios y separa las credenciales de clientes, resolviendo la incompatibilidad del volcado anterior. Falta verificar login y altas contra MySQL en ejecución. No se importó SQL ni se modificó MySQL.

Documentación técnica: https://docs.expo.dev/versions/latest/ · https://docs.expo.dev/versions/latest/sdk/securestore/ · https://docs.expo.dev/versions/latest/sdk/imagepicker/

## Instrucciones de la plantilla
AGENTS.md fue agregado por create-expo-app. Exige Expo Router, documentación de la versión instalada, lint y revisión con TypeScript. Se incorporó Router y se usa JavaScript; typecheck revisa el proyecto sin comprobación estricta de tipos JavaScript (checkJs:false).

## Fotos de clientes y mascotas

Al crear o editar una ficha aparecen Elegir de la galería y Tomar foto. La cámara pide autorización del dispositivo. Una vista previa permite revisar la imagen antes de Guardar; Descartar nueva foto conserva la anterior. Cancelar la cámara no reemplaza una selección ya hecha.

Las fotos de clientes se muestran en la lista y en el detalle, y las de mascotas en sus tarjetas. Las referencias antiguas o imágenes ausentes muestran un marcador. Se aceptan fotos de hasta 10 MB. El backend crea uploads/clientes y uploads/mascotas automáticamente al recibir archivos. MySQL sigue usando la columna foto existente; no se modificó el esquema.

Para probar los cambios, reiniciá NestJS si no está en modo watch y recargá la app en Expo Go. Si la cámara está bloqueada, habilitá el permiso de Expo Go desde los ajustes del teléfono. Las versiones instaladas fuera de Expo Go deben recompilarse para aplicar el nuevo permiso nativo.

El usuario confirmó que la app y el login funcionan en el dispositivo. La nueva captura con cámara todavía requiere una prueba en el teléfono; la generación del bundle no accede a la cámara real.

Prueba manual: crear y editar un cliente con foto de galería y cámara; repetir con una mascota; descartar selección; cancelar la cámara; denegar permiso; guardar una edición sin nueva foto y comprobar que la anterior continúa visible.

Verificación de fotos: siete pruebas del servicio móvil y ocho pruebas de integración de NestJS aprobaron. Las pruebas de NestJS envían imágenes a los controladores, verifican almacenamiento y acceso por URL, conservación de foto al editar sin archivo y rechazo de formatos no admitidos; usan servicios simulados, sin MySQL. Lint, revisión configurada con TypeScript, compilación de NestJS y exportación Android también aprobaron.

    cd C:\wamp64\www\react\veterinaria\backend-nest
    npm run test:e2e -- --runInBand photo-upload

## Corrección de fotos en Expo Go

Los controles de galería y cámara están al inicio del formulario. Se agregó expo-file-system como dependencia directa y se envía File en multipart para el fetch de Expo SDK 57. Una prueba usa el serializador instalado de Expo: reproduce el error del objeto URI antiguo y verifica los bytes de fotos de clientes y mascotas.

Detené Expo con Ctrl+C y ejecutá `npx expo start --clear` dentro de el-dogo-expo. Cerrá y abrí Expo Go y escaneá el QR de esa terminal para cargar esta versión. La captura y subida reales requieren comprobación en el teléfono.

## Código modular para las clases

Consultá GUIA-PARA-CLASES.md para recorrer la app paso a paso y comparar cada módulo con su equivalente en el proyecto React web. MobileApp.jsx fue reemplazado por rutas y componentes independientes.
