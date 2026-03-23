# Character - Create from archived

API: `POST /characters/:id/create-from-archived`

## Objetivo

Validar el endpoint que crea un nuevo character a partir de un character origen en estado `ARCHIVED`, sin request body y sin overrides. El nuevo character se crea directamente a partir del origen archivado y cualquier modificacion posterior ocurre mediante el flujo normal de edicion.

## Scenarios

### 1. 201 Created - Crea un nuevo Character desde un origen ARCHIVED

Descripcion:

- Crea un nuevo `Character` a partir de un `Character` origen con status `ARCHIVED`.
- La creacion se realiza directamente, sin body ni edicion previa en el request.
- El nuevo `Character` recibe un `id` nuevo.
- El nuevo `Character` inicia siempre en estado `DRAFT`.
- El nuevo `Character` copia automaticamente:
  - `name`
  - `identity`
  - `categories`
  - `inspirations`
  - `notes`
  - `image`

Expected result:

- Status code: 201
- El endpoint no requiere body para crear el nuevo `Character`.
- Se crea un nuevo `Character` con `id` distinto al origen.
- El nuevo `Character` queda en status `DRAFT`.
- El nuevo `Character` copia `name`, `identity`, `categories`, `inspirations`, `notes` e `image` del origen archivado.

### 2. 201 Created - No modifica el Character archivado original

Descripcion:

- La operacion crea un nuevo `Character`.
- El `Character` origen archivado permanece intacto.

Expected result:

- Status code: 201
- El `Character` original conserva su mismo `id`.
- El `Character` original conserva su status `ARCHIVED`.
- El `Character` original no cambia sus datos por efecto de la creacion del nuevo registro.

### 3. 404 Not Found - Character origen no existe

Descripcion:

- Devuelve error si el `Character` origen no existe.

Expected result:

- Status code: 404
- Response con mensaje de recurso no encontrado.

### 4. 400 Bad Request - sourceCharacterId invalido o vacio

Descripcion:

- Devuelve error si el `sourceCharacterId` es invalido o vacio.

Expected result:

- Status code: 400
- Response con mensaje de validacion del identificador.

### 5. 400 Bad Request - Character origen no esta en ARCHIVED

Descripcion:

- Devuelve error si el `Character` origen existe pero no esta en status `ARCHIVED`.

Expected result:

- Status code: 400
- Response con mensaje de validacion de estado invalido para esta operacion.

### 6. 409 Conflict - Violacion de reglas de unicidad

Descripcion:

- Devuelve error si al crear el nuevo `Character` se violan las reglas de unicidad vigentes.

Ejemplo esperado:

- Conflicto por `name` ya existente para un `Character` en estado `DRAFT` o `ACTIVE`.

Expected result:

- Status code: 409
- Response con mensaje de conflicto por regla de unicidad.