# Character – Change Status (PATCH /characters/:id/status)

## Objetivo

Validar el comportamiento del endpoint de cambio de estado de personajes, asegurando que:

- Permite únicamente transiciones válidas definidas por el dominio.
- Rechaza transiciones no permitidas con error de validación.
- Rechaza requests con `id` vacío/en blanco o `status` inválido.
- Retorna `404` cuando el personaje no existe.
- Retorna `409` cuando una reactivación viola unicidad de nombre.
- Propaga errores de validación de persistencia como `400`.
- Maneja errores técnicos no mapeados como `500`.

## Regla de Dominio (Transiciones)

```ts
canTransitionCharacterStatus(from, to)
```

Transiciones permitidas:

- `DRAFT -> ACTIVE`
- `ACTIVE -> ARCHIVED`
- `ARCHIVED -> ACTIVE`

Cualquier otra transición debe rechazarse.

## Endpoint

`PATCH /characters/:id/status`

## Request Body

```json
{
  "status": "ACTIVE | ARCHIVED"
}
```

## Response (200 OK)

```json
{
  "character": {
    "id": "string",
    "name": "string",
    "status": "DRAFT | ACTIVE | ARCHIVED",
    "categories": [],
    "identity": "string",
    "inspirations": [],
    "notes": "string | undefined",
    "image": "string | undefined"
  }
}
```

## Response (400 Bad Request)

```json
{ "error": "Character id is required" }
```

```json
{ "error": "Status must be ACTIVE or ARCHIVED" }
```

```json
{ "error": "Status transition {currentStatus} -> {status} is not allowed" }
```

```json
{ "error": "Validation error while changing character status" }
```

_o el mensaje específico de validación de esquema (Mongoose ValidationError)._

## Response (404 Not Found)

```json
{ "error": "Character {id} not found" }
```

```json
{ "error": "Character not found" }
```

## Response (409 Conflict)

```json
{ "error": "Character name already exists for an ACTIVE or DRAFT character" }
```

## Response (500 Internal Server Error)

```json
{ "error": "Error changing character status in database" }
```

## Test Cases

### TC-CHAR-CHANGE-STATUS-01 – DRAFT -> ACTIVE – Returns 200

Descripción:

Cuando un character en `DRAFT` cambia a `ACTIVE`, la transición es válida y debe completarse exitosamente.

Expected Result:

- Status Code: 200
- Response contiene `character` actualizado.
- `character.status` final = `ACTIVE`.

---

### TC-CHAR-CHANGE-STATUS-02 – ACTIVE -> ARCHIVED – Returns 200

Descripción:

Cuando un character en `ACTIVE` cambia a `ARCHIVED`, la transición es válida y debe completarse exitosamente.

Expected Result:

- Status Code: 200
- Response contiene `character` actualizado.
- `character.status` final = `ARCHIVED`.

---

### TC-CHAR-CHANGE-STATUS-03 – ARCHIVED -> ACTIVE – Returns 200

Descripción:

Cuando un character en `ARCHIVED` cambia a `ACTIVE`, la transición es válida siempre que no viole unicidad.

Expected Result:

- Status Code: 200
- Response contiene `character` actualizado.
- `character.status` final = `ACTIVE`.

---

### TC-CHAR-CHANGE-STATUS-04 – Empty/blank id – Returns 400

Descripción:

Cuando el `id` llega vacío o en blanco (por ejemplo `" "` o `%20`), debe responder con error de validación.

Nota:

- `PATCH /characters//status` (id ausente en path) normalmente no matchea la ruta `/characters/:id/status` y cae en `404` de routing.
- Un `id` no vacío como `false`, `null`, `abc` se trata como string y, si no existe en DB, cae en escenario de `404 not found`, no en este caso.

Expected Result:

- Status Code: 400
- Response body:

```json
{ "error": "Character id is required" }
```

---

### TC-CHAR-CHANGE-STATUS-05 – Invalid status in request – Returns 400

Descripción:

Cuando el request envía un valor de `status` distinto de `ACTIVE` o `ARCHIVED`, debe responder error de validación.

Expected Result:

- Status Code: 400
- Response body:

```json
{ "error": "Status must be ACTIVE or ARCHIVED" }
```

---

### TC-CHAR-CHANGE-STATUS-06 – Transition not allowed – Returns 400

Descripción:

Cuando la transición no está permitida por `canTransitionCharacterStatus`, debe responder error de validación.

Ejemplos de transición inválida:

- `ACTIVE -> ACTIVE`
- `ARCHIVED -> ARCHIVED`
- `DRAFT -> ARCHIVED`

Expected Result:

- Status Code: 400
- Response body:

```json
{ "error": "Status transition {currentStatus} -> {status} is not allowed" }
```

---

### TC-CHAR-CHANGE-STATUS-07 – Character not found on getById – Returns 404

Descripción:

Cuando el character no existe al obtener estado actual (`getById`), debe responder `404`.

Incluye ids string no vacíos que no existen en la base de datos (por ejemplo: `false`, `null`, `abc`).

Expected Result:

- Status Code: 404
- Response body:

```json
{ "error": "Character {id} not found" }
```

---

### TC-CHAR-CHANGE-STATUS-08 – Character not found on update – Returns 404

Descripción:

Cuando el character desaparece/no existe al intentar persistir el cambio (inconsistencia infra), debe responder `404`.

Expected Result:

- Status Code: 404
- Response body:

```json
{ "error": "Character not found" }
```

---

### TC-CHAR-CHANGE-STATUS-09 – Reactivation uniqueness conflict – Returns 409

Descripción:

Cuando se intenta `ARCHIVED -> ACTIVE` y ya existe otro character `ACTIVE`/`DRAFT` con el mismo `name`, debe responder conflicto.

Expected Result:

- Status Code: 409
- Response body:

```json
{ "error": "Character name already exists for an ACTIVE or DRAFT character" }
```

---

### TC-CHAR-CHANGE-STATUS-10 – DB schema validation error – Returns 400

Descripción:

Cuando la capa de persistencia retorna `ValidationError` (esquema), el endpoint debe mapearlo a `400`.

Expected Result:

- Status Code: 400
- Response body:

```json
{ "error": "Validation error while changing character status" }
```

_o mensaje específico de Mongoose._

---

### TC-CHAR-CHANGE-STATUS-11 – Unmapped infrastructure error – Returns 500

Descripción:

Cuando ocurre un error técnico no mapeado durante el cambio de estado, el endpoint debe responder `500`.

Expected Result:

- Status Code: 500
- Response body:

```json
{ "error": "Error changing character status in database" }
```

---

## Resumen de Escenarios Cubiertos

### ✅ Éxitos (200 OK)

- `DRAFT -> ACTIVE`
- `ACTIVE -> ARCHIVED`
- `ARCHIVED -> ACTIVE` (sin conflicto de unicidad)

### ❌ Errores de validación (400 Bad Request)

- `id` vacío/en blanco
- `status` inválido en request
- transición no permitida
- error de validación de esquema en DB

### 🔍 Recurso no encontrado (404 Not Found)

- character no existe en lectura (`Character {id} not found`)
- character no existe al persistir update (`Character not found`)

### ⚠️ Conflicto (409 Conflict)

- reactivación con violación de unicidad de nombre

### 💥 Error interno (500 Internal Server Error)

- error técnico de infraestructura no mapeado

**Notas importantes:**

- El formato de error esperado es `{ "error": "mensaje" }`.
- Este endpoint controla transiciones de estado, no actualización parcial genérica.
- El caso `ARCHIVED -> ACTIVE` debe validarse con y sin conflicto de unicidad.
