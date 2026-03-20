# Universe – Update (PATCH /universes/:id)

## Objetivo

Validar el comportamiento del endpoint de actualización parcial de universos, asegurando que:

- Permite actualizaciones parciales de campos individuales o múltiples.
- El campo `status` NO se puede modificar mediante PATCH genérico.
- Valida estrictamente todos los campos enviados en el body.
- Retorna `404 Not Found` cuando el ID no existe en el sistema.
- Retorna `400 Bad Request` para IDs faltantes, body inválido, JSON malformado o campos con formato incorrecto.
- Retorna `409 Conflict` cuando el `name` actualizado entra en conflicto con otro universe `ACTIVE` o `DRAFT`.
- Mantiene un contrato HTTP consistente con formato de error `{ "error": "mensaje" }`.
- Maneja errores técnicos inesperados retornando `500` con el mensaje propagado.

## Endpoint

`PATCH /universes/:id`

## Request Body (Partial)

Todos los campos son opcionales en un PATCH, pero si se envían deben cumplir validación:

```json
{
  "name": "string (opcional)",
  "premise": "string (opcional)",
  "rules": ["string"] (opcional, pero si se envía debe ser array válido),
  "notes": "string (opcional)"
}
```

**Nota importante sobre el campo `status`:**

- El campo `status` NO se puede modificar mediante PATCH.
- Las transiciones de estado se manejan mediante una acción de dominio explícita en `/universes/:id/status`.
- Separar el cambio de estado permite validar transiciones de negocio de forma consistente.

## Response (200 OK)

```json
{
  "universe": {
    "id": "string",
    "name": "string",
    "premise": "string",
    "status": "DRAFT | ACTIVE | ARCHIVED",
    "rules": ["string"],
    "notes": "string | undefined"
  }
}
```

## Response (400 Bad Request)

### Validación de body

```json
{ "error": "Patch must include at least one updatable field" }
```

```json
{ "error": "Patch must be a valid object" }
```

```json
{ "error": "Invalid JSON body" }
```

### Campos no soportados

```json
{ "error": "Patch contains unsupported fields: status" }
```

```json
{ "error": "Patch contains unsupported fields: status" }
```

Retornado cuando se envían campos no permitidos en un PATCH. Si hay mezcla de campos válidos con uno no soportado, el request completo debe rechazarse.

### Validación de campos

```json
{ "error": "Universe name must be a string" }
```

```json
{ "error": "Universe name is required" }
```

```json
{ "error": "Universe premise must be a string" }
```

```json
{ "error": "Universe premise is required" }
```

```json
{ "error": "Universe rules must be an array" }
```

```json
{ "error": "Each universe rule must be a string" }
```

```json
{ "error": "Universe rules cannot contain empty values" }
```

```json
{ "error": "Universe rules must not contain duplicates" }
```

```json
{ "error": "Universe notes must be a string" }
```

```json
{ "error": "Universe notes cannot be empty" }
```

```json
{ "error": "Universe id is required" }
```

## Response (404 Not Found)

```json
{ "error": "Universe not found" }
```

Retornado cuando el ID proporcionado no existe en la base de datos.

## Response (409 Conflict)

```json
{ "error": "Universe name already exists for an ACTIVE or DRAFT universe" }
```

Retornado cuando el `name` actualizado entra en conflicto con otro universe en `ACTIVE` o `DRAFT`.

## Response (500 Internal Server Error)

```json
{ "error": "<mensaje propagado de error desconocido>" }
```

Retornado cuando ocurre una falla técnica inesperada en repo/DB o cualquier error interno no controlado.

## Test Cases

### TC-UNIVERSE-UPDATE-01 – Update múltiple exitoso (name + premise + notes + rules) – Returns 200

**Descripción:**

Cuando se actualizan múltiples campos válidos simultáneamente (`name`, `premise`, `notes` y `rules`), el backend debe procesar todos los cambios correctamente.

**Request:**

```text
PATCH /universes/{existingId}
Content-Type: application/json

{
  "name": "Aether",
  "premise": "World of floating isles",
  "notes": "Updated notes",
  "rules": ["No resurrection", "Magic has cost"]
}
```

**Expected Result:**

- Status Code: 200
- Response contiene `universe` actualizado.
- `universe.name` = `Aether`.
- `universe.premise` = `World of floating isles`.
- `universe.notes` = `Updated notes`.
- `universe.rules` = `["No resurrection", "Magic has cost"]`.
- Los cambios se persisten en la base de datos.

---

### TC-UNIVERSE-UPDATE-02 – Update parcial exitoso (solo name) – Returns 200

**Descripción:**

Cuando se actualiza únicamente el campo `name` con un valor válido, el backend debe procesar el cambio correctamente.

**Request:**

```text
PATCH /universes/{existingId}
Content-Type: application/json

{
  "name": "Aether"
}
```

**Expected Result:**

- Status Code: 200
- Response contiene `universe` con `name` actualizado.
- El cambio se persiste en la base de datos.

---

### TC-UNIVERSE-UPDATE-03 – Update parcial exitoso (solo premise) – Returns 200

**Descripción:**

Cuando se actualiza únicamente el campo `premise` con un valor válido, el backend debe procesar el cambio correctamente.

**Request:**

```text
PATCH /universes/{existingId}
Content-Type: application/json

{
  "premise": "World of floating isles"
}
```

**Expected Result:**

- Status Code: 200
- Response contiene `universe` con `premise` actualizada.
- El cambio se persiste en la base de datos.

---

### TC-UNIVERSE-UPDATE-04 – Update parcial exitoso (solo notes) – Returns 200

**Descripción:**

Cuando se actualiza únicamente el campo `notes` con un string válido, el backend debe procesar el cambio correctamente.

**Request:**

```text
PATCH /universes/{existingId}
Content-Type: application/json

{
  "notes": "Updated notes"
}
```

**Expected Result:**

- Status Code: 200
- Response contiene `universe` con `notes` actualizadas.
- El cambio se persiste en la base de datos.

---

### TC-UNIVERSE-UPDATE-05 – Update parcial exitoso (solo rules) – Returns 200

**Descripción:**

Cuando se actualiza únicamente el campo `rules` con un array válido de strings no vacíos y sin duplicados, el backend debe procesar el cambio correctamente.

**Request:**

```text
PATCH /universes/{existingId}
Content-Type: application/json

{
  "rules": ["No resurrection", "Magic has cost"]
}
```

**Expected Result:**

- Status Code: 200
- Response contiene `universe` con `rules` actualizadas.
- El cambio se persiste en la base de datos.

---

### TC-UNIVERSE-UPDATE-06 – Body vacío (sin campos) – Returns 400

**Descripción:**

Cuando el request body es un objeto vacío, el backend debe rechazarlo porque no contiene campos actualizables.

**Expected Result:**

- Status Code: 400
- Response body:

```json
{ "error": "Patch must include at least one updatable field" }
```

---

### TC-UNIVERSE-UPDATE-07 – Body inválido (no objeto: array/string/number/boolean) – Returns 400

**Descripción:**

Cuando el request body no es un objeto JSON válido para PATCH, por ejemplo un `array`, `string`, `number`, `true` o `false`, el backend debe rechazarlo.

**Casos a probar:**

- `[]`
- `"invalid-body"`
- `123`
- `true`
- `false`

**Expected Result:**

- Status Code: 400
- Response body:

```json
{ "error": "Patch must be a valid object" }
```

---

### TC-UNIVERSE-UPDATE-08 – Campo no soportado en patch (status) – Returns 400

**Descripción:**

Cuando el request body incluye el campo `status`, el backend debe rechazarlo porque ese campo no se puede modificar mediante PATCH genérico.

**Expected Result:**

- Status Code: 400
- Response body:

```json
{ "error": "Patch contains unsupported fields: status" }
```

---

### TC-UNIVERSE-UPDATE-09 – Campos mixtos con no soportado – Returns 400

**Descripción:**

Cuando el request body mezcla campos válidos con un campo no soportado como `status`, el backend debe rechazar el request completo.

**Expected Result:**

- Status Code: 400
- Response body:

```json
{ "error": "Patch contains unsupported fields: status" }
```

---

### TC-UNIVERSE-UPDATE-10 – name inválido (variaciones) – Returns 400

**Descripción:**

Cuando `name` se envía con valores inválidos como vacío, espacios, `null`, booleanos o número, el backend debe responder con error de validación.

**Casos a probar:**

- `name: ""`
- `name: "   "`
- `name: null`
- `name: false`
- `name: true`
- `name: 123`

**Expected Result:**

- Status Code: 400
- Para `empty` y `spaces`:

```json
{ "error": "Universe name is required" }
```

- Para `null`, `false`, `true` y `123`:

```json
{ "error": "Universe name must be a string" }
```

---

### TC-UNIVERSE-UPDATE-11 – premise inválido (variaciones) – Returns 400

**Descripción:**

Cuando `premise` se envía con valores inválidos como vacío, espacios, `null`, booleanos o número, el backend debe responder con error de validación.

**Casos a probar:**

- `premise: ""`
- `premise: "   "`
- `premise: null`
- `premise: false`
- `premise: true`
- `premise: 123`

**Expected Result:**

- Status Code: 400
- Para `empty` y `spaces`:

```json
{ "error": "Universe premise is required" }
```

- Para `null`, `false`, `true` y `123`:

```json
{ "error": "Universe premise must be a string" }
```

