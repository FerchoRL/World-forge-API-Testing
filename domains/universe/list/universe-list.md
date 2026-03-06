# Universe - List (GET /universes)

Endpoint: `GET /universes`

## Objetivo

Validar el comportamiento del endpoint de listado de universes, asegurando que:

- Retorna una lista paginada de universes.
- Aplica valores por defecto cuando no se envian parametros.
- Valida estrictamente los parametros de paginacion, retornando 400 Bad Request para valores invalidos.
- Soporta filtro de `search` (normalizado por trim/collapse de espacios, max: 120 chars).
- Soporta filtro de `status` (`DRAFT`, `ACTIVE`, `ARCHIVED`).
- Respeta el limite maximo permitido (cap a 50 en service).
- Mantiene un contrato HTTP consistente.

Este endpoint expone errores de validacion (400) para parametros invalidos y combina filtros cuando se envia `search` + `status`.

## Parametros de Query

- `page` (number, opcional): numero de pagina (default: 1)
- `limit` (number, opcional): numero de elementos por pagina (default: 10, max: 50)
- `search` (string, opcional): busqueda global por texto (name, premise, notes, rules), trim-aware, max: 120 chars
- `status` (string, opcional): filtro por estado (`DRAFT`, `ACTIVE`, `ARCHIVED`)

## Response (200 OK)

```json
{
  "universes": [],
  "page": 1,
  "limit": 10,
  "total": 0
}
```

Campos:

- universes: arreglo de universes (puede estar vacio)
- page: pagina actual
- limit: tamano de pagina aplicado (max: 50)
- total: total de universes disponibles

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

```json
{
  "error": "Search must be at most 120 characters"
}
```

```json
{
  "error": "Status must be DRAFT, ACTIVE or ARCHIVED"
}
```

Nota importante: El formato de error es `{ "error": "mensaje" }` (no `message`), gestionado por middleware global.

## Test Cases

### TC-UNIVERSE-LIST-01 - List default (sin query params)

Descripcion:

Cuando no se envian parametros de paginacion, el backend debe retornar la primera pagina con valores por defecto.

Request:

`GET /universes`

Expected Result:

- Status Code: 200
- page = 1
- limit = 10
- universes es un arreglo
- total esta presente

### TC-UNIVERSE-LIST-02 - List con paginacion valida explicita

Descripcion:

Cuando se envian valores validos para page y limit, el backend debe respetarlos en la respuesta.

Request:

`GET /universes?page=1&limit=5`

Expected Result:

- Status Code: 200
- page = 1
- limit = 5
- universes.length <= 5

### TC-UNIVERSE-LIST-03 - Limit mayor al maximo permitido (cap en 50)

Descripcion:

Cuando limit excede el maximo permitido, el service debe capear el valor a 50.

Request:

`GET /universes?page=1&limit=999`

Expected Result:

- Status Code: 200
- page = 1
- limit = 50
- universes.length <= 50

### TC-UNIVERSE-LIST-04 - Invalid page values (outline)

Descripcion:

Casos de page invalido cubiertos en un mismo Scenario Outline (feature):

- `page=0`
- `page=-1`
- `page=1.5`
- `page=abc`
- `page=false`
- `page=true`

Expected Result:

- Status Code: 400
- Response body:

  ```json
  { "error": "Page must be a positive integer" }
  ```

### TC-UNIVERSE-LIST-05 - Invalid limit values (outline)

Descripcion:

Casos de limit invalido cubiertos en un mismo Scenario Outline (feature):

- `limit=0`
- `limit=-3`
- `limit=2.7`
- `limit=abc`
- `limit=false`
- `limit=true`

Expected Result:

- Status Code: 400
- Response body:

  ```json
  { "error": "Limit must be a positive integer" }
  ```

### TC-UNIVERSE-LIST-06 - Out-of-range page (no items)

Descripcion:

Cuando se solicita una pagina alta sin resultados disponibles, el backend debe retornar lista vacia sin error.

Request:

`GET /universes?page=999&limit=10`

Expected Result:

- Status Code: 200
- universes = []
- total se mantiene con el total real en DB

### TC-UNIVERSE-LIST-07 - Unknown query parameters - Ignored by backend

Descripcion:

Cuando se envian query params no definidos en el contrato (`pagina`, `limite`), el backend debe ignorarlos.

Request:

`GET /universes?pagina=2&limite=6`

Expected Result:

- Status Code: 200
- page = 1
- limit = 10
- universes es un arreglo
- total esta presente

### TC-UNIVERSE-LIST-08 - Universe list returns valid UniverseDTO structure

Descripcion:

Cuando el endpoint retorna universes, cada elemento del arreglo debe cumplir la estructura de `UniverseDTO`.

Request:

`GET /universes`

Expected Result:

- Status Code: 200
- Cada universe cumple con:
  - id: string
  - name: string
  - status: string valido (`DRAFT | ACTIVE | ARCHIVED`)
  - premise: string
  - rules (opcional): string[]
  - notes (opcional): string

### TC-UNIVERSE-LIST-09 - Search by name field

Descripcion:

Validar busqueda por coincidencia en el campo `name`.

Request:

`GET /universes?search=Neo`

Expected Result:

- Status Code: 200
- universes contiene coincidencias en `name`
- total acorde al filtro

### TC-UNIVERSE-LIST-10 - Search by premise field

Descripcion:

Validar busqueda por coincidencia en el campo `premise`.

Request:

`GET /universes?search=forest`

Expected Result:

- Status Code: 200
- universes contiene coincidencias en `premise`

### TC-UNIVERSE-LIST-11 - Search by notes field

Descripcion:

Validar busqueda por coincidencia en el campo `notes` cuando existe.

Request:

`GET /universes?search=curse`

Expected Result:

