# Universe – Change Status (PATCH /universes/:id/status)

## Objetivo

Validar el comportamiento del endpoint de cambio de estado de universos, asegurando que:

- Permite únicamente transiciones válidas definidas por el dominio.
- Rechaza transiciones no permitidas con error de validación.
- Rechaza requests con `id` vacío/en blanco o `status` inválido.
- Retorna `404` cuando el universo no existe.
- Retorna `409` cuando una reactivación viola unicidad de nombre.
- Propaga errores de validación de persistencia como `400`.
- Maneja errores técnicos no mapeados como `500`.

## Regla de Dominio (Transiciones)

```ts
canTransitionUniverseStatus(from, to)
```

Transiciones permitidas:

- `DRAFT -> ACTIVE`
- `ACTIVE -> ARCHIVED`
- `ARCHIVED -> ACTIVE`

Cualquier otra transición debe rechazarse.

## Endpoint

`PATCH /universes/:id/status`

## Request Body

```json
{
  "status": "ACTIVE | ARCHIVED"
}
```

## Response (200 OK)

```json
{
  "universe": {
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
{ "error": "Universe id is required" }
```

```json
{ "error": "Status must be ACTIVE or ARCHIVED" }
```

```json
{ "error": "Status transition {currentStatus} -> {status} is not allowed" }
```

```json
{ "error": "Validation error while changing universe status" }
```

_o el mensaje específico de validación de esquema._

## Response (404 Not Found)

```json
{ "error": "Universe {id} not found" }
```

```json
{ "error": "Universe not found" }
```

## Response (409 Conflict)

```json
{ "error": "Universe name already exists for an ACTIVE or DRAFT universe" }
```

## Response (500 Internal Server Error)

```json
{ "error": "Error changing universe status in database" }
```

## Test Cases

### TC-UNIVERSE-CHANGE-STATUS-01 – DRAFT -> ACTIVE – Returns 200

Descripción:

Cuando un universe en `DRAFT` cambia a `ACTIVE`, la transición es válida y debe completarse exitosamente.

Expected Result:

- Status Code: 200
- Response contiene `universe` actualizado.
- `universe.status` final = `ACTIVE`.

---

### TC-UNIVERSE-CHANGE-STATUS-02 – ACTIVE -> ARCHIVED – Returns 200

Descripción:

Cuando un universe en `ACTIVE` cambia a `ARCHIVED`, la transición es válida y debe completarse exitosamente.

Expected Result:

- Status Code: 200
- Response contiene `universe` actualizado.
- `universe.status` final = `ARCHIVED`.

---

### TC-UNIVERSE-CHANGE-STATUS-03 – ARCHIVED -> ACTIVE – Returns 200

Descripción:

Cuando un universe en `ARCHIVED` cambia a `ACTIVE`, la transición es válida siempre que no viole unicidad.

Expected Result:

- Status Code: 200
- Response contiene `universe` actualizado.
- `universe.status` final = `ACTIVE`.

---

### TC-UNIVERSE-CHANGE-STATUS-04 – Empty/blank id – Returns 400

Descripción:

Cuando el `id` llega vacío o en blanco (por ejemplo " " o `%20`), debe responder con error de validación.

Expected Result:

- Status Code: 400
- Response body:

```json
{ "error": "Universe id is required" }
```

---

### TC-UNIVERSE-CHANGE-STATUS-05 – Invalid status in request – Returns 400

Descripción:

Cuando el request envía un valor de `status` distinto de `ACTIVE` o `ARCHIVED`, debe responder error de validación.

Expected Result:

- Status Code: 400
- Response body:

```json
{ "error": "Status must be ACTIVE or ARCHIVED" }
```

---

### TC-UNIVERSE-CHANGE-STATUS-06 – Transition not allowed – Returns 400

Descripción:

Cuando la transición no está permitida por `canTransitionUniverseStatus`, debe responder error de validación.

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

### TC-UNIVERSE-CHANGE-STATUS-07 – Universe not found on getById – Returns 404

Descripción:

Cuando el universe no existe al obtener estado actual (`getById`), debe responder `404`.

Expected Result:

- Status Code: 404
- Response body:

```json
{ "error": "Universe {id} not found" }
```

---

### TC-UNIVERSE-CHANGE-STATUS-08 – Reactivation uniqueness conflict – Returns 409

Descripción:

Cuando se intenta `ARCHIVED -> ACTIVE` y ya existe otro universe `ACTIVE`/`DRAFT` con el mismo `name`, debe responder conflicto.

Expected Result:

- Status Code: 409
- Response body:

```json
{ "error": "Universe name already exists for an ACTIVE or DRAFT universe" }
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

### 🔍 Recurso no encontrado (404 Not Found)

- universe no existe en lectura (`Universe {id} not found`)

### ⚠️ Conflicto (409 Conflict)

- reactivación con violación de unicidad de nombre

### 💥 Error interno (500 Internal Server Error)

- No cubierto en esta suite

**Notas importantes:**

- El formato de error esperado es `{ "error": "mensaje" }`.
- Este endpoint controla transiciones de estado, no actualización parcial genérica.
- El caso `ARCHIVED -> ACTIVE` debe validarse con y sin conflicto de unicidad.
