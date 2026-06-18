# Conexiones del proyecto GymApp

Este documento resume como se conecta todo el proyecto: frontend, backend, API, base de datos, login, autenticacion, rutas protegidas y servicios principales.

## 1. Estructura general

El proyecto esta dividido en dos partes principales:

```txt
gym_app/
  backend/   API hecha con Laravel
  frontend/  App hecha con Expo / React Native
  docs/      Documentacion del proyecto
```

El flujo general de una accion en la app es:

```txt
Pantalla React Native
  -> service del frontend
  -> apiClient de Axios
  -> endpoint Laravel
  -> controller Laravel
  -> modelo Eloquent
  -> base de datos MySQL
  -> Resource JSON
  -> respuesta al frontend
```

Ejemplo real con login:

```txt
LoginScreen
  -> AuthContext.login()
  -> loginRequest()
  -> POST /api/v1/auth/login
  -> AuthController@login
  -> tabla users
  -> token Sanctum
  -> AsyncStorage
```

## 2. Endpoint base de la API

El endpoint base que usa el frontend es:

```txt
http://localhost:8000
```

Los endpoints del backend cuelgan de:

```txt
http://localhost:8000/api/v1
```

Por ejemplo:

```txt
POST http://localhost:8000/api/v1/auth/login
GET  http://localhost:8000/api/v1/auth/me
GET  http://localhost:8000/api/v1/routines
```

La URL se configura en el frontend en:

```txt
frontend/.env
```

Con este valor:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

Tambien se resuelve desde:

```txt
frontend/src/constants/index.ts
```

Alli se define `API_BASE_URL`. Si no hay variable configurada o se usa `auto`, la app intenta calcular la URL automaticamente, especialmente cuando corre en Expo.

## 3. Como se conecta el frontend con el backend

El cliente HTTP principal esta en:

```txt
frontend/src/services/api/client.ts
```

Ese archivo crea un cliente Axios:

```ts
export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
```

Ese cliente es el punto central por donde pasan casi todas las llamadas a la API.

Antes de cada request, el interceptor agrega:

```txt
X-Client-Platform
X-Client-Version
Authorization: Bearer TOKEN
```

El token solo se agrega si existe una sesion guardada.

El interceptor no agrega token en login ni logout:

```txt
/api/v1/auth/login
/api/v1/auth/logout
```

Eso tiene sentido porque para iniciar sesion todavia no hay token.

## 4. Servicios del frontend

El frontend no llama normalmente a Axios directamente desde las pantallas. En su lugar usa servicios.

Principales servicios:

```txt
frontend/src/services/auth/auth.service.ts
frontend/src/services/routines.service.ts
frontend/src/services/exercises.service.ts
frontend/src/services/muscles.service.ts
frontend/src/services/weekly-progress.service.ts
frontend/src/services/admin.service.ts
```

Estos services son una capa intermedia:

```txt
Pantalla -> service -> apiClient -> API Laravel
```

Ejemplo en rutinas:

```ts
export async function fetchRoutines() {
  const response = await apiClient.get('/api/v1/routines');
  return normalizeCollectionResponse(response.data);
}
```

Esto permite que las pantallas no tengan que saber detalles de Axios o de la estructura exacta de la respuesta.

## 5. Rutas principales del backend

Las rutas del backend estan en:

```txt
backend/routes/api.php
```

Todas las rutas estan agrupadas bajo:

```php
Route::prefix('v1')->group(...)
```

Por eso todas empiezan con:

```txt
/api/v1
```

## 6. Login y autenticacion

### Endpoint de login

```txt
POST /api/v1/auth/login
```

Archivo del frontend que llama al login:

```txt
frontend/src/services/auth/auth.service.ts
```

Funcion:

```ts
loginRequest(payload)
```

Hace esta llamada:

```ts
apiClient.post('/api/v1/auth/login', payload)
```

Archivo del backend que recibe el login:

```txt
backend/app/Http/Controllers/Api/V1/AuthController.php
```

Metodo:

```php
login(LoginRequest $request)
```

### Que hace el backend al iniciar sesion

El login hace este proceso:

1. Valida los datos enviados.
2. Revisa si hay demasiados intentos fallidos.
3. Busca el usuario por credenciales.
4. Verifica que el usuario este activo con `is_active = true`.
5. Sincroniza estado de membresia antes del login.
6. Si las credenciales son correctas, carga relaciones del usuario:

```php
$user->load('role', 'latestMembership', 'routines.days');
```

7. Borra tokens anteriores:

```php
$user->tokens()->delete();
```

