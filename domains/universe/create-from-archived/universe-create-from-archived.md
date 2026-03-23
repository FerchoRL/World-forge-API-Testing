# Universe - Create from archived

API: `POST /universes/:id/create-from-archived`

## Objetivo

Validar el endpoint que crea un nuevo universo a partir de un universo origen en estado `ARCHIVED`, sin request body y sin overrides. El nuevo universo se crea directamente a partir del origen archivado y cualquier modificacion posterior ocurre mediante el flujo normal de edicion.

## Scenarios

### 1. 201 Created - Crea un nuevo Universe desde un origen ARCHIVED

Descripcion:

- Crea un nuevo `Universe` a partir de un `Universe` origen con status `ARCHIVED`.
- La creacion se realiza directamente, sin body ni edicion previa en el request.
- El nuevo `Universe` recibe un `id` nuevo.
- El nuevo `Universe` inicia siempre en estado `DRAFT`.
- El nuevo `Universe` copia automaticamente:
  - `name`
  - `premise`
  - `rules`
  - `notes`

Expected result:

- Status code: 201
- El endpoint no requiere body para crear el nuevo `Universe`.
- Se crea un nuevo `Universe` con `id` distinto al origen.
- El nuevo `Universe` queda en status `DRAFT`.
- El nuevo `Universe` copia `name`, `premise`, `rules` y `notes` del origen archivado.

### 2. 201 Created - No modifica el Universe archivado original

Descripcion:

- La operacion crea un nuevo `Universe`.
- El `Universe` origen archivado permanece intacto.

Expected result:

- Status code: 201
- El `Universe` original conserva su mismo `id`.
- El `Universe` original conserva su status `ARCHIVED`.
- El `Universe` original no cambia sus datos por efecto de la creacion del nuevo registro.

### 3. 404 Not Found - Universo origen no existe

Descripcion:

- Devuelve error si el `Universe` origen no existe.

Expected result:

- Status code: 404
- Response con mensaje de recurso no encontrado.

### 4. 400 Bad Request - sourceUniverseId invalido o vacio

Descripcion:

- Devuelve error si el `sourceUniverseId` es invalido o vacio.

Expected result:

- Status code: 400
- Response con mensaje de validacion del identificador.

### 5. 400 Bad Request - Universe origen no esta en ARCHIVED

Descripcion:

- Devuelve error si el `Universe` origen existe pero no esta en status `ARCHIVED`.

Expected result:

- Status code: 400
- Response con mensaje de validacion de estado invalido para esta operacion.

### 6. 409 Conflict - Violacion de reglas de unicidad

Descripcion:

- Devuelve error si al crear el nuevo `Universe` se violan las reglas de unicidad vigentes.

Ejemplo esperado:

- Conflicto por `name` ya existente para un `Universe` en estado `DRAFT` o `ACTIVE`.

Expected result:

- Status code: 409
- Response con mensaje de conflicto por regla de unicidad.
