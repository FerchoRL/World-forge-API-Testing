# Universe - List (GET /universes)

Endpoint: `GET /universes`

## Objetivo

Validar el comportamiento del endpoint de listado de universes, asegurando que:

- Retorna una lista paginada de universes.
- Aplica valores por defecto cuando no se envian parametros.
- Valida estrictamente los parametros de paginacion, retornando 400 Bad Request para valores invalidos.
- Respeta el limite maximo permitido (cap a 50 en service).
- Mantiene un contrato HTTP consistente.

Este endpoint expone errores de validacion (400) para parametros invalidos.

## Parametros de Query

- `page` (number, opcional): numero de pagina (default: 1)
- `limit` (number, opcional): numero de elementos por pagina (default: 10, max: 50)

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

### TC-UNIVERSE-LIST-04 - Page invalido: 0

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

### TC-UNIVERSE-LIST-07 - Limit invalido: 0

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

### TC-UNIVERSE-LIST-11 - Pagina fuera de rango (sin items)

Descripcion:

Cuando se solicita una pagina alta sin resultados disponibles, el backend debe retornar lista vacia sin error.

Request:

`GET /universes?page=999&limit=10`

Expected Result:

- Status Code: 200
- universes = []
- total se mantiene con el total real en DB

### TC-UNIVERSE-LIST-12 - Unknown query parameters - Ignored by backend

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

### TC-UNIVERSE-LIST-14 - Universe list returns valid UniverseDTO structure

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

---

## Resumen de Escenarios Cubiertos

### Casos exitosos (200 OK)

- `GET /universes` -> Lista paginada con defaults: page=1, limit=10.
- `GET /universes?page=1&limit=5` -> Lista paginada respetando page y limit.
- `GET /universes?page=1&limit=999` -> Lista paginada con limit cap a 50.
- `GET /universes?pagina=2&limite=6` -> Ignora query params desconocidos y usa defaults.
- `GET /universes` -> Cada item cumple con el contrato `UniverseDTO`.

### Errores de validacion (400 Bad Request)

- Invalid page values (`0`, `-1`, `1.5`, `abc`, `false`, `true`) -> `{ "error": "Page must be a positive integer" }`.
- Invalid limit values (`0`, `-3`, `2.7`, `abc`, `false`, `true`) -> `{ "error": "Limit must be a positive integer" }`.

## Notas importantes

- El service aplica cap de `limit` a 50 aunque se solicite un valor mayor.
- Los defaults son `page=1` y `limit=10`.
- El formato de error esperado es `{ "error": "mensaje" }`.
