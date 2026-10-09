# Recorrido de React web a React Native

La app conserva login, permisos por rol, clientes, mascotas y fotos. Cada archivo de src/app contiene la pantalla correspondiente, sin un componente gigante que elija qué mostrar según la URL.

## Correspondencias con el proyecto web

| React web (el-dogo-react/src) | React Native (el-dogo-expo/src) | Responsabilidad |
| --- | --- | --- |
| App.jsx y main.jsx | app/_layout.jsx | Contenedor, proveedor y ruta actual |
| VistaLogin.jsx y Login.jsx | app/index.jsx | Campos y acción de ingreso |
| VistaClientes.jsx | app/clientes.jsx | Búsqueda y listado de clientes |
| ClienteItem.jsx | components/ClientCard.jsx | Una tarjeta de cliente |
| VistaMascotas.jsx | app/mascotas.jsx | Búsqueda y listado de mascotas |
| MascotaItem.jsx | components/PetCard.jsx | Una tarjeta de mascota |
| VistaDetalleCliente.jsx | app/cliente/[id].jsx | Leer el ID y mostrar sus mascotas |
| FormularioCliente.jsx | components/FormularioCliente.jsx | Campos de cliente |
| FormularioMascota.jsx | components/FormularioMascota.jsx | Campos de mascota y selección del dueño |
| Pantallas de formulario | app/formulario.jsx | Componer campos, foto, guardar y cancelar |
| Navegacion.jsx | components/Navigation.jsx | Cambiar entre rutas |
| RutaProtegida.jsx | hooks/useProtectedRoute.jsx | Redirigir a login sin sesión |
| VistaConfiguracion.jsx | app/config.jsx | Ajustes y cierre de sesión |
| AutenticacionProvider y VeterinariaProvider | context/VeterinariaContext.jsx | Sesión, carga de datos y operaciones compartidas |
| Carpeta api | api.js | Peticiones HTTP y cuerpos JSON/multipart |
| CSS y módulos CSS | styles/common.js | Estilos mediante StyleSheet |

Los nombres de la columna web pertenecen a components, salvo donde se indica otra carpeta. En esta app móvil un solo proveedor comparte autenticación y datos; no es una copia uno a uno de los dos proveedores de la web.

## 1. Comenzar por el layout

Abrí src/app/_layout.jsx. RootLayout monta SafeAreaProvider y VeterinariaProvider. AppContent muestra el encabezado, la navegación y Slot. Slot es el espacio donde Expo Router coloca la pantalla actual y permanece montado. Cada pantalla privada llama useProtectedRoute: espera la restauración y redirige al login si falta sesión.

Las rutas se definen por los archivos: index.jsx es /, clientes.jsx es /clientes, mascotas.jsx es /mascotas y cliente/[id].jsx recibe un ID variable. Referencia: https://docs.expo.dev/router/introduction/

## 2. Mostrar cómo se inicia sesión

Abrí src/app/index.jsx. email y password son estados locales de la pantalla, igual que en un formulario React. Field recibe value y onChange; Button recibe onPress. Al pulsarlo, login(email,password) del contexto envía las credenciales.

En el contexto, SecureStore guarda la sesión en el teléfono y un efecto la recupera al abrir la app. createApi agrega el token. Un error 401 ejecuta logout. Al ingresar se navega a /clientes.

## 3. Recorrer una lista

Abrí src/app/clientes.jsx: obtiene clientes del contexto, mantiene search local, filtra la lista y usa map para renderizar ClientCard. Cada tarjeta recibe cliente por props y usa su ID como key. Después compará mascotas.jsx: repite el mismo patrón con PetCard. ListToolbar reúne actualizar, buscar y crear.

## 4. Seguir una edición de principio a fin

1. ClientCard llama openForm("clientes", cliente).
2. El proveedor copia los campos permitidos al estado form y navega a /formulario.
3. formulario.jsx compone PhotoPicker y FormularioCliente o FormularioMascota.
4. Cada Field cambia un campo conservando los demás con el operador spread.
5. Guardar llama save del contexto: valida, prepara el cuerpo y envía POST al crear o PATCH al editar.
6. Si termina bien, se limpia la selección, se recargan los datos y se vuelve con router.back(). Si falla, el formulario conserva sus valores.

La ficha del formulario se comparte porque se prepara desde varias pantallas. Los textos de login y búsqueda son locales porque sólo los usa una pantalla.

## 5. Explicar las fotos como función del dispositivo

PhotoPicker muestra vista previa y botones. hooks/usePhoto.js contiene el permiso de cámara y los selectores de ImagePicker. El resultado conserva su URI para mostrarlo y un File de expo-file-system para enviarlo. api.js agrega ese File a FormData; Expo lee los bytes. Un objeto antiguo {uri,name,type} no funciona con el fetch de este SDK.

Sin una nueva foto se envía JSON y se conserva la imagen anterior. RecordPhoto muestra una imagen o el marcador cuando no hay una disponible. Los nombres guardados se convierten en URLs con photoUrl.

## 6. Comparar los elementos visuales

| Web | Móvil |
| --- | --- |
| div | View |
| p, span y títulos | Text |
| input | TextInput |
| button y onClick | Pressable y onPress |
| img | Image con source={{uri}} |
| CSS | StyleSheet y prop style |
| Área desplazable | ScrollView |

Button, Field y RecordPhoto son componentes pequeños para mostrar props y reutilización. constants/fields.js reúne campos y etiquetas; styles/common.js reúne los estilos compartidos.

## 7. Verificar la reorganización

Ejecutar npm test, npm run lint, npm run typecheck y npx expo export --platform android --output-dir dist. La exportación verifica imports y compilación; no reemplaza las pruebas en el teléfono.

En Expo Go recorrer login, clientes, mascotas, detalle, alta/edición, cámara y galería, guardar, cancelar, botón Atrás y cierre de sesión. El backend y los formatos de peticiones siguen siendo los mismos.

Las pruebas de pantallas renderizan los módulos separados con primitivas móviles simuladas: verifican el acceso privado, los listados, el detalle y los controles de formulario. No ejecutan la cámara ni las interacciones nativas.