8. Crea un token nuevo con Laravel Sanctum:

```php
$user->createToken(...)->plainTextToken;
```

9. Devuelve usuario, token y fecha de expiracion.

Respuesta esperada:

```json
{
  "message": "Inicio de sesion correcto.",
  "data": {
    "user": {},
    "token": "TOKEN_GENERADO",
    "expires_at": null
  }
}
```

### Donde se guarda la sesion en el frontend

La sesion se guarda en:

```txt
frontend/src/services/auth/storage.ts
```

Usa AsyncStorage con estas llaves:

```ts
@gymapp/auth/token
@gymapp/auth/user
```

Esto permite que al cerrar y abrir la app, el usuario siga autenticado si el token sigue siendo valido.

## 7. AuthContext

El estado global de autenticacion esta en:

```txt
frontend/src/context/AuthContext.tsx
```

Este contexto guarda:

```ts
user
token
loading
isAuthenticated
```

Tambien expone funciones:

```ts
login()
logout()
refreshSession()
updateProfile()
```

Cuando la app inicia, `AuthProvider` ejecuta:

```ts
refreshSession()
```

Ese metodo:

1. Lee token y usuario guardados en AsyncStorage.
2. Si hay token, llama a:

```txt
GET /api/v1/auth/me
```

3. Actualiza el usuario guardado.
4. Marca la sesion como autenticada.

## 8. Rutas publicas

Estas rutas no requieren token:

```txt
POST /api/v1/auth/login

GET /api/v1/muscles
GET /api/v1/muscles/{muscle}
GET /api/v1/muscles/{muscle}/exercises

GET /api/v1/exercises/search
GET /api/v1/exercises
GET /api/v1/exercises/{exercise}
```

Sirven para login, catalogo de musculos y catalogo de ejercicios.

## 9. Rutas protegidas para usuarios autenticados

Estas rutas requieren:

```php
auth:sanctum
account.active
```

Endpoints:

```txt
GET  /api/v1/auth/me
PUT  /api/v1/auth/me
POST /api/v1/auth/me
POST /api/v1/auth/logout

GET /api/v1/weekly-progress
PUT /api/v1/weekly-progress

GET    /api/v1/routines
POST   /api/v1/routines
GET    /api/v1/routines/{routine}
PUT    /api/v1/routines/{routine}
DELETE /api/v1/routines/{routine}
```

`auth:sanctum` valida el token.

`account.active` valida que la cuenta siga activa.

## 10. Rutas de administrador

Estas rutas requieren:

```php
auth:sanctum
account.active
role:admin
```

Endpoints:

```txt
GET    /api/v1/admin/users
POST   /api/v1/admin/users
GET    /api/v1/admin/users/{user}
PUT    /api/v1/admin/users/{user}
DELETE /api/v1/admin/users/{user}

GET /api/v1/admin/users/{user}/weekly-progress

GET  /api/v1/admin/memberships
POST /api/v1/admin/memberships
GET  /api/v1/admin/memberships/upcoming
PUT  /api/v1/admin/memberships/{membership}

GET    /api/v1/admin/membership-types
POST   /api/v1/admin/membership-types
GET    /api/v1/admin/membership-types/{membership_type}
PUT    /api/v1/admin/membership-types/{membership_type}
DELETE /api/v1/admin/membership-types/{membership_type}

POST /api/v1/admin/exercises/sync
```

`role:admin` evita que un usuario normal pueda entrar a acciones administrativas.

## 11. Conexion con base de datos

La configuracion de base de datos esta en:

```txt
backend/.env
```

