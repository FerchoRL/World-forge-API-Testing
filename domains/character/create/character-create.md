# Character – Create (POST /characters)

Endpoint: `POST /characters`

## Objetivo

Validar el comportamiento del endpoint de creación de personajes, asegurando que:

- Crea un personaje correctamente cuando el payload es válido.
- Aplica valores por defecto cuando corresponda (status = DRAFT).
- Valida campos obligatorios.
- Rechaza categorías inválidas.
- Mantiene un contrato HTTP consistente.
- Persiste correctamente en base de datos.
- Maneja errores de validación (400) y errores internos (500).

Este endpoint expone errores de validación (400) cuando el input no cumple las reglas de negocio.

## Request Body (CreateCharacterRequest)

```json
{
  "name": "Hu Tao",
  "status": "ACTIVE",
  "categories": ["Emocional"],
  "identity": "Descripción interna del personaje",
  "inspirations": ["Genshin Impact"],
  "notes": "Opcional"
}
```

### Campos request

- name: string (obligatorio, no vacío)
- status: string (opcional, default = DRAFT)
- categories: string[] (obligatorio, al menos 1, deben existir en CATEGORIES)
- identity: string (obligatorio, no vacío)
- inspirations: string[] (obligatorio, al menos 1)
- notes: string (opcional)

## Response (201 Created)

```ts
{
  "id": "char_ab12cd34",
  "name": "Hu Tao",
  "status": "ACTIVE",
  "categories": ["Emocional"],
  "identity": "Descripción interna del personaje",
  "inspirations": ["Genshin Impact"],
  "notes": "Opcional"
}
```

### Campos response

- id string (generado por el backend)
- El resto refleja los valores persistidos
- status debe ser DRAFT si no se envio

## Test Cases

### TC-CHAR-CREATE-01 – Valid payload – Returns 201 and can be retrieved by ID

Descripción:

Cuando el payload es completamente válido, el backend debe crear el personaje y retornar 201.

Request:

``POST /characters``

Body válido completo.

Expected Result:

- Status Code: 201
- Response contiene id generado
- name coincide con el enviado
- status coincide con el enviado
- categories coincide
- identity coincide
- inspirations coincide
- notes coincide
- El personaje existe en base de datos

### TC-CHAR-CREATE-02 – Missing status – Defaults to DRAFT

Descripción:

Si no se envía status, el backend debe asignar DRAFT por defecto.

Request:

``POST /characters``

Body sin campo status.

Expected Result:

- Status Code: 201
- status = "DRAFT"
- Persistido en DB con status DRAFT

### TC-CHAR-CREATE-03 – Invalid status value – Returns 400

Descripción:

Si se envía un status inválido (ej: "UNKNOWN"), debe fallar.

Expected Result:

- Status Code: 400
- error de validación

### TC-CHAR-CREATE-04 – Missing name – Returns 400

Descripción:

Si el campo name es inválido (vacío, solo espacios, null, booleano o propiedad ausente), el backend debe retornar un error de validación.

Body con variaciones inválidas para name:

- "" (string vacío)
- " " (solo espacios)
- null
- true
- false
- propiedad name ausente

Expected Result:

- Status Code: 400
- Response contiene: error: "Character Name is required"

### TC-CHAR-CREATE-05 – Missing identity – Returns 400

Descripción:

Si el campo identity es inválido (vacío, solo espacios, null, booleano o propiedad ausente), el backend debe retornar un error de validación.

Request:

``POST /characters``

Body con variaciones inválidas para identity:

- "" (string vacío)
- " " (solo espacios)
- null
- true
- false
- propiedad identity ausente

Expected Result:

- Status Code: 400
- error: "Character Identity is required"

### TC-CHAR-CREATE-06, 08, 09 – Missing categories – Returns 400

El campo `categories` es obligatorio y debe cumplir las siguientes reglas:

1. Debe existir en el payload.
2. Debe ser un arreglo.
3. Debe contener al menos un elemento.
4. No puede ser null.
5. Todos los elementos deben pertenecer a la lista VALID_CATEGORIES.
6. No debe contener valores inválidos.
7. No debe contener mezcla de valores válidos e inválidos.
8. (Opcional según regla de negocio) No debe contener valores duplicados.

