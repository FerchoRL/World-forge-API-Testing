# Character – Update (PATCH /characters/:id)

## Objetivo

Validar el comportamiento del endpoint de actualización parcial de personajes, asegurando que:

- Permite actualizaciones parciales de campos individuales o múltiples
- **El campo `status` NO se puede modificar** - Las transiciones de estado se manejan mediante acciones de dominio explícitas
- Valida estrictamente todos los campos enviados en el body
- **Retorna 404 Not Found** cuando el ID no existe en el sistema
- **Retorna 400 Bad Request** para IDs faltantes, campos inválidos, o body vacío
- Mantiene un contrato HTTP consistente con formato de error `{ "error": "mensaje" }`
- Mantiene integridad referencial con la base de datos (MongoDB)
- Maneja errores técnicos inesperados retornando 500

## Endpoint

`PATCH /characters/:id`

## Request Body (Partial)

Todos los campos son opcionales en un PATCH, pero si se envían deben cumplir validación:

```json
{
  "name": "string (opcional)",
  "categories": ["CategoryName"] (opcional, pero si se envía debe ser array válido),
  "identity": "string (opcional)",
  "inspirations": ["string"] (opcional, pero si se envía debe ser array válido),
  "notes": "string | undefined (opcional)"
}
```

**Nota importante sobre el campo `status`:**

- El campo `status` **NO se puede modificar** mediante PATCH
- Las transiciones de estado (publish, unpublish, archive) se manejan mediante acciones de dominio explícitas
- Separar el cambio de estado mejora la claridad del dominio y permite validar transiciones

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

### Validación de campos

```json
{
  "error": "Character Name is required"
}
```

```json
{
  "error": "Character Identity is required"
}
```

```json
{
  "error": "Categories must be an array"
}
```

```json
{
  "error": "At least one Category is required"
}
```

```json
{
  "error": "Category <category> is not valid"
}
```

```json
{
  "error": "Categories must not contain duplicates"
}
```

```json
{
  "error": "Inspirations must be an array"
}
```

```json
{
  "error": "At least one Inspiration is required"
}
```

```json
{
  "error": "Each Inspiration must be a non-empty string"
}
```

```json
{
  "error": "Notes must be a string"
}
```

### Campos no soportados

```json
{
  "error": "Patch contains unsupported fields: status"
}
```

Retornado cuando se intenta enviar campos que no están permitidos en un PATCH. El campo `status` no se puede modificar mediante PATCH genérico - las transiciones de estado se manejan mediante acciones de dominio explícitas.

### Body vacío

```json
{
  "error": "Patch must include at least one updatable field"
}
```

**Nota importante:** El formato de error es `{ "error": "mensaje" }` (no `message`), gestionado por middleware global.

## Response (404 Not Found)

### Ruta no encontrada

```json
{
  "error": "Route not found"
}
```

Retornado cuando se intenta acceder a una ruta que no está registrada en el router (ej. `/characters/` sin ID). Manejado por el middleware global de 404.

### Personaje no encontrado

```json
{
  "error": "Character not found"
}
```

Retornado cuando el ID proporcionado no existe en la base de datos.

**Nota:** No se valida formato inválido de ID (ej. @@@). Cualquier ID que no existe devuelve 404.

## Response (500 Internal Server Error)

```json
{
  "error": "<mensaje del error>"
}
```

Retornado cuando ocurre un error técnico inesperado en DB o cualquier falla interna no controlada.

## Test Cases

### TC-CHAR-UPDATE-01 – Multiple fields update – Returns 200

**Descripción:**

Cuando se actualizan múltiples campos válidos simultáneamente (name, identity, notes, etc.), el backend debe procesar todos los cambios correctamente.

**Request:**

```text
PATCH /characters/{existingId}
Content-Type: application/json

{
  "name": "Updated Name",
  "identity": "Updated Identity",
  "notes": "Updated notes"
}
```

**Expected Result:**

- Status Code: 200
- Response contiene character con todos los campos actualizados
- Los cambios se persisten en la base de datos

---

### TC-CHAR-UPDATE-02 – Valid categories update – Returns 200

**Descripción:**

Cuando se actualiza el campo `categories` con valores válidos (existentes) y sin duplicados, el backend debe procesarlo correctamente.

**Request:**

```text
PATCH /characters/{existingId}
Content-Type: application/json

{
  "categories": ["Protagonist", "Hero"]
}
```

**Expected Result:**

- Status Code: 200
- Response contiene character con las nuevas categorías válidas
- Las categorías deben existir en el enum y no tener duplicados
- El cambio se persiste en la base de datos

