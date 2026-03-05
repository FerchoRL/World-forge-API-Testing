# Character – List (GET /characters)

Endpoint: ``GET /characters``

## Objetivo

Validar el comportamiento del endpoint de listado de personajes, asegurando que:

- Retorna una lista paginada de personajes.
- Aplica valores por defecto cuando no se envían parámetros.
- **Valida estrictamente los parámetros de paginación**, retornando 400 Bad Request para valores inválidos.
- Respeta el límite máximo permitido (cap a 50 en service).
- Mantiene un contrato HTTP consistente.

Este endpoint **expone errores de validación (400)** para parámetros inválidos y errores internos (500) para fallas técnicas.

## Parámetros de Query

- `page` (number, opcional): número de página (default: 1)
- `limit` (number, opcional): número de elementos por página (default: 10, max: 50)
- `search` (string, opcional): búsqueda global por texto (trim-aware, max: 120 chars)
- `status` (string, opcional): filtro por estado (`DRAFT`, `ACTIVE`, `ARCHIVED`)

## Response (200 OK)

```json
{
  "characters": [],
  "page": 1,
  "limit": 10,
  "total": 0
}
```

Campos

- characters: arreglo de personajes (puede estar vacío)
- page: página actual
- limit: tamaño de página aplicado (max: 50)
- total: total de personajes disponibles

## Response (400 Bad Request)

```json
{
  "error": "Page must be a positive integer"
}
```

```json
{
  "error": "Limit must be a positive integer"
}
```

**Nota importante:** El formato de error es `{ "error": "mensaje" }` (no `message`), gestionado por middleware global.

## Response (500 Internal Server Error)

```json
{
  "error": "Error message"
}
```

Retornado cuando ocurre un error técnico inesperado en DB o cualquier falla interna no controlada.

## Test Cases

### TC-CHAR-LIST-01 – Default pagination – Returns first page

Descripción:

Cuando no se envían parámetros de paginación, el backend debe retornar la primera página con los valores por defecto.

Request:

``GET /characters``

Expected Result:

- Status Code: 200
- page = 1
- limit = 10
- characters es un arreglo
- total está presente

### TC-CHAR-LIST-02 – Valid pagination parameters – Respects page and limit

Descripción:

Cuando se envían valores válidos para los parámetros de paginación (page y limit), el backend debe respetarlos y reflejarlos correctamente en la respuesta.

Request:

``GET /characters?page=2&limit=5``

Expected Result:

- Status Code: 200
- page = 2
- limit = 5
- characters.length ≤ 5
- total está presente

### TC-CHAR-LIST-03 – Limit above max – Caps limit to 50

Descripción:

Cuando el valor de limit excede el máximo permitido, el service aplica un cap a 50.

Request:

``GET /characters?limit=999``

Expected Result:

- Status Code: 200
- page = 1
- limit = 50 (capeado por service)
- characters.length ≤ 50
- total está presente

### TC-CHAR-LIST-04 – Limit equals zero – Returns 400

Descripción:

Cuando limit es igual a 0, el backend debe retornar error de validación.

Request:

``GET /characters?limit=0``

Expected Result:

- Status Code: 400
- Response body:

  ```json
  { "error": "Limit must be a positive integer" }
  ```

### TC-CHAR-LIST-05 – Negative limit value – Returns 400

Descripción:

Cuando limit es un valor negativo, el backend debe retornar error de validación.

Request:

``GET /characters?limit=-5``

Expected Result:

- Status Code: 400
- Response body:

  ```json
  { "error": "Limit must be a positive integer" }
  ```

### TC-CHAR-LIST-06 – Non-numeric limit value – Returns 400

Descripción:

Cuando limit contiene un valor no numérico, el backend debe retornar error de validación.

Request:

``GET /characters?limit=abc``

Expected Result:

- Status Code: 400
- Response body:

  ```json
  { "error": "Limit must be a positive integer" }
  ```

### TC-CHAR-LIST-07 – Boolean limit value – Returns 400

Descripción:

Cuando limit contiene un valor booleano, el backend debe retornar error de validación.

Request:

``GET /characters?limit=false``

Expected Result:

- Status Code: 400
- Response body:

  ```json
  { "error": "Limit must be a positive integer" }
  ```

### TC-CHAR-LIST-08 – Page equals zero – Returns 400

Descripción:

Cuando page es igual a 0, el backend debe retornar error de validación.

Request:

``GET /characters?page=0``

Expected Result:

- Status Code: 400
- Response body:

  ```json
  { "error": "Page must be a positive integer" }
  ```

### TC-CHAR-LIST-09 – Negative page value – Returns 400

Descripción:

Cuando page es un valor negativo, el backend debe retornar error de validación.

Request:

``GET /characters?page=-5``

Expected Result:

- Status Code: 400
- Response body:

  ```json
  { "error": "Page must be a positive integer" }
  ```

### TC-CHAR-LIST-10 – Non-numeric page value – Returns 400

