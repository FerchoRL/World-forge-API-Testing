# Character – List (GET /characters)

Endpoint: ``GET /characters``

## Objetivo

Validar el comportamiento del endpoint de listado de personajes, asegurando que:

- Retorna una lista paginada de personajes.
- Aplica valores por defecto cuando no se envían parámetros.
- Normaliza valores inválidos de paginación.
- Respeta el límite máximo permitido.
- Mantiene un contrato HTTP consistente.

Este endpoint no expone errores de validación (400); cualquier falla interna se traduce en 500.

## Parámetros de Query

| Parámetro | Tipo   | Obligatorio | Descripción                                           |
| --------- | ------ | ----------- | ----------------------------------------------------- |
| page      | number | No          | Número de página (default: 1)                         |
| limit     | number | No          | Número de elementos por página (default: 10, max: 50) |

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
- limit: tamaño de página aplicado
- total: total de personajes disponibles

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

Cuando el valor de limit excede el máximo permitido, el backend debe forzar el valor máximo.

Request:

``GET /characters?limit=100``

Expected Result:

- Status Code: 200
- page = 1
- limit = 50
- characters.length ≤ 50
- total está presente

### TC-CHAR-LIST-04 – Limit equals zero – Defaults to limit 10

Descripción:

Cuando limit es igual a 0, el backend debe aplicar el valor por defecto.

Request:

``GET /characters?limit=0``

Expected Result:

- Status Code: 200
- page = 1
- limit = 10
- characters es un arreglo
- total está presente

### TC-CHAR-LIST-05 – Negative limit value – Defaults to limit 10

Descripción:

Cuando limit es un valor negativo, el backend debe aplicar el valor por defecto.

Request:

``GET /characters?limit=-5``

Expected Result:

- Status Code: 200
- page = 1
- limit = 10
- characters es un arreglo
- total está presente

### TC-CHAR-LIST-06 – Non-numeric limit value – Defaults to limit 10

Descripción:

Cuando limit contiene un valor no numérico, el backend debe aplicar el valor por defecto.

Request:

``GET /characters?limit=abc``

Expected Result:

- Status Code: 200
- page = 1
- limit = 10
- characters es un arreglo
- total está presente

### TC-CHAR-LIST-07 – Boolean limit value – Defaults to limit 10

Descripción:

Cuando limit contiene un valor booleano, el backend debe aplicar el valor por defecto.

Request:

``GET /characters?limit=false``

Expected Result:

- Status Code: 200
- page = 1
- limit = 10
- characters es un arreglo
- total está presente

### TC-CHAR-LIST-08 – Page equals zero – Defaults to page 1

Descripción:

Cuando page es igual a 0, el backend debe aplicar el valor por defecto.

Request:

``GET /characters?page=0``

Expected Result:

- Status Code: 200
- page = 1
- limit = 10
- characters es un arreglo
- total está presente

### TC-CHAR-LIST-9 – Negative page value – Defaults to page 1

Descripción:

Cuando page es un valor negativo, el backend debe aplicar el valor por defecto.

Request:

``GET /characters?page=-3``

Expected Result:

- Status Code: 200
- page = 1
- limit = 10
- characters es un arreglo
- total está presente

### TC-CHAR-LIST-10 – Non-numeric page value – Defaults to page 1

Descripción:

Cuando page contiene un valor no numérico, el backend debe aplicar el valor por defecto.

Request:

``GET /characters?page=abc``

Expected Result:

- Status Code: 200
- page = 1
- limit = 10
- characters es un arreglo
- total está presente

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

Cuando ocurre un error inesperado en el backend, el endpoint debe responder con error interno.

Request:

``GET /characters``

Expected Result:

- Status Code: 500
- Response contiene un mensaje de error genérico
