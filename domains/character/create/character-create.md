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

### TC-CHAR-CREATE-01 – Valid payload – Returns 201 and persists character in database

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

### TC-CHAR-CREATE-03 – Invalid status value – Returns 400 (si backend lo valida)

Descripción:

Si se envía un status inválido (ej: "UNKNOWN"), debe fallar.

Expected Result:

- Status Code: 400
- error de validación

### TC-CHAR-CREATE-04 – Missing name – Returns 400

Descripción:

Si name es null, vacío o solo espacios, debe retornar error de validación.

Request:

Body sin name o name = "" o " "

Expected Result:

- Status Code: 400
- Response contiene: error: "Character Name is required"

### TC-CHAR-CREATE-05 – Missing identity – Returns 400

Descripción:

Si identity es null, vacío o solo espacios, debe retornar error.

Expected Result:

- Status Code: 400
- error: "Character Identity is required"

### TC-CHAR-CREATE-06 – Missing categories – Returns 400

Descripción:

Si categories no existe o es arreglo vacío, debe fallar.

Expected Result:

- Status Code: 400
- error: "At least one Category is required"

### TC-CHAR-CREATE-07 – Invalid category – Returns 400

Descripción:

Si alguna categoría enviada no existe en CATEGORIES, debe fallar.

Request:

categories: ["CategoriaInexistente"]

Expected Result:

- Status Code: 400
- error contiene: "Category CategoriaInexistente is not valid"

### TC-CHAR-CREATE-08 – Missing inspirations – Returns 400

Descripción:

Si inspirations no existe o es arreglo vacío, debe fallar.

Expected Result:

- Status Code: 400
- error: "At least one Inspiration is required"

### TC-CHAR-CREATE-09 – Missing notes – Still valid

Descripción:

notes es opcional. Si no se envía, la creación debe ser exitosa.

Expected Result:

- Status Code: 201
- notes no está presente o es undefined
- Persistencia correcta

### TC-CHAR-CREATE-10 – Extra unknown fields – Ignored or rejected (según contrato)

Descripción:

Si se envían campos adicionales no definidos en el contrato, validar comportamiento esperado (ignorar o fallar).

Expected Result:

- Si el backend los ignora:
- Status Code: 201
- Campos extra no aparecen en respuesta

Si los rechaza:

- Status Code: 400

### TC-CHAR-CREATE-11 – Persisted data matches database

Descripción:

Después de crear el personaje exitosamente, los datos retornados deben coincidir exactamente con los persistidos en Mongo.

Expected Result:

- Status Code: 201
- API DTO mapeado coincide con documento Mongo (usando mapper y modelo canónico)

### TC-CHAR-CREATE-12 – Internal server error – Returns 500

Descripción:

Cuando ocurre un error inesperado en el backend durante la creación.

Expected Result:

- Status Code: 500
- error: "Internal Server Error"