---

### TC-CHAR-UPDATE-03 – Valid inspirations update – Returns 200

**Descripción:**

Cuando se actualiza el campo `inspirations` con un array válido de strings no vacíos, el backend debe procesarlo correctamente.

**Request:**

```text
PATCH /characters/{existingId}
Content-Type: application/json

{
  "inspirations": ["New Inspiration 1", "New Inspiration 2"]
}
```

**Expected Result:**

- Status Code: 200
- Response contiene character con las nuevas inspiraciones
- El cambio se persiste en la base de datos

---

### TC-CHAR-UPDATE-04 – Missing character ID – Returns 404

**Descripción:**

Cuando se intenta hacer PATCH sin proporcionar un ID en la URL (/characters/), el middleware global de 404 responde indicando que la ruta no fue encontrada.

**Request:**

```text
PATCH /characters/
Content-Type: application/json

{
  "name": "Some Name"
}
```

**Expected Result:**

- Status Code: 404
- Response body:

  ```json
  { "error": "Route not found" }
  ```

**Nota:** El middleware global de 404 se ejecuta porque la ruta `/characters/` sin ID no coincide con ninguna ruta registrada en el router.

---

### TC-CHAR-UPDATE-05 – Non-existent character ID – Returns 404

**Descripción:**

Cuando se intenta actualizar un personaje con un ID que no existe en el sistema, el backend debe responder con 404 Not Found.

**Request:**

```text
PATCH /characters/char_nonexistent123
Content-Type: application/json

{
  "name": "Updated Name"
}
```

**Expected Result:**

- Status Code: 404
- Response body:

  ```json
  { "error": "Character not found after update" }
  ```

**Nota:** No se valida formato inválido de ID (ej. @@@). Si el ID no existe (incluyendo IDs con formato "inválido" como @@@), se retorna 404.

---

### TC-CHAR-UPDATE-06 – Unsupported field (status) – Returns 400

**Descripción:**

Cuando se intenta enviar el campo `status` en un PATCH, el backend debe rechazarlo indicando que es un campo no soportado. El campo `status` no se puede modificar mediante PATCH genérico - las transiciones de estado se manejan mediante acciones de dominio explícitas (publish, unpublish, archive).

**Request:**

```text
PATCH /characters/{existingId}
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

**Expected Result:**

- Status Code: 400
- Response body:

  ```json
  { "error": "Patch contains unsupported fields: status" }
  ```

**Nota:** No importa si el valor de status es válido o inválido, el campo completo está prohibido en PATCH.

---

### TC-CHAR-UPDATE-07 – Invalid name variations – Returns 400

**Descripción:**

Cuando se envía el campo `name` con valores inválidos (vacío, espacios, null, boolean), el backend debe responder con error de validación.

**Casos a probar:**

- `name: ""` (empty)
- `name: "   "` (spaces)
- `name: null`
- `name: false`
- `name: true`

**Nota:** El caso "missing" (no enviar el campo) no aplica en PATCH porque es una actualización parcial. Si no se envía `name`, simplemente no se actualiza y no hay error de validación. Si se envía un payload vacío, retorna "Patch must include at least one updatable field".

**Expected Result:**

- Status Code: 400
- Response body:

  ```json
  { "error": "Character Name is required" }
  ```

---

### TC-CHAR-UPDATE-07B – Duplicate character name against ACTIVE/DRAFT – Returns 409

**Descripción:**

Cuando se intenta actualizar un personaje con un nombre que ya está siendo usado por otro personaje en estado `ACTIVE` o `DRAFT`, el backend debe responder con error de conflicto.

**Request:**

```text
PATCH /characters/{characterId}
Content-Type: application/json

{
  "name": "Existing Character Name"
}
```

**Cucumber Table sugerida para cubrir ambos estados (ACTIVE y DRAFT):**

```gherkin
When I attempt to update a character with an already existing name from statuses:
  | status |
  | ACTIVE |
  | DRAFT  |
```

**Expected Result:**

- Status Code: 409
- Response body:

  ```json
  { "error": "Character name already exists for an ACTIVE or DRAFT character" }
  ```

**Nota:** Este test requiere que exista otro personaje con el nombre que se intenta usar en estado `ACTIVE` o `DRAFT`. La validación de unicidad aplica a nivel sistema para personajes vigentes.

---

### TC-CHAR-UPDATE-07C – Reuse archived name (Hu Tao) – Returns 200

**Descripción:**

Cuando se actualiza un personaje usando un nombre que solo existe en un personaje `ARCHIVED`, la operación debe ser permitida.

**Precondición:**

- Existe en DB un personaje con `name = "Hu Tao"` y `status = "ARCHIVED"`.

**Request:**

```text
PATCH /characters/{characterId}
Content-Type: application/json

