# GymApp

Proyecto universitario para la gestión básica de un gimnasio.

## Stack

- Backend: Laravel API con Sanctum
- Frontend: Expo React Native con Expo Router
- Base de datos: MySQL
- Organización: Scrum y Trello

## Estructura

```text
backend/   API Laravel, migraciones, seeders, pruebas y servicios externos
frontend/  App Expo React Native, pantallas, navegación, hooks y servicios API
docs/      Documentación funcional, técnica y de Scrum
```

## Módulos actuales

- Autenticación con token Sanctum
- Catálogo de músculos
- Catálogo de ejercicios
- Rutinas de usuario
- Membresías
- Panel de administración
- Sincronización de ejercicios desde ExerciseDB

## Como funciona la sincronización

- El admin dispara `POST /api/v1/admin/exercises/sync`.
- El backend consulta ExerciseDB y guarda el catálogo en la base local.
- El frontend consume siempre datos locales desde `GET /api/v1/exercises`.
- La sincronización actual usa la fuente externa configurada en `backend/config/services.php`.
- El proceso sincroniza también el catálogo de `muscles` y `bodyparts` de ExerciseDB.
- Para respetar el límite del proveedor, el catálogo de ejercicios se descarga en páginas de 25 registros con pausas entre bloques.

## Endpoints principales

### Backend interno

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/muscles`
- `GET /api/v1/muscles/{id}`
- `GET /api/v1/muscles/{id}/exercises`
- `GET /api/v1/exercises`
- `GET /api/v1/exercises/search`
- `GET /api/v1/exercises/{id}`
- `GET /api/v1/routines`
- `POST /api/v1/routines`
- `GET /api/v1/routines/{id}`
- `PUT /api/v1/routines/{id}`
- `DELETE /api/v1/routines/{id}`
- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `GET /api/v1/admin/users/{id}`
- `PUT /api/v1/admin/users/{id}`
- `GET /api/v1/admin/memberships`
- `POST /api/v1/admin/memberships`
- `GET /api/v1/admin/memberships/upcoming`
- `PUT /api/v1/admin/memberships/{id}`
- `POST /api/v1/admin/exercises/sync`

### ExerciseDB externo usado por la sincronización

- `GET https://oss.exercisedb.dev/api/v1/muscles`
- `GET https://oss.exercisedb.dev/api/v1/bodyparts`
- `GET https://oss.exercisedb.dev/api/v1/exercises`

La sincronización usa el endpoint de ejercicios como catálogo principal y normaliza la respuesta para guardarla localmente.

## Instalación rápida

Backend:

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env
npm run start
```

Configura `frontend/.env` con la URL del backend:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Usuarios de prueba

Todos usan la contraseña `password`.

| Rol | Email |
| --- | --- |
| Admin | `admin@gymapp.com` |
| Usuario | `user1@gymapp.com` |
| Usuario | `user2@gymapp.com` |
| Usuario | `user3@gymapp.com` |
| Usuario | `user4@gymapp.com` |
| Usuario | `user5@gymapp.com` |

## Verificación

```bash
cd backend
php artisan test

cd ../frontend
npm run lint
npx tsc --noEmit
```

Las pruebas backend usan la base MySQL `gym_app_testing`.

## Nota sobre atribución

Si el catálogo de ejercicios o sus medios provienen de un proveedor externo, conserva la atribución que indiquen sus términos. Esto aplica a ExerciseDB y a cualquier fuente equivalente que se configure después.

## Documentación

- [Alcance](docs/alcance.md)
- [Instalación](docs/instalacion.md)
- [API](docs/api.md)
- [Arquitectura y diagramas](docs/arquitectura.md)
- [Scrum](docs/scrum.md)
