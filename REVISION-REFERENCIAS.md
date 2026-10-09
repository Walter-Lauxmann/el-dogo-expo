# Revisión del material de clase y la migración

Los cuatro apuntes Word y veterinaria.sql ya están disponibles en la raíz del proyecto. Esta revisión distingue tu pedido de migrar a Expo, los requisitos del análisis, las propuestas didácticas y la implementación existente. No se ejecutó ni importó el SQL.

## Pedido y referencias
Tu pedido es conservar la web y crear una app Expo que integre el backend compatible. El frontend existente apunta a NestJS mediante /auth/login con email y passwordPlain. Por eso se mantiene NestJS como integración.

Análisis-Veterinaria.docx contiene login, gestión de clientes, gestión de mascotas, relación dueño-mascotas y cambio de dueño. También propone una arquitectura inicial con Firebase. Esa propuesta no reemplaza automáticamente tu pedido ni los backends reales. Las citas aparecen como ampliación futura. La baja lógica del cliente es una recomendación explícita del analista.

Introducción a React.docx presenta aprendizaje por etapas: componentes, JSX, estado, eventos, props, listas, formularios, seguridad simulada, persistencia, rutas, contexto y estilos. Estos conceptos se conservan; HTML, CSS, localStorage y React Router requieren equivalentes móviles. Los ejercicios y preguntas del apunte son material didáctico, no instrucciones para ejecutar cambios en tu computadora.

Autenticación y encriptación - REACT.docx desarrolla JWT, token Bearer, persistencia de sesión, rutas protegidas, login y logout. Combina referencias a Express y ejemplos /auth/login y PATCH. La app Expo adapta persistencia a SecureStore y navegación a Expo Router, respetando el contrato real de NestJS.

Subir imágenes y archivos -front.docx explica FormData y almacenar referencias de fotos en MySQL. En móvil la selección viene de Expo ImagePicker y el archivo se envía como URI, nombre y tipo MIME; el servidor conserva el archivo y la base guarda su nombre.

## Diferencias funcionales que quedan identificadas
- El análisis pide buscar clientes por nombre, documento o teléfono; la app actual busca por nombre y apellido.
- El análisis menciona edad o fecha de nacimiento. No existe ese campo en el SQL ni en la entidad actual de mascotas. Implementarlo requiere definir el campo y una migración.
- El análisis admite DNI/CUIT; la app y el DTO actual limitan documento a 7–10 caracteres. Un CUIT de 11 dígitos necesita ampliar el contrato y la columna.
- El correo es opcional en el análisis, pero el DTO de NestJS y el formulario móvil lo exigen.
- Cambiar el dueño ya puede hacerse al editar una mascota. Falta la presentación específica con dueño actual, nuevo dueño y confirmación que describe el análisis.
- La baja lógica de clientes se recomienda para conservar historial; el backend actual elimina físicamente. Debe definirse la política antes de modificar datos persistentes.

## Revisión del SQL actualizado
El usuario confirmó que el primer volcado era antiguo y lo reemplazó. El archivo veterinaria.sql de la raíz, revisado el 8 de octubre de 2026, contiene clientes, mascotas y usuarios.

La tabla usuarios tiene id, email único, password, rol y created_at, coincidiendo con los campos que usa la autenticación de NestJS. Clientes ya no exige usuario, password ni rol; contiene usuario_id, que admite NULL. Así, el alta de un cliente no necesita crear una cuenta de acceso.

Mascotas conserva nombre, especie, raza, foto, historia_clinica y clientes_id. NestJS expone esta última columna como clientesId; la app móvil ya envía ese nombre. Los servicios agregan valores vacíos a foto e historia al crear cuando no se proporcionan.

La incompatibilidad principal del volcado antiguo queda resuelta en el archivo nuevo. La revisión no implica que este archivo haya sido importado ni demuestra cuál es el esquema de la instancia MySQL en ejecución. No se ejecutó SQL ni se alteró la base.

Observaciones de mapeo: Cliente no expone usuario_id, por lo que la app no administra ese vínculo opcional. Algunos tipos de metadatos de las entidades (por ejemplo bigint sin unsigned y el tipo de historia_clinica) no reproducen exactamente el DDL; synchronize:false evita sincronización automática. La lectura del archivo no permite confirmar por sí sola el comportamiento de la base en ejecución.

El SQL sigue sin edad/fecha de nacimiento ni una marca de baja lógica; esos requisitos y recomendaciones del análisis continúan identificados en el apartado anterior.

## Validación existente
La app pasó pruebas simuladas del servicio, lint, revisión configurada de JavaScript con TypeScript y exportación Android; NestJS compiló. El puerto 3000 no estaba escuchando en la comprobación anterior. Esto todavía no verifica login, escritura de datos ni uso en Expo Go.