{
  "name": "Hu Tao"
}
```

**Expected Result:**

- Status Code: 200
- El personaje se actualiza correctamente con el nombre `Hu Tao`.
- No debe retornar conflicto de unicidad.

---

### TC-CHAR-UPDATE-08 – Invalid identity variations – Returns 400

**Descripción:**

Cuando se envía el campo `identity` con valores inválidos (vacío, espacios, null, boolean), el backend debe responder con error de validación.

**Casos a probar:**

- `identity: ""` (empty)
- `identity: "   "` (spaces)
- `identity: null`
- `identity: false`
- `identity: true`

**Nota:** El caso "missing" (no enviar el campo) no aplica en PATCH porque es una actualización parcial. Si no se envía `identity`, simplemente no se actualiza y no hay error de validación.

**Expected Result:**

- Status Code: 400
- Response body:

  ```json
  { "error": "Character Identity is required" }
  ```

---

### TC-CHAR-UPDATE-09 – Invalid categories type – Returns 400

**Descripción:**

Cuando se envía el campo `categories` con tipo inválido o vacío, el backend debe responder con error de validación.

**Casos a probar:**

| type         | expectedError                     |
|--------------|---------------------------------  |
| null         | Categories must be an array       |
| booleanTrue  | Categories must be an array       |
| booleanFalse | Categories must be an array       |
| number       | Categories must be an array       |
| string       | Categories must be an array       |
| empty        | At least one Category is required |

**Nota:** El caso "missing" (no enviar el campo) no aplica en PATCH porque es una actualización parcial. Si no se envía `categories`, simplemente no se actualiza y no hay error de validación.

**Expected Result:**

- Status Code: 400
- Response body contiene el mensaje de error correspondiente

---

### TC-CHAR-UPDATE-10 – Invalid category value – Returns 400

**Descripción:**

Cuando se envía `categories` con valores que no existen en el enum de categorías válidas, el backend debe responder con error de validación.

**Request:**

```text
PATCH /characters/{existingId}
Content-Type: application/json

{
  "categories": ["CategoriaInvalida"]
}
```

**Expected Result:**

- Status Code: 400
- Response body:

  ```json
  { "error": "Category CategoriaInvalida is not valid" }
  ```

---

### TC-CHAR-UPDATE-11 – Duplicate categories – Returns 400

**Descripción:**

Cuando se envía `categories` con valores duplicados, el backend debe responder con error de validación.

**Request:**

```text
PATCH /characters/{existingId}
Content-Type: application/json

{
  "categories": ["Hero", "Hero"]
}
```

**Expected Result:**

- Status Code: 400
- Response body:

  ```json
  { "error": "Categories must not contain duplicates" }
  ```

---

### TC-CHAR-UPDATE-12 – Invalid inspirations type – Returns 400

**Descripción:**

Cuando se envía el campo `inspirations` con tipo inválido o vacío, el backend debe responder con error de validación.

**Casos a probar:**

| type         | expectedError                        |
|--------------|---------------------------------     |
| null         | Inspirations must be an array        |
| booleanTrue  | Inspirations must be an array        |
| booleanFalse | Inspirations must be an array        |
| number       | Inspirations must be an array        |
| string       | Inspirations must be an array        |
| empty        | At least one Inspiration is required |

**Nota:** El caso "missing" (no enviar el campo) no aplica en PATCH porque es una actualización parcial. Si no se envía `inspirations`, simplemente no se actualiza y no hay error de validación.

**Expected Result:**

- Status Code: 400
- Response body contiene el mensaje de error correspondiente

---

### TC-CHAR-UPDATE-13 – Invalid inspiration item – Returns 400

**Descripción:**

Cuando se envía `inspirations` con items inválidos (vacíos, espacios, números como string, booleans como string), el backend debe responder con error de validación.

**Casos a probar:**

- `inspirations: [""]`
- `inspirations: ["   "]`
- `inspirations: ["123"]`
- `inspirations: ["true"]`

**Expected Result:**

- Status Code: 400
- Response body:

  ```json
  { "error": "Each Inspiration must be a non-empty string" }
  ```

---

### TC-CHAR-UPDATE-14 – Invalid notes type – Returns 400

**Descripción:**

Cuando se envía el campo `notes` con tipo inválido (null, boolean, number), el backend debe responder con error de validación.

**Casos a probar:**

- `notes: null`
- `notes: true`
- `notes: false`
- `notes: 123`

**Expected Result:**

- Status Code: 400
- Response body:

  ```json
  { "error": "Notes must be a string" }
  ```

**Nota:** A diferencia de CREATE, en UPDATE no se valida `notes` vacío o solo espacios.

---

### TC-CHAR-UPDATE-15 – Empty patch body – Returns 400

**Descripción:**

Cuando se envía un body vacío `{}`, el backend debe responder con error de validación indicando que se debe incluir al menos un campo actualizable.

**Request:**

```text
PATCH /characters/{existingId}
Content-Type: application/json