---

### TC-UNIVERSE-UPDATE-12 – rules inválido (no array) – Returns 400

**Descripción:**

Cuando `rules` no es un array, el backend debe responder con error de validación.

**Expected Result:**

- Status Code: 400
- Response body:

```json
{ "error": "Universe rules must be an array" }
```

---

### TC-UNIVERSE-UPDATE-13 – rules inválido (item no string) – Returns 400

**Descripción:**

Cuando `rules` contiene algún elemento que no es string, el backend debe responder con error de validación.

**Expected Result:**

- Status Code: 400
- Response body:

```json
{ "error": "Each universe rule must be a string" }
```

---

### TC-UNIVERSE-UPDATE-14 – rules inválido (item vacío) – Returns 400

**Descripción:**

Cuando `rules` contiene strings vacíos o en blanco, el backend debe responder con error de validación.

**Expected Result:**

- Status Code: 400
- Response body:

```json
{ "error": "Universe rules cannot contain empty values" }
```

---

### TC-UNIVERSE-UPDATE-15 – rules duplicadas (case-insensitive) – Returns 400

**Descripción:**

Cuando `rules` contiene duplicados ignorando mayúsculas/minúsculas, el backend debe responder con error de validación.

**Expected Result:**

- Status Code: 400
- Response body:

```json
{ "error": "Universe rules must not contain duplicates" }
```

---

### TC-UNIVERSE-UPDATE-16 – notes inválido (no string) – Returns 400

**Descripción:**

Cuando `notes` no es string, el backend debe responder con error de validación.

**Expected Result:**

- Status Code: 400
- Response body:

```json
{ "error": "Universe notes must be a string" }
```

---

### TC-UNIVERSE-UPDATE-17 – notes inválido (string vacío) – Returns 400

**Descripción:**

Cuando `notes` se envía como string vacío o en blanco, el backend debe responder con error de validación.

**Expected Result:**

- Status Code: 400
- Response body:

```json
{ "error": "Universe notes cannot be empty" }
```

---

### TC-UNIVERSE-UPDATE-18 – Universe no existe – Returns 404

**Descripción:**

Cuando el `id` no existe en el sistema, el backend debe responder `404`.

**Expected Result:**

- Status Code: 404
- Response body:

```json
{ "error": "Universe not found" }
```

---

### TC-UNIVERSE-UPDATE-19 – Conflicto de name (ya existe en DRAFT/ACTIVE) – Returns 409

**Descripción:**

Cuando se intenta actualizar el `name` a uno que ya pertenece a otro universe en `DRAFT` o `ACTIVE`, el backend debe responder conflicto.

**Expected Result:**

- Status Code: 409
- Response body:

```json
{ "error": "Universe name already exists for an ACTIVE or DRAFT universe" }
```

---

### TC-UNIVERSE-UPDATE-20 – Id inválido (espacios) – Returns 400

**Descripción:**

Cuando el `id` llega en blanco, por ejemplo `%20`, el backend debe responder con error de validación.

**Expected Result:**

- Status Code: 400
- Response body:

```json
{ "error": "Universe id is required" }
```

---

### TC-UNIVERSE-UPDATE-21 – Falla inesperada en repo/DB – Returns 500

**Descripción:**

Cuando ocurre una falla técnica inesperada en repo/DB durante la actualización, el backend debe propagar el error como `500`.

**Expected Result:**

- Status Code: 500
- Response body:

```json
{ "error": "<mensaje propagado de error desconocido>" }
```

---

## Resumen de Escenarios Cubiertos

### ✅ Éxitos (200 OK)

- update core exitoso (`name` + `premise`)
- update parcial exitoso (`notes`)
- update parcial exitoso (`rules`)

### ❌ Errores de validación (400 Bad Request)

- body vacío
- body inválido (array en vez de objeto)
- campo no soportado (`status`)
- campos mixtos con no soportado
- `name` vacío
- `premise` vacío
- `rules` no array
- `rules` con item no string
- `rules` con item vacío
- `rules` duplicadas (case-insensitive)
- `notes` no string
- `notes` vacío
- `id` vacío/en blanco

### 🔍 Recurso no encontrado (404 Not Found)

- universe no existe

### ⚠️ Conflicto (409 Conflict)

- conflicto de `name` con otro universe en `ACTIVE` o `DRAFT`

### 💥 Error interno (500 Internal Server Error)

- falla inesperada en repo/DB

**Notas importantes:**

- El formato de error esperado es `{ "error": "mensaje" }`.
- El campo `status` no se modifica mediante PATCH genérico.
- El endpoint de update parcial debe rechazar bodies no objeto y campos no soportados antes de intentar persistir.
- El conflicto de `name` aplica contra universes en `ACTIVE` o `DRAFT`.