Descripción:

Cuando page contiene un valor no numérico, el backend debe retornar error de validación.

Request:

``GET /characters?page=abc``

Expected Result:

- Status Code: 400
- Response body:

  ```json
  { "error": "Page must be a positive integer" }
  ```

### TC-CHAR-LIST-10.1 – Boolean page value – Returns 400

Descripción:

Cuando page contiene un valor booleano, el backend debe retornar error de validación.

Request:

``GET /characters?page=true``

Expected Result:

- Status Code: 400
- Response body:

  ```json
  { "error": "Page must be a positive integer" }
  ```

### TC-CHAR-LIST-11 – High page number – Returns empty list

Descripción:

Cuando se solicita una página alta sin resultados disponibles, el backend debe retornar una lista vacía sin error.

Request:

``GET /characters?page=9999``

Expected Result:

- Status Code: 200
- page = 9999
- limit = 10
- characters = []
- total está presente

### TC-CHAR-LIST-12 – Unknown query parameters – Ignored by backend

Descripción:

Cuando se envían parámetros de query no definidos en el contrato, el backend debe ignorarlos.

Request:

``GET /characters?limite=6&pagina=2``

Expected Result:

- Status Code: 200
- page = 1
- limit = 10
- characters es un arreglo
- total está presente

### TC-CHAR-LIST-13 – Internal server error – Returns 500

Descripción:

Cuando ocurre un error técnico inesperado en DB (RepoError UNKNOWN) o cualquier falla interna, el endpoint debe responder con error interno.

Request:

``GET /characters``

Expected Result:

- Status Code: 500
- Response contiene un mensaje de error genérico

### TC-CHAR-LIST-14 – Character list returns valid character contract

Descripción:

Cuando el endpoint de listado devuelve personajes, cada elemento del arreglo characters debe cumplir con la estructura completa del CharacterDTO, validando la presencia y tipo de todas sus propiedades obligatorias, y considerando notes como opcional

Request:

``GET /characters``

Expected Result:

- Status Code: 200
- La respuesta contiene:
  - characters (arreglo)
  - page (number)
  - limit (number)
  - total (number)
- Cada elemento en characters cumple con CharacterDTO:
  - id: string
  - name: string
  - status: string
  - categories: string[] (arreglo de strings)
  - identity: string
  - inspirations: string[] (arreglo de strings)
  - notes (opcional): si existe, es string

### TC-CHAR-LIST-15 – Search by name field – semantic validation

Descripción:

Validar búsqueda orientada a `name` con keyword única de nombre.

Request:

`GET /characters?page=1&limit=10&search=<NAME_KEYWORD>`

Expected Result:

- Status Code: 200
- Todos los elementos retornados contienen `<NAME_KEYWORD>` en `name`

### TC-CHAR-LIST-16 – Search by categories field – semantic validation

Descripción:

Validar búsqueda orientada a `categories` con keyword única de categoría.

Request:

`GET /characters?page=1&limit=10&search=<CATEGORY_KEYWORD>`

Expected Result:

- Status Code: 200
- Todos los elementos retornados contienen `<CATEGORY_KEYWORD>` en `categories`

### TC-CHAR-LIST-17 – Search by identity field – semantic validation

Descripción:

Validar búsqueda orientada a `identity` con keyword única de identidad.

Request:

`GET /characters?page=1&limit=10&search=<IDENTITY_KEYWORD>`

Expected Result:

- Status Code: 200
- Todos los elementos retornados contienen `<IDENTITY_KEYWORD>` en `identity`

### TC-CHAR-LIST-18 – Search by inspirations field – semantic validation

Descripción:

Validar búsqueda orientada a `inspirations` con keyword única de inspiración.

Request:

`GET /characters?page=1&limit=10&search=Hu%20Tao%20(Genshin%20Impact)`

Expected Result:

- Status Code: 200
- Todos los elementos retornados contienen `Hu Tao (Genshin Impact)` en `inspirations`

### TC-CHAR-LIST-19 – Search with normalized spaces – Returns 200 + ListCharactersResponse

Descripción:

Validar que `search` con espacios extra sea normalizado.

Request:

`GET /characters?page=1&limit=10&search=%20%20akira%20%20%20flame%20%20`

Expected Result:

- Status Code: 200
- Response body cumple con `ListCharactersResponse`

### TC-CHAR-LIST-20 – Filter by status – Returns 200 + ListCharactersResponse

Descripción:

Validar filtrado por `status`.

Request:

`GET /characters?page=1&limit=10&status=ACTIVE`

Expected Result:

- Status Code: 200
- Response body cumple con `ListCharactersResponse`

### TC-CHAR-LIST-21 – Search + status combined – Returns 200 + ListCharactersResponse

Descripción:

Validar combinación de filtros `search` + `status`.

Request:

`GET /characters?page=1&limit=10&search=PersonajeTrágico&status=ARCHIVED`

Expected Result:

