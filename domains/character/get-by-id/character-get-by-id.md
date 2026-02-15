# Character – Get by ID (GET /characters/:id)

## Objetivo

Validar el comportamiento del endpoint de obtención de personajes por ID, asegurando que:

- Retorna un character válido cuando el ID existe
- **Valida estrictamente IDs faltantes, vacíos o inválidos** retornando 400 Bad Request
- **Retorna 404 Not Found** cuando el ID es válido pero no existe en el sistema
- Mantiene un contrato HTTP consistente con formato de error `{ "error": "mensaje" }`
- Propaga errores de validación desde el repositorio (400)
- Maneja errores técnicos inesperados retornando 500
- Retorna información coherente con la persistencia (MongoDB)

## Endpoint

`GET /characters/:id`

## Response (200 OK)

```json
{
  "character": {
    "id": "string",
    "name": "string",
    "status": "string",
    "categories": [],
    "identity": "string",
    "inspirations": [],
    "notes": "string | undefined"
  }
}
```

## Response (400 Bad Request)

```json
{
  "error": "Character id is required"
}
```

```json
{
  "error": "<mensaje de validación desde repositorio>"
}
```

**Nota importante:** El formato de error es `{ "error": "mensaje" }` (no `message`), gestionado por middleware global.

## Response (404 Not Found)

```json
{
  "error": "Character <id> not found"
}
```

Retornado cuando el ID tiene formato válido pero no existe en la base de datos.

## Response (500 Internal Server Error)

```json
{
  "error": "<mensaje del error>"
}
```

Retornado cuando ocurre un error técnico inesperado en DB (RepoError UNKNOWN) o cualquier falla interna no controlada.

## Test Cases

### TC-CHAR-GET-01 – Existing character ID – Returns character (200)

Descripción:

Cuando se envía un ID válido y existente, el backend debe retornar el character correspondiente.

Request:

``GET /characters/{existingId}``

Expected Result:

- Status Code: 200
- Response contiene character
- character cumple con la estructura completa de CharacterDTO:
  - id (string)
  - name (string)
  - status (string)
  - categories (string[])
  - identity (string)
  - inspirations (string[])
  - notes (opcional, string)

### TC-CHAR-GET-02 – Non-existent character ID – Returns 404

Descripción:

Cuando el ID tiene formato válido pero no existe en el sistema, el backend debe responder con 404 Not Found.

Request:

``GET /characters/507f1f77bcf86cd799439011``

Expected Result:

- Status Code: 404
- Response body:

  ```json
  { "error": "Character 507f1f77bcf86cd799439011 not found" }
  ```

### TC-CHAR-GET-04 – Internal server error – Returns 500 (TODO)

Descripción:

Cuando ocurre un error técnico inesperado en DB (RepoError UNKNOWN) o cualquier falla interna, el endpoint debe responder con error interno.

Request:

``GET /characters/{id}``

⚠️ Este escenario requiere soporte del backend para forzar error (env / header).

Expected Result:

- Status Code: 500
- Response body:

  ```json
  { "error": "Error fetching character from database" }
  ```

  o

  ```json
  { "error": "<mensaje del error técnico>" }
  ```

### TC-CHAR-GET-05 – Character data matches database record (MongoDB)

Descripción:

Cuando se consulta un ID existente, la información retornada por el endpoint debe coincidir con el registro almacenado en la base de datos (MongoDB).

Request:

``GET /characters/{existingId}``

Expected Result:

- Status Code: 200
- Los campos del character coinciden con los valores persistidos en MongoDB

---

## Resumen de Escenarios Cubiertos

### ✅ Casos exitosos (200 OK)

| Request | Response |
|---------|----------|

| `GET /characters/{existingId}` | Character completo con estructura CharacterDTO |

### ❌ Errores de validación (400 Bad Request)

| Escenario | Error Message |
|-----------|---------------|

| ID faltante o vacío | `{ "error": "Character id is required" }` |
| ValidationError desde repositorio | `{ "error": "<mensaje de validación>" }` |

### 🔍 Recurso no encontrado (404 Not Found)

| Request | Error Message |
|---------|---------------|

| `GET /characters/{validButNonExistentId}` | `{ "error": "Character <id> not found" }` |

### 💥 Errores internos (500 Internal Server Error)

| Escenario | Error Message |
|-----------|---------------|

| RepoError UNKNOWN o error técnico en DB | `{ "error": "Error fetching character from database" }` o `{ "error": "<mensaje del error>" }` |

**Notas importantes:**

- El formato de error es `{ "error": "mensaje" }` (no `message`), gestionado por middleware global.
- Los IDs deben ser strings válidos y no vacíos.
- El código 404 se usa solo cuando el ID es válido pero no existe en DB.
- El código 400 se usa para errores de validación (ID faltante, vacío, o ValidationError de Mongoose).
