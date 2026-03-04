# Universe – Create (POST /universes)

Endpoint: `POST /universes`

## Objetivo

Validar el comportamiento del endpoint de creación de universos, asegurando que:

- Crea un universe correctamente cuando el payload es válido.
- Aplica valores por defecto cuando corresponde (`status = DRAFT`).
- Valida campos obligatorios (`name`, `premise`).
- Valida reglas de `rules` (tipo, contenido y duplicados).
- Valida reglas de `notes` cuando se envía.
- Mantiene un contrato HTTP consistente.
- Persiste correctamente en base de datos.
- Maneja errores de validación (400), conflicto de persistencia (409) y errores internos (500).

Este endpoint expone errores de validación (400) cuando el input no cumple las reglas de negocio.

## Request Body (CreateUniverseRequest)

```json
{
  "name": "Eclipsed Realms",
  "status": "ACTIVE",
  "premise": "Un multiverso fracturado en el que cada reino protege una reliquia capaz de alterar la memoria colectiva.",
  "rules": [
    "La magia exige un costo emocional proporcional al efecto",
    "Ningún viajero puede alterar su línea de origen"
  ],
  "notes": "Universo orientado a conflictos políticos y exploración de identidad"
}
```

### Campos request

- name: string (obligatorio, no vacío, no solo espacios)
- status: string (opcional, valores permitidos: `DRAFT | ACTIVE`, default = `DRAFT`)
- premise: string (obligatorio, no vacío, no solo espacios)
- rules: string[] (opcional, si existe: array, cada item string no vacío, sin duplicados case-insensitive y trim-aware)
- notes: string (opcional, si existe: string no vacío, no solo espacios)

## Response (201 Created)

```json
{
  "universe": {
    "id": "uni_ab12cd34",
    "name": "Eclipsed Realms",
    "status": "ACTIVE",
    "premise": "Un multiverso fracturado en el que cada reino protege una reliquia capaz de alterar la memoria colectiva.",
    "rules": [
      "La magia exige un costo emocional proporcional al efecto",
      "Ningún viajero puede alterar su línea de origen"
    ],
    "notes": "Universo orientado a conflictos políticos y exploración de identidad"
  }
}
```

### Campos response

- `universe.id`: string generado por backend
- `universe.name`: refleja valor persistido
- `universe.status`: refleja valor persistido (debe ser `DRAFT` cuando no se envía status)
- `universe.premise`: refleja valor persistido
- `universe.rules`: opcional
- `universe.notes`: opcional

## Response de Error (formato)

```json
{
  "error": "mensaje"
}
```

## Test Cases

### TC-UNIVERSE-CREATE-01 – Crear universe con valores mínimos – Returns 201 and defaults to DRAFT

Descripción:

Si solo se envían `name` y `premise` válidos, el backend debe crear el universe y asignar `status = DRAFT` por defecto.

Request:

`POST /universes`

Body:

```json
{
  "name": "Eclipsed Realms",
  "premise": "Un multiverso fracturado..."
}
```

Expected Result:

- Status Code: 201
- Response body contiene `{ universe: UniverseDTO }`
- `universe.status = "DRAFT"`

### TC-UNIVERSE-CREATE-02 – Crear universe con payload completo y status explícito (DRAFT | ACTIVE) – Returns 201

Descripción:

Si se envía un payload completo con todos los campos (`name`, `status`, `premise`, `rules`, `notes`) y `status` válido (`DRAFT` o `ACTIVE`), el backend debe crear correctamente.

Expected Result:

- Status Code: 201
- Response body contiene `{ universe: UniverseDTO }`
- `universe.status` coincide con el valor enviado (`DRAFT` o `ACTIVE`)

### TC-UNIVERSE-CREATE-03 – Invalid name (missing, non-string, empty/spaces) – Returns 400

Expected Result:

- Status Code: 400
- Error exacto: `Universe name is required`

### TC-UNIVERSE-CREATE-04 – Invalid premise (missing, non-string, empty/spaces) – Returns 400

Expected Result:

- Status Code: 400
- Error exacto: `Universe premise is required`

### TC-UNIVERSE-CREATE-05 – rules is not array – Returns 400

Expected Result:

- Status Code: 400
- Error exacto: `Universe rules must be an array`

### TC-UNIVERSE-CREATE-06 – rules contains non-string item – Returns 400

Expected Result:

