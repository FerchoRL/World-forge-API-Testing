# World-Forge Backend Tests

Proyecto de testing backend para la API de World-Forge.

## Stack

- Node.js
- Playwright
- JavaScript

## Objetivo

Validar el comportamiento real del backend mediante pruebas de API.

> Este proyecto es independiente del backend.

## 2. Clonar el proyecto

git clone <URL_DEL_REPO>
cd world-forge-api-testing

## 3. Instalación de dependencias

Ejecuta:

`npm install`

Esto instalará (entre otras) estas dependencias principales:

- @playwright/test (runner + assertions)
- playwright (core)
- @cucumber/cucumber (BDD)
- @cucumber/html-formatter (reporte HTML)
- dotenv (variables de entorno desde .env)
- ts-node (ejecutar Cucumber en TypeScript)
- @types/node (tipos para process, etc.)

```ts
npm install -D @playwright/test playwright @cucumber/cucumber @cucumber/html-formatter dotenv ts-node @types/node
```

## 4. Backend requerido (obligatorio)

Este proyecto NO levanta el backend.
Debes tener el backend corriendo antes de ejecutar los tests.
Backend esperado

```txt
URL: http://localhost:3001
```

Endpoint health:

- GET /health

Respuesta esperada:

```json
{
  "status": "OK",
  "service": "world-forge"
}
```

## 5. Variables de entorno

Crea un archivo .env en la raíz del proyecto:

```json
BASE_URL=http://localhost:3001
```

⚠️ Sin este archivo, los tests fallan.
El .env NO se versiona (está en .gitignore).

## 6. Estructura del proyecto

```text
world-forge-backend-tests/
│
├─ domains/                    # Dominio por feature (arquitectura vertical)
│  ├─ health/
│  │  ├─ health.feature        # Escenarios BDD
│  │  ├─ health.steps.ts       # Step definitions
│  │  └─ health.api.ts         # API Object (POM para backend)
│  │
│  └─ character/               # (en progreso)
│
├─ tests/
│  └─ cucumber/
│     └─ cucumber.spec.ts      # Runner Playwright → Cucumber
│
├─ utils/
│  └─ http/
│     └─ apiContext.ts         # Factory de APIRequestContext (baseURL)
│
├─ test-data/                  # Payloads y data de negocio
│
├─ reports/
│  └─ cucumber-report.html     # Reporte HTML de Cucumber
│
├─ playwright.config.ts
├─ cucumber.config.js
├─ tsconfig.json
├─ package.json
├─ .env
└─ README.md

```

## 7. Arquitectura (cómo funciona)

Flujo de ejecución

```scss
Playwright (runner)
   ↓
cucumber.spec.ts
   ↓
Cucumber
   ↓
.feature (BDD)
   ↓
.steps.ts
   ↓
API Object
   ↓
Backend HTTP real

```

Principios usados

- Black-box testing (no se importa el domain)
- Validación de negocio vía API
- POM aplicado a backend (API Objects)
- BDD solo donde aporta valor
- Arquitectura por dominio (vertical slicing)

## 8. Configuración clave

### Playwright

Archivo: ``playwright.config.ts``

- No UI
- No browsers
- No screenshots / videos
- Solo API

### Cucumber

Archivo: ``cucumber.config.js``

- Busca features en: ``domains/**/*.feature``
- Busca steps en: ``domains/**/*.steps.ts``
- Usa TypeScript vía: ``ts-node/register``

## 9 Reportes

Reporte principal (Cucumber HTML).
Después de correr los tests, se genera:

- reports/cucumber-report.html

Incluye:

- Escenarios
- Steps (Given / When / Then)
- Resultado por step
- Data adjunta (request / response)

Playwright report

Existe pero no es el principal (solo orquesta Cucumber).

## 10 Ejecutar los tests

- Paso 1: Levanta el backend
- Paso 2: Ejecuta los tests: ``npx playwright test``