Reglas de validación:

- categories missing → inválido
- categories: [] → inválido
- categories: null → inválido
- categories con tipo incorrecto (string, boolean, number) → inválido
- categories con valor fuera de VALID_CATEGORIES → inválido
- categories con mezcla válida + inválida → inválido
- categories con duplicados (si aplica regla de unicidad) → inválido

Expected Result:

- Status Code: 400

Errores esperados:

Para ausencia o vacío:

- error: "At least one Category is required"

Para valores inválidos:

- error: ``"Category <value> is not valid"``

Para duplicados (si aplica):

- error: "Duplicated Categories are not allowed"

### TC-CHAR-CREATE-7 – Invalid category – Returns 400

Descripción:

Si alguna categoría enviada no existe en CATEGORIES, debe fallar.

Request:

categories: ["CategoriaInexistente"]

Expected Result:

- Status Code: 400
- error contiene: "Category CategoriaInexistente is not valid"

### TC-CHAR-CREATE-10 y 11 – Missing inspirations – Returns 400

Descripción:

El campo `inspirations` debe cumplir las siguientes reglas:

1. Debe ser un arreglo.
2. Debe contener al menos un elemento.
3. Cada elemento debe ser un string no vacío (no puede ser vacío ni solo espacios).

Validaciones cubiertas:

#### 1️⃣ Inspirations no es un arreglo

Casos:

- missing
- null
- boolean
- number
- string

Expected Result:

- Status Code: 400
- error: "Inspirations must be an array"

---

#### 2️⃣ Inspirations es un arreglo vacío

Caso:

- []

Expected Result:

- Status Code: 400
- error: "At least one Inspiration is required"

---

#### 3️⃣ Inspirations contiene elementos inválidos

Casos:

- [""]
- ["   "]
- [123]
- [true]
- ["Valid inspiration", ""]

Expected Result:

- Status Code: 400
- error: "Each Inspiration must be a non-empty string"

### TC-CHAR-CREATE-12 - 13 - 14 – Notes validation

Descripción:

El campo `notes` es opcional.  
Si no se envía, la creación debe ser exitosa.

Sin embargo, si el campo está presente, debe cumplir las siguientes reglas:

1. Debe ser un string.
2. No puede estar vacío ni contener solo espacios.

---

Validaciones cubiertas:

#### 1️⃣ Missing notes (opcional)

Caso:

- notes no enviado

Expected Result:

- Status Code: 201
- notes no está presente o es undefined
- Persistencia correcta

---

#### 2️⃣ Notes con tipo inválido

Casos:

- notes = null
- notes = 123
- notes = true

Expected Result:

- Status Code: 400
- error: "Notes must be a string"

---

#### 3️⃣ Notes vacío o solo espacios

Casos:

- notes = ""
- notes = "   "

Expected Result:

- Status Code: 400
- error: "Notes cannot be empty"

---

Notas:

- `notes` es opcional, pero si existe debe cumplir las reglas de formato.
- Se valida tanto el tipo como el contenido.
- La ausencia del campo no debe generar error.

### TC-CHAR-CREATE-15 – Extra unknown fields – Ignored or rejected (según contrato)

Descripción:

Si se envían campos adicionales no definidos en el contrato, validar comportamiento esperado (ignorar o fallar).

Expected Result:

- Si el backend los ignora:
- Status Code: 201
- Campos extra no aparecen en respuesta

### TC-CHAR-CREATE-16 – Persisted data matches database

Descripción:

Después de crear el personaje exitosamente, los datos retornados deben coincidir exactamente con los persistidos en Mongo.

Expected Result:

- Status Code: 201
- API DTO mapeado coincide con documento Mongo (usando mapper y modelo canónico)

### TC-CHAR-CREATE-17 – Internal server error – Returns 500

Descripción:

Cuando ocurre un error inesperado en el backend durante la creación.

Expected Result:

- Status Code: 500
- error: "Internal Server Error"
