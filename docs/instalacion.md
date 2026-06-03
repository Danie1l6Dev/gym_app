# Instalación y entorno

## Requisitos

- PHP compatible con Laravel configurado en el proyecto.
- Composer.
- Node.js y npm.
- MySQL.
- Expo CLI disponible mediante `npx expo`.

## Backend

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Variables principales:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gym_app
DB_USERNAME=root
DB_PASSWORD=
```

Para ExerciseDB:

```env
EXERCISE_DB_BASE_URL=https://oss.exercisedb.dev
EXERCISE_DB_MUSCLES_PATH=/api/v1/muscles
EXERCISE_DB_BODYPARTS_PATH=/api/v1/bodyparts
EXERCISE_DB_EXERCISES_PATH=/api/v1/exercises
EXERCISE_DB_KEY=
EXERCISE_DB_TIMEOUT=30
EXERCISE_DB_SOURCE=exercise_db_v1
EXERCISE_DB_VERIFY_SSL=false
```

Sincronización manual desde consola:

```bash
cd backend
php artisan exercises:sync
```

## Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run start
```

Variable principal:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Pruebas

Crear la base de pruebas si no existe:

```sql
CREATE DATABASE gym_app_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ejecutar:

```bash
cd backend
php artisan test
```