{}
```

**Expected Result:**

- Status Code: 400
- Response body:

  ```json
  { "error": "Patch must include at least one updatable field" }
  ```

**Nota:** La validación de campos no permitidos/desconocidos está cubierta en TC-CHAR-UPDATE-06 (Unsupported field).

---

### TC-CHAR-UPDATE-16 – Internal server error – Returns 500 (TODO)

**Descripción:**

Cuando ocurre un error técnico inesperado en DB o cualquier falla interna, el endpoint debe responder con error interno.

**Request:**

```text
PATCH /characters/{existingId}
Content-Type: application/json

{
  "name": "Updated Name"
}
```

⚠️ Este escenario requiere soporte del backend para forzar error (env / header).

**Expected Result:**

- Status Code: 500
- Response body:

  ```json
  { "error": "Error updating character" }
  ```

---

## Resumen de Escenarios Cubiertos

### ✅ Actualizaciones exitosas (200 OK)

| Request | Description |
|---------|-------------|

| `PATCH /characters/{id}` con `{ "status": "ARCHIVED" }` | Actualización parcial de status (incluyendo archivado) |
| `PATCH /characters/{id}` con múltiples campos | Actualización de name, identity, notes, etc. |
| `PATCH /characters/{id}` con `{ "categories": [...] }` | Actualización de categorías válidas sin duplicados |
| `PATCH /characters/{id}` con `{ "inspirations": [...] }` | Actualización de inspiraciones válidas |

### ❌ Errores de validación (400 Bad Request)

| Escenario | Error Message |
|-----------|---------------|

| ID faltante (/characters/) | `{ "error": "Character id is required" }` |
| status inválido | `{ "error": "<mensaje de status inválido>" }` |
| name inválido (empty/spaces/null/boolean/missing) | `{ "error": "Character Name is required" }` |
| identity inválida (empty/spaces/null/boolean/missing) | `{ "error": "Character Identity is required" }` |
| categories tipo inválido | `{ "error": "Categories must be an array" }` |
| categories vacío | `{ "error": "At least one Category is required" }` |
| Categoría no existente | `{ "error": "Category <name> is not valid" }` |
| Categorías duplicadas | `{ "error": "Categories must not contain duplicates" }` |
| inspirations tipo inválido | `{ "error": "Inspirations must be an array" }` |
| inspirations vacío | `{ "error": "At least one Inspiration is required" }` |
| Inspiration item inválido | `{ "error": "Each Inspiration must be a non-empty string" }` |
| notes tipo inválido | `{ "error": "Notes must be a string" }` |
| Body vacío | `{ "error": "Patch must include at least one updatable field" }` |

### ⚠️ Conflicto (409 Conflict)

- Escenario: Nombre duplicado
- Error Message: `{ "error": "Character name already exists for an ACTIVE or DRAFT character" }`

### 🔍 Recurso no encontrado (404 Not Found)

| Request | Error Message |
|---------|---------------|

| `PATCH /characters/{nonExistentId}` | `{ "error": "Character not found" }` |

### 💥 Errores internos (500 Internal Server Error)

| Escenario | Error Message |
|-----------|---------------|

| Error técnico en DB | `{ "error": "Error updating character" }` |

**Notas importantes:**

- El formato de error es `{ "error": "mensaje" }` (no `message`), gestionado por middleware global.
- PATCH permite actualizaciones parciales - solo los campos enviados se validan y actualizan.
- No hay operación DELETE física - se usa `status: "ARCHIVED"` para archivar personajes.
- El código 404 se usa cuando el ID no existe en DB (sin validar formato).
- El código 400 se usa para errores de validación.
- No se valida formato inválido de ID - cualquier ID que no existe devuelve 404.
- A diferencia de CREATE, en UPDATE se valida el campo `name` y `identity` incluso cuando falta (missing).
