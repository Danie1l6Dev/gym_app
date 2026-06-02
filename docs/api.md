# API actual

Base local recomendada:

```text
http://localhost:8000/api/v1
```

## Quién consume qué

- Frontend: consume `muscles`, `exercises`, `routines`, `auth` y el panel admin a través de la API local.
- Backend: consume ExerciseDB solo desde el flujo de sincronización y guarda el catálogo en local.
- ExerciseDB: no se consume directamente desde el frontend.

## Autenticación

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/auth/login` | Inicia sesión y devuelve token |
| GET | `/auth/me` | Devuelve usuario autenticado |
| POST | `/auth/logout` | Cierra la sesión actual |

## Catálogo público

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/muscles` | Lista músculos |
| GET | `/muscles/{id}` | Detalle de músculo |
| GET | `/muscles/{id}/exercises` | Ejercicios de un músculo |
| GET | `/exercises` | Lista ejercicios |
| GET | `/exercises/search` | Busca ejercicios |
| GET | `/exercises/{id}` | Detalle de ejercicio |

## Rutinas

Requiere `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/routines` | Lista rutinas visibles para el usuario |
| POST | `/routines` | Crea rutina |
| GET | `/routines/{id}` | Detalle de rutina |
| PUT | `/routines/{id}` | Actualiza rutina |
| DELETE | `/routines/{id}` | Elimina rutina |

## Admin

Requiere usuario con rol `admin`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/admin/users` | Lista usuarios |
| POST | `/admin/users` | Crea usuario |
| GET | `/admin/users/{id}` | Detalle de usuario |
| PUT | `/admin/users/{id}` | Actualiza usuario |
| GET | `/admin/memberships` | Lista membresías |
| POST | `/admin/memberships` | Crea membresía |
| GET | `/admin/memberships/upcoming` | Lista membresías próximas a vencer |
| PUT | `/admin/memberships/{id}` | Actualiza membresía |
| POST | `/admin/exercises/sync` | Sincroniza ejercicios externos |

## ExerciseDB externo usado por la sincronización

La sincronización administrativa usa estos endpoints externos:

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `https://oss.exercisedb.dev/api/v1/muscles` | Catálogo de músculos |
| GET | `https://oss.exercisedb.dev/api/v1/bodyparts` | Catálogo de body parts |
| GET | `https://oss.exercisedb.dev/api/v1/exercises` | Catálogo de ejercicios sincronizados |

Nota operativa: el catálogo de ejercicios se pagina en bloques pequeños para evitar el límite de ExerciseDB y completar la importación total sin cortar la corrida.

Campos externos relevantes que se normalizan al guardar localmente:

- `exerciseId` -> `external_id`
- `name` -> `name_original`
- `gifUrl` -> `gif_url`
- `targetMuscles` -> `target_muscle`
- `secondaryMuscles` -> `secondary_muscles`
- `bodyParts` -> `body_part`
- `equipments` -> `equipment`
- `instructions` -> `instructions_original`

Ejemplo de uso administrativo:

```bash
POST /api/v1/admin/exercises/sync
Authorization: Bearer <token-admin>
```

## Contrato de membresías

La convención técnica es `plan_type`.

Valores permitidos:

- `weekly`
- `monthly`

La API también devuelve `plan_label` para presentación:

- `Semanal`
- `Mensual`
