# API actual

Base local recomendada:

```text
http://localhost:8000/api/v1
```

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

## Contrato de membresías

La convención técnica es `plan_type`.

Valores permitidos:

- `weekly`
- `monthly`

La API también devuelve `plan_label` para presentación:

- `Semanal`
- `Mensual`
