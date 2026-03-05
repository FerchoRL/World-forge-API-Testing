# Universe – Get by ID (GET /universes/:id)

Endpoint: `GET /universes/:id`

## Objetivo

Validar el comportamiento del endpoint de obtencion de universe por ID, asegurando que:

- Retorna un universe valido cuando el ID existe.
- Respeta el contrato de `UniverseDTO`, donde `rules` y `notes` son opcionales.
- Valida IDs faltantes/vacios (incluyendo solo espacios URL-encoded) retornando 400 Bad Request.
- Retorna 404 Not Found cuando el ID es valido pero no existe en el sistema.
- Mantiene un contrato HTTP consistente con formato de error `{ "error": "mensaje" }`.
- Retorna informacion coherente con la persistencia (MongoDB).

## Endpoint

`GET /universes/:id`

## Payload real del endpoint

- Path param obligatorio: `:id`
- Body: none
- Query: none

## Response (200 OK)

```json
{
  "universe": {
    "id": "string",
    "name": "string",
    "status": "DRAFT | ACTIVE | ARCHIVED",
    "premise": "string"
  }
}
```

### Campos response

- `universe.id`: string
- `universe.name`: string
- `universe.status`: string (`DRAFT | ACTIVE | ARCHIVED`)
- `universe.premise`: string
- `universe.rules`: opcional, `string[]`
- `universe.notes`: opcional, `string`

## Response (400 Bad Request)

```json
{
  "error": "Universe id is required"
}
```

```json
{
  "error": "Validation error while fetching universe by id"
}
```

o

```json
{
  "error": "<mensaje de validacion desde repositorio>"
}
```

**Nota importante:** El formato de error es `{ "error": "mensaje" }` (no `message`), gestionado por middleware global.

## Response (404 Not Found)

```json
{
  "error": "Universe <id> not found"
}
```

Retornado cuando el ID tiene formato valido pero no existe en la base de datos.

## Response (500 Internal Server Error)

```json
{
  "error": "Error fetching universe from database"
}
```

o

```json
{
  "error": "<mensaje del error>"
}
```

Retornado cuando ocurre un error tecnico inesperado en DB (RepoError UNKNOWN) o cualquier falla interna no controlada.

## Test Cases

### TC-UNIVERSE-GET-01 - Existing universe ID - Returns universe (200)

Descripcion:

Cuando se envia un ID valido y existente, el backend debe retornar el universe correspondiente.

Request:

`GET /universes/uni-1`

Expected Result:

- Status Code: 200
- Response contiene `universe`
- `universe` cumple con la estructura completa de `UniverseDTO`:
  - id (string)
  - name (string)
  - status (string)
  - premise (string)
  - rules (opcional, string[]; si existe, cada item es string)
  - notes (opcional, string; si existe)

### TC-UNIVERSE-GET-02 - Empty/blank universe ID - Returns 400

Descripcion:

Cuando el path param `:id` llega vacio o con solo espacios (ej. `%20`), el backend debe responder con error de validacion.

Request:

`GET /universes/%20`

Expected Result:

- Status Code: 400
- Response body:

  ```json
  { "error": "Universe id is required" }
  ```

### TC-UNIVERSE-GET-03 - Non-existent universe ID - Returns 404

Descripcion:

Cuando el ID tiene formato valido pero no existe en el sistema, el backend debe responder con 404 Not Found.

Request:

`GET /universes/universe-does-not-exist`

Expected Result:

- Status Code: 404
- Response body:

  ```json
  { "error": "Universe universe-does-not-exist not found" }
  ```

### TC-UNIVERSE-GET-04 - Universe data matches database record (MongoDB)

Descripcion:

Cuando se consulta un ID existente, la informacion retornada por el endpoint debe coincidir con el registro almacenado en la base de datos (MongoDB).

Request:

`GET /universes/uni-1`

Expected Result:

- Status Code: 200
- Los campos del universe coinciden con los valores persistidos en MongoDB.

---

## Resumen de Escenarios Cubiertos

### Casos exitosos (200 OK)

| Request                | Response                                       |
| ---------------------- | ---------------------------------------------- |
| `GET /universes/uni-1` | Universe completo con estructura `UniverseDTO` |

### Errores de validacion (400 Bad Request)

| Escenario               | Error Message                            |
| ----------------------- | ---------------------------------------- |
| ID vacio o con espacios | `{ "error": "Universe id is required" }` |

### Recurso no encontrado (404 Not Found)

| Request                                  | Error Message                                               |
| ---------------------------------------- | ----------------------------------------------------------- |
| `GET /universes/universe-does-not-exist` | `{ "error": "Universe universe-does-not-exist not found" }` |

## Notas importantes

- El formato de error esperado es `{ "error": "mensaje" }` (no `message`).
- El codigo 404 se usa solo cuando el ID es valido pero no existe en DB.
- El codigo 400 se usa para errores de validacion del request (`id` vacio/blank).
- En `UniverseDTO`, `rules` y `notes` son opcionales y pueden no venir en la respuesta.