Valores actuales:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gym_app
DB_USERNAME=root
DB_PASSWORD=
```

Esto significa:

```txt
Motor: MySQL
Servidor: local
Puerto: 3306
Base de datos: gym_app
Usuario: root
Password: vacio
```

Laravel usa esa configuracion desde:

```txt
backend/config/database.php
```

## 12. Tablas principales

Las tablas se crean desde las migraciones en:

```txt
backend/database/migrations
```

Tablas importantes:

```txt
roles
users
personal_access_tokens
muscles
exercises
routines
routine_exercises
memberships
membership_types
days
routine_days
workout_check_ins
```

### Tabla users

Guarda usuarios de la app.

Campos importantes:

```txt
id
role_id
name
username
email
password
phone
birth_date
gender
height
weight
profile_photo
is_active
```

`role_id` conecta con la tabla `roles`.

`is_active` define si el usuario puede iniciar sesion.

### Tabla roles

Guarda roles como:

```txt
admin
user
```

Se usa para saber si un usuario puede entrar a rutas administrativas.

### Tabla personal_access_tokens

Esta tabla pertenece a Laravel Sanctum.

Guarda los tokens generados al iniciar sesion.

Cuando el usuario inicia sesion, se crea un token aqui.

Cuando hace logout, el token actual se elimina.

### Tabla routines

Guarda rutinas.

Campos importantes:

```txt
id
user_id
name
description
is_predefined
```

`user_id` conecta la rutina con un usuario.

`is_predefined` permite tener rutinas predeterminadas visibles para usuarios.

### Tabla routine_exercises

Relaciona rutinas con ejercicios.

Guarda detalles como:

```txt
position
sets
reps
rest_seconds
notes
```

### Tabla memberships

Guarda membresias de usuarios.

Campos importantes:

```txt
user_id
plan_type
status
starts_at
ends_at
price
paid_at
notes
```

El sistema usa esto para saber si la membresia esta activa, vencida o cancelada.

### Tabla membership_types

Guarda los tipos de membresia, precios y duracion.

### Tabla muscles

Guarda grupos musculares.

### Tabla exercises

Guarda ejercicios y se relaciona con musculos.

### Tabla workout_check_ins

Guarda progreso semanal o registros de entrenamiento.

## 13. Modelos principales

Los modelos estan en:

```txt
backend/app/Models
```

Modelos importantes:

```txt
User.php
Role.php
Membership.php
MembershipType.php
Routine.php
RoutineExercise.php
Muscle.php
Exercise.php
Day.php
WorkoutCheckIn.php
```

### Relaciones del modelo User

Archivo:

```txt
backend/app/Models/User.php
```

Relaciones:

```php
role()
routines()
memberships()
workoutCheckIns()
latestMembership()
```

Significado:

```txt
Un usuario pertenece a un rol.
Un usuario tiene muchas rutinas.
Un usuario tiene muchas membresias.
Un usuario tiene muchos registros de entrenamiento.
Un usuario tiene una ultima membresia.
```

### Relaciones del modelo Routine

Archivo:

```txt
backend/app/Models/Routine.php
```

Relaciones:

```php
user()
exercises()
days()
routineExercises()
```

Significado:

```txt
Una rutina pertenece a un usuario.
Una rutina tiene muchos ejercicios.
Una rutina puede estar asociada a varios dias.
Una rutina tiene registros intermedios en routine_exercises.
```

## 14. Resources: como Laravel devuelve JSON

Laravel no devuelve siempre los modelos crudos. Usa Resources para transformar la respuesta.

Ejemplos:

```txt
backend/app/Http/Resources/Api/V1/UserResource.php
backend/app/Http/Resources/Api/V1/RoutineResource.php
backend/app/Http/Resources/Api/V1/MembershipResource.php
```

`UserResource` devuelve datos como:

```txt
id
role_id
name
username
email
phone
birth_date
gender
height
weight
profile_photo
avatarUrl
is_active
role
latest_membership
routines
memberships
```

Tambien resuelve la URL del avatar.

Si `profile_photo` es una ruta relativa, devuelve algo como:

```txt
/storage/profile-photos/archivo.jpg?t=timestamp
```

Luego el frontend completa la URL usando `API_BASE_URL`.

## 15. Flujo de logout

Frontend:

```txt
AuthContext.logout()
  -> logoutRequest()
  -> POST /api/v1/auth/logout
```

Backend:

```php
$request->user()?->currentAccessToken()?->delete();
```

Despues el frontend limpia:

```txt
@gymapp/auth/token
@gymapp/auth/user
```

Y cambia:

```ts
isAuthenticated = false
```

## 16. Actualizacion de perfil

Endpoint:

```txt
PUT /api/v1/auth/me
POST /api/v1/auth/me
```

Se usa `PUT` para datos normales.

Se usa `POST` cuando hay archivo de foto, porque el frontend arma un `FormData` y envia:

```txt
_method=PUT
profile_photo
```

Backend:

```txt
AuthController@updateMe
```

Si se sube foto:

1. Borra foto anterior si estaba en `profile-photos/`.
2. Guarda la nueva en el disco `public`.
3. Actualiza el usuario.
4. Devuelve el usuario actualizado.

## 17. Rutinas

Frontend:

```txt
frontend/src/services/routines.service.ts
```

Endpoints usados:

```txt
GET    /api/v1/routines
POST   /api/v1/routines
GET    /api/v1/routines/{id}
PUT    /api/v1/routines/{id}
DELETE /api/v1/routines/{id}
```

Backend:

```txt
backend/app/Http/Controllers/Api/V1/RoutineController.php
```

Las rutinas estan protegidas con token, asi que solo usuarios autenticados pueden gestionarlas.

## 18. Musculos y ejercicios

Frontend:

```txt
frontend/src/services/muscles.service.ts
frontend/src/services/exercises.service.ts
```

Endpoints:

```txt
GET /api/v1/muscles
GET /api/v1/muscles/{id}
GET /api/v1/muscles/{id}/exercises