- Status Code: 200
- Response body cumple con `ListCharactersResponse`

### TC-CHAR-LIST-22 – Page 2 over filtered results – Returns 200 + ListCharactersResponse

Descripción:

Validar específicamente que la respuesta respete `page=2` cuando hay filtros aplicados.

Request:

`GET /characters?page=2&limit=10&search=akira&status=ACTIVE`

Expected Result:

- Status Code: 200
- Response body cumple con `ListCharactersResponse`

### TC-CHAR-LIST-23 – Limit above max with search – Caps to 50

Descripción:

Validar que `limit` mayor al máximo se capea a 50, incluso con `search`.

Request:

`GET /characters?page=1&limit=999&search=akira`

Expected Result:

- Status Code: 200
- `limit = 50`
- Response body cumple con `ListCharactersResponse`

### TC-CHAR-LIST-24 – Blank search – Ignores text filter

Descripción:

Validar que `search` vacío/blank no rompa el endpoint y se ignore como filtro.

Request:

`GET /characters?page=1&limit=10&search=%20%20%20`

Expected Result:

- Status Code: 200
- Response body cumple con `ListCharactersResponse`

### TC-CHAR-LIST-25 – Invalid status – Returns 400

Descripción:

Validar error cuando `status` no pertenece al enum permitido.

Request:

`GET /characters?page=1&limit=10&status=ALL`

Expected Result:

- Status Code: 400
- Error exacto: `Status must be DRAFT, ACTIVE or ARCHIVED`

### TC-CHAR-LIST-26 – Search exceeds 120 chars – Returns 400

Descripción:

Validar error cuando `search` supera el máximo permitido.

Request:

`GET /characters?page=1&limit=10&search=<121_chars>`

Expected Result:

- Status Code: 400
- Error exacto: `Search must be at most 120 characters`

---

## Resumen de Escenarios Cubiertos

### ✅ Casos exitosos (200 OK)

| Request | Response |
|---------|----------|

| `GET /characters` | Lista paginada con defaults: page=1, limit=10 |
| `GET /characters?page=2&limit=20` | Lista paginada respetando parámetros |
| `GET /characters?limit=999` | Lista paginada con limit capeado a 50 por service |
| `GET /characters?page=9999` | Lista vacía si no hay resultados en esa página |
| `GET /characters?page=1&limit=10&search=<NAME_KEYWORD>` | Resultados matchean por `name` |
| `GET /characters?page=1&limit=10&search=<CATEGORY_KEYWORD>` | Resultados matchean por `categories` |
| `GET /characters?page=1&limit=10&search=<IDENTITY_KEYWORD>` | Resultados matchean por `identity` |
| `GET /characters?page=1&limit=10&search=<INSPIRATION_KEYWORD>` | Resultados matchean por `inspirations` |
| `GET /characters?page=1&limit=10&status=ACTIVE` | Lista filtrada por status |
| `GET /characters?page=1&limit=10&search=akira&status=ACTIVE` | Lista con filtros combinados |
| `GET /characters?page=2&limit=10&search=akira&status=ACTIVE` | Paginación sobre resultados filtrados |
| `GET /characters?page=1&limit=10&search=%20%20%20` | `search` blank ignorado |

### ❌ Errores de validación (400 Bad Request)

| Request | Error Message |
|---------|---------------|

| `GET /characters?page=-5` | `{ "error": "Page must be a positive integer" }` |
| `GET /characters?page=0` | `{ "error": "Page must be a positive integer" }` |
| `GET /characters?page=abc` | `{ "error": "Page must be a positive integer" }` |
| `GET /characters?limit=0` | `{ "error": "Limit must be a positive integer" }` |
| `GET /characters?limit=-5` | `{ "error": "Limit must be a positive integer" }` |
| `GET /characters?limit=abc` | `{ "error": "Limit must be a positive integer" }` |
| `GET /characters?limit=false` | `{ "error": "Limit must be a positive integer" }` |
| `GET /characters?page=1&limit=10&status=ALL` | `{ "error": "Status must be DRAFT, ACTIVE or ARCHIVED" }` |
| `GET /characters?page=1&limit=10&search=<121_chars>` | `{ "error": "Search must be at most 120 characters" }` |
| `GET /characters?page=-5&limit=abc` | `{ "error": "Page must be a positive integer" }` o `{ "error": "Limit must be a positive integer" }` |
| RepoError VALIDATION | `{ "error": "<mensaje de validación>" }` |

### 💥 Errores internos (500 Internal Server Error)

| Escenario | Error Message |
|-----------|---------------|

| RepoError UNKNOWN o error técnico en DB | `{ "error": "<mensaje del error>" }` |

**Notas importantes:**

- El formato de error es `{ "error": "mensaje" }` (no `message`), gestionado por middleware global.
- El service aplica un **cap de limit a 50**, aunque se solicite un valor mayor.
- Los defaults son: `page=1`, `limit=10`.
