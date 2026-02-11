# Character – Get by ID (GET /characters/:id)

## Objetivo

Validar el comportamiento del endpoint de obtención de personajes por ID, asegurando que:

- Retorna un character válido cuando el ID existe
- Valida correctamente IDs inválidos o inexistentes
- Mantiene un contrato HTTP consistente
- No expone errores internos inesperados
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

### TC-CHAR-GET-02 – Non-existent character ID – Returns validation error (400)

Descripción:

Cuando el ID no existe en el sistema, el backend debe responder con un error de validación.

Request:

``GET /characters/non-existent-id``

Expected Result:

- Status Code: 400
- Response contiene un mensaje de error

### TC-CHAR-GET-03 – Invalid character ID format – Returns validation error (400)

Descripción:

Cuando el ID tiene un formato inválido (ej. caracteres especiales, string vacío), el backend debe responder con error de validación.

Request:

GET /characters/@@@

Expected Result:

Status Code: 400

Response contiene un mensaje de error

### TC-CHAR-GET-04 – Internal server error – Returns 500 (TODO)

Descripción:

Cuando ocurre un error inesperado en el backend, el endpoint debe responder con error interno.

Request:

``GET /characters/{id}``

Expected Result:

- Status Code: 500
- Response contiene mensaje de error genérico

⚠️ Este escenario requiere soporte del backend para forzar error (env / header).

### TC-CHAR-GET-05 – Character data matches database record (MongoDB)

Descripción:

Cuando se consulta un ID existente, la información retornada por el endpoint debe coincidir con el registro almacenado en la base de datos (MongoDB).

Request:

``GET /characters/{existingId}``

Expected Result:

- Status Code: 200
- Los campos del character coinciden con los valores persistidos en MongoDB