GET /api/v1/exercises
GET /api/v1/exercises/search
GET /api/v1/exercises/{id}
```

Estos endpoints son publicos segun `routes/api.php`.

## 19. Administracion de usuarios

Frontend:

```txt
frontend/src/services/admin.service.ts
```

Endpoints:

```txt
GET    /api/v1/admin/users
POST   /api/v1/admin/users
GET    /api/v1/admin/users/{id}
PUT    /api/v1/admin/users/{id}
DELETE /api/v1/admin/users/{id}
```

Backend:

```txt
backend/app/Http/Controllers/Api/V1/Admin/UserController.php
```

Al crear usuario, si el rol es `user`, tambien se puede crear una membresia inicial.

El backend usa una transaccion:

```php
DB::transaction(...)
```

Eso significa que si algo falla creando el usuario o membresia, se revierte todo.

## 20. Membresias

Endpoints:

```txt
GET  /api/v1/admin/memberships
POST /api/v1/admin/memberships
GET  /api/v1/admin/memberships/upcoming
PUT  /api/v1/admin/memberships/{membership}
```

Tambien existen tipos de membresia:

```txt
GET    /api/v1/admin/membership-types
POST   /api/v1/admin/membership-types
GET    /api/v1/admin/membership-types/{id}
PUT    /api/v1/admin/membership-types/{id}
DELETE /api/v1/admin/membership-types/{id}
```

Las membresias controlan si un usuario esta activo o vencido segun fechas y estado.

## 21. Progreso semanal

Frontend:

```txt
frontend/src/services/weekly-progress.service.ts
```

Endpoints de usuario:

```txt
GET /api/v1/weekly-progress
PUT /api/v1/weekly-progress
```

Endpoint admin:

```txt
GET /api/v1/admin/users/{id}/weekly-progress
```

Backend:

```txt
backend/app/Http/Controllers/Api/V1/WeeklyProgressController.php
```

## 22. Posibles desconexiones detectadas

En el frontend, dentro de:

```txt
frontend/src/services/admin.service.ts
```

hay funciones que llaman endpoints como:

```txt
DELETE /api/v1/admin/memberships/{id}
POST   /api/v1/exercises
PUT    /api/v1/exercises/{id}
DELETE /api/v1/exercises/{id}
```

Pero en:

```txt
backend/routes/api.php
```

no aparecen esas rutas registradas.

Eso significa que si alguna pantalla usa esas funciones, podria fallar con:

```txt
404 Not Found
405 Method Not Allowed
```

Este punto conviene revisarlo si hay botones de crear, editar o eliminar ejercicios/membresias que no funcionen.

## 23. Resumen corto

La app funciona asi:

```txt
Expo / React Native usa Axios.
Axios apunta a http://localhost:8000.
Laravel recibe las peticiones en /api/v1.
Laravel usa controllers para procesar.
Los controllers usan modelos Eloquent.
Eloquent consulta MySQL en la base gym_app.
Laravel devuelve JSON usando Resources.
El frontend guarda el token y usuario en AsyncStorage.
Las rutas privadas usan Authorization: Bearer TOKEN.
Las rutas admin requieren rol admin.
```

## 24. Archivos clave para revisar

Frontend:

```txt
frontend/.env
frontend/src/constants/index.ts
frontend/src/services/api/client.ts
frontend/src/services/auth/auth.service.ts
frontend/src/services/auth/storage.ts
frontend/src/context/AuthContext.tsx
frontend/src/services/admin.service.ts
frontend/src/services/routines.service.ts
frontend/src/services/exercises.service.ts
frontend/src/services/muscles.service.ts
frontend/src/services/weekly-progress.service.ts
```

Backend:

```txt
backend/.env
backend/routes/api.php
backend/app/Http/Controllers/Api/V1/AuthController.php
backend/app/Http/Controllers/Api/V1/RoutineController.php
backend/app/Http/Controllers/Api/V1/WeeklyProgressController.php
backend/app/Http/Controllers/Api/V1/Admin/UserController.php
backend/app/Models/User.php
backend/app/Models/Routine.php
backend/database/migrations
backend/database/seeders
```