- Status Code: 400
- Error exacto: `Each universe rule must be a string`

### TC-UNIVERSE-CREATE-07 – rules contains empty/blank string – Returns 400

Expected Result:

- Status Code: 400
- Error exacto: `Universe rules cannot contain empty values`

### TC-UNIVERSE-CREATE-08 – rules contains duplicates (case-insensitive, trim-aware) – Returns 400

Descripción:

Debe fallar para casos como: `"No cure"` y `" no cure "`.

Expected Result:

- Status Code: 400
- Error exacto: `Universe rules must not contain duplicates`

### TC-UNIVERSE-CREATE-09 – notes is not string – Returns 400

Expected Result:

- Status Code: 400
- Error exacto: `Universe notes must be a string`

### TC-UNIVERSE-CREATE-10 – notes empty/blank – Returns 400

Expected Result:

- Status Code: 400
- Error exacto: `Universe notes cannot be empty`

### TC-UNIVERSE-CREATE-11 – Invalid status (not DRAFT|ACTIVE) – Returns 400

Descripción:

Para cualquier status fuera del enum permitido (ej. `ARCHIVED`), debe fallar con mensaje interpolado.

Expected Result:

- Status Code: 400
- Error exacto: `Status <INVALID_VALUE> is not valid. Allowed values: DRAFT | ACTIVE`

Ejemplo:

- `Status ARCHIVED is not valid. Allowed values: DRAFT | ACTIVE`

### TC-UNIVERSE-CREATE-12 – Duplicate name against ACTIVE/DRAFT universe (partial unique index) – Returns 409

Descripción:

Si el nombre ya existe en un universe con estado `ACTIVE` o `DRAFT`, debe mapearse a conflicto.

Expected Result:

- Status Code: 409
- Error exacto: `Universe name already exists for an ACTIVE or DRAFT universe`

### TC-UNIVERSE-CREATE-13 – Mongoose validation error while creating – Returns 500

Descripción:

Si ocurre un error de validación de Mongoose en persistencia, debe retornarse su mensaje o fallback definido.

Expected Result:

- Status Code: 500
- Error: `err.message` de Mongoose o fallback `Validation error while creating universe`

### TC-UNIVERSE-CREATE-14 – Unexpected database error while creating – Returns 500

Descripción:

Si ocurre un error inesperado de DB, debe retornarse su mensaje o fallback definido.

Expected Result:

- Status Code: 500
- Error: `err.message` o fallback `Error creating universe in database`

---

## Resumen de Escenarios Cubiertos

### ✅ Casos exitosos (201 Created)

| Escenario | Resultado |

|---|---|
| crear universe con valores mínimos (name + premise) | `{ universe: UniverseDTO }` con `status = DRAFT` |
| payload completo con `status = DRAFT` o `status = ACTIVE` | `{ universe: UniverseDTO }` |

### ❌ Errores de validación (400 Bad Request)

| Escenario | Error exacto |

|---|---|
| name faltante/no string/vacío/espacios | `Universe name is required` |
| premise faltante/no string/vacío/espacios | `Universe premise is required` |
| rules no array | `Universe rules must be an array` |
| rules item no string | `Each universe rule must be a string` |
| rules item vacío/espacios | `Universe rules cannot contain empty values` |
| rules con duplicados (case-insensitive, trim-aware) | `Universe rules must not contain duplicates` |
| notes no string | `Universe notes must be a string` |
| notes vacío/espacios | `Universe notes cannot be empty` |
| status inválido | `Status <INVALID_VALUE> is not valid. Allowed values: DRAFT | ACTIVE` |

### ⚠️ Conflicto de persistencia (409 Conflict)

| Escenario | Error exacto |

|---|---|
| name duplicado en universo ACTIVE/DRAFT | `Universe name already exists for an ACTIVE or DRAFT universe` |

### 💥 Errores internos (500 Internal Server Error)

| Escenario | Error esperado |

|---|---|
| Validación Mongoose en create | `err.message` o `Validation error while creating universe` |
| Error inesperado de BD | `err.message` o `Error creating universe in database` |

## Notas importantes

- El contrato exitoso esperado es siempre `{ universe: UniverseDTO }`.
- El formato de error esperado es `{ "error": "mensaje" }`.
- Los mensajes de validación deben verificarse de forma exacta.
- El caso de status inválido debe validar interpolación del valor recibido.