- Status Code: 200
- universes contiene coincidencias en `notes`

### TC-UNIVERSE-LIST-12 - Search by rules field (array)

Descripcion:

Validar busqueda por coincidencia en elementos del arreglo `rules`.

Request:

`GET /universes?search=magic`

Expected Result:

- Status Code: 200
- universes contiene coincidencias en `rules`

### TC-UNIVERSE-LIST-13 - Filter by status DRAFT

Descripcion:

Validar filtro por `status=DRAFT`.

Request:

`GET /universes?status=DRAFT`

Expected Result:

- Status Code: 200
- todos los universes devueltos tienen status `DRAFT`

### TC-UNIVERSE-LIST-14 - Filter by status ACTIVE

Descripcion:

Validar filtro por `status=ACTIVE`.

Request:

`GET /universes?status=ACTIVE`

Expected Result:

- Status Code: 200
- todos los universes devueltos tienen status `ACTIVE`

### TC-UNIVERSE-LIST-15 - Filter by status ARCHIVED

Descripcion:

Validar filtro por `status=ARCHIVED`.

Request:

`GET /universes?status=ARCHIVED`

Expected Result:

- Status Code: 200
- todos los universes devueltos tienen status `ARCHIVED`

### TC-UNIVERSE-LIST-16 - Search + status combined

Descripcion:

Validar combinacion de `search` + `status` y que la respuesta respete paginacion.

Request:

`GET /universes?search=shadow&status=DRAFT&page=1&limit=10`

Expected Result:

- Status Code: 200
- aplica ambos filtros (interseccion)
- page = 1
- limit = 10

### TC-UNIVERSE-LIST-17 - Search with normalized spaces

Descripcion:

Validar que `search` con espacios extra se normaliza internamente.

Request:

`GET /universes?search=%20%20neo%20%20tokyo%20%20`

Expected Result:

- Status Code: 200
- se busca como `neo tokyo` (trim/collapse de espacios)

### TC-UNIVERSE-LIST-18 - Blank search equals no search

Descripcion:

Validar que `search` en blanco se comporte como listado sin filtro de texto.

Request:

`GET /universes?search=%20%20%20`

Expected Result:

- Status Code: 200
- comportamiento equivalente a no enviar `search`

### TC-UNIVERSE-LIST-19 - Search exceeds 120 chars

### TC-UNIVERSE-LIST-20 - Invalid status values (outline)

Descripcion:

Validar error cuando `status` no pertenece al enum permitido.

Request:

`GET /universes?status=<invalid_status>`

Expected Result:

- Status Code: 400
- Error exacto: `Status must be DRAFT, ACTIVE or ARCHIVED`

Valores a probar:

- IN_DEVELOPMENT
- active
- ALL
- true
- false
- 123
- null
- (vacío)

Descripcion:

Validar error cuando `search` supera 120 caracteres.

Request:

`GET /universes?search=<121_chars>`

Expected Result:

- Status Code: 400
- Error exacto: `Search must be at most 120 characters`

rs out-of-range page

Descripcion:

Validar que con filtros aplicados, una pagina fuera de rango retorna arreglo vacio pero mantiene total filtrado.

Request:

`GET /universes?search=neo&status=ACTIVE&page=999&limit=10`

Expected Result:

- Status Code: 200
- universes = []
- total mantiene el total real filtrado

---

## Resumen de Escenarios Cubiertos

### Casos exitosos (200 OK)

- `GET /universes` -> Lista paginada con defaults: page=1, limit=10.
- `GET /universes?page=1&limit=5` -> Lista paginada respetando page y limit.
- `GET /universes?page=1&limit=999` -> Lista paginada con limit cap a 50.
- `GET /universes?pagina=2&limite=6` -> Ignora query params desconocidos y usa defaults.
- `GET /universes` -> Cada item cumple con el contrato `UniverseDTO`.
- `GET /universes?search=Neo` -> Match por `name`.
- `GET /universes?search=forest` -> Match por `premise`.
- `GET /universes?search=curse` -> Match por `notes`.
- `GET /universes?search=magic` -> Match por `rules`.
- `GET /universes?status=DRAFT` -> Lista filtrada por `DRAFT`.
- `GET /universes?status=ACTIVE` -> Lista filtrada por `ACTIVE`.
- `GET /universes?status=ARCHIVED` -> Lista filtrada por `ARCHIVED`.
- `GET /universes?search=shadow&status=DRAFT&page=1&limit=10` -> Interseccion de filtros con paginacion.
- `GET /universes?search=%20%20neo%20%20tokyo%20%20` -> Search normalizado.
- `GET /universes?search=%20%20%20` -> Search en blanco ignorado.
- `GET /universes?search=neo&status=ACTIVE&page=999&limit=10` -> Pagina filtrada fuera de rango retorna lista vacia.

### Errores de validacion (400 Bad Request)

- Invalid page values (`0`, `-1`, `1.5`, `abc`, `false`, `true`) -> `{ "error": "Page must be a positive integer" }`.
- Invalid limit values (`0`, `-3`, `2.7`, `abc`, `false`, `true`) -> `{ "error": "Limit must be a positive integer" }`.
- `search` con mas de 120 chars -> `{ "error": "Search must be at most 120 characters" }`.
- `status=IN_DEVELOPMENT` -> `{ "error": "Status must be DRAFT, ACTIVE or ARCHIVED" }`.
- `status=active` -> `{ "error": "Status must be DRAFT, ACTIVE or ARCHIVED" }`.

## Notas importantes

- El service aplica cap de `limit` a 50 aunque se solicite un valor mayor.
- Los defaults son `page=1` y `limit=10`.
- El formato de error esperado es `{ "error": "mensaje" }`.
- `search` se normaliza con trim/collapse de espacios.
