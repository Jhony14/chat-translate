![Node.js Version](https://img.shields.io/badge/node-20.0.0-brightgreen)

# Proyecto de Chat Multilenguaje con Node.js

Este es un proyecto de chat multilenguaje realizado con Node.js, Express y Socket.io. Permite a los usuarios de diferentes lenguajes comunicarse entre sí a través de un chat global. Cada mensaje que se envía se traduce automáticamente al idioma preferido del usuario.

## Funcionalidades

- **Registro e inicio de sesión de usuario. (Pendiente de Publicación)**
- Los usuarios pueden enviar mensajes en su propio idioma.
- Los mensajes se traducen automáticamente al idioma preferido del receptor.
- Todos los mensajes de un usuario se guardan en su historial de chat.

## Instalación y Configuración

Clona el repositorio en tu máquina local usando `git clone`.

### Prerrequisitos

Necesitas tener Node.js y npm instalados en tu máquina. Puedes descargarlos desde [aquí](https://nodejs.org/).

### Instalación

1. Navega a la carpeta donde clonaste el proyecto.

2. Instala las dependencias del proyecto con npm:
    ```shell
    npm install
    ```
   
3. Crear un archivo `.env` en el directorio raíz del proyecto. Este archivo debe contener las siguientes variables de entorno:
    ```shell
    DB_HOST=<tu_host_de_mongodb>
    DB_USER=<tu_usuario_de_mongodb>
    DB_PASSWORD=<tu_contraseña_de_mongodb>
    API_TRANSLATE=<tu_api_key_de_deepl>
    ```

4. Iniciar el servidor:
    ```shell
    node server.js
    ```

El servidor ahora debería estar corriendo en `localhost:3000`.

## Uso

1. Abre tu navegador y ve a `http://localhost:3000/`.
2. Si es tu primera vez usando el chat, haz click en 'Registrarse' para crear una cuenta.
3. Ingresa tu email, nombre de usuario y contraseña y haz click en 'Registrarse'.
4. Serás redirigido a la página principal. Aquí puedes enviar y recibir mensajes que serán automáticamente traducidos a tu idioma preferido.

## Tecnologías Utilizadas

- Backend: Node.js, Express
- Autenticación: Passport, bcrypt
- Base de Datos: MongoDB, mongoose
- WebSocket: Socket.io
- Traducción: API de DeepL
- Frontend: HTML, CSS, JavaScript
