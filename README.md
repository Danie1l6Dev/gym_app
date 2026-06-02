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

## Documentación

- [Alcance](docs/alcance.md)
- [Instalación](docs/instalacion.md)
- [API](docs/api.md)
- [Arquitectura y diagramas](docs/arquitectura.md)
- [Scrum](docs/scrum.md)
