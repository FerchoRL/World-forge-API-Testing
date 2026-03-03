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
URL: http://localhost:3002
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

```env
BASE_URL=http://localhost:3002
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/worldforge_test
```

⚠️ Sin este archivo, los tests fallan.
El .env NO se versiona (está en .gitignore).

**Configuración:**

- `BASE_URL`: URL donde corre tu backend (ajusta el puerto según tu configuración)
- `MONGO_URI`: Conexión a MongoDB Atlas o local. La URI puede incluir el nombre de la base de datos directamente
- Ejemplo MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/worldforge_test`
- Ejemplo MongoDB local: `mongodb://localhost:27017/worldforge_test`
- (Opcional) `MONGO_DB_NAME`: Si prefieres separar el nombre de DB de la URI

## 6. Estructura del proyecto

```text
world-forge-backend-tests/
│
├─ domains/                           # Tests organizados por dominio (arquitectura vertical)
│  │
│  ├─ health/                         # Health check (smoke test)
│  │  ├─ health.feature               # Escenarios BDD
│  │  ├─ health.steps.ts              # Step definitions
│  │  └─ health.api.ts                # API Object (POM del endpoint /health)
│  │
│  └─ character/                      # Dominio Character
│     ├─ character.api.ts             # API Object único para /characters
│     ├─ character.context.ts         # Contexto compartido (APIRequestContext + CharacterApi)
│     │
│     └─ list/                        # Operación: listar personajes
│        ├─ README.md                 # Definición de test cases (fuente de verdad)
│        ├─ character-list.feature    # Scenarios BDD (TC-CHAR-LIST-XX)
│        └─ character-list.steps.ts   # Step definitions
│
├─ tests/
│  └─ cucumber/
│     └─ cucumber.spec.ts             # Runner Playwright → Cucumber
│
├─ utils/
│  └─ http/
│     └─ apiContext.ts                # Factory de APIRequestContext (baseURL, headers)
│
├─ test-data/                         # Payloads y data de negocio (futuro)
│
├─ reports/
│  └─ cucumber-report.html            # Reporte HTML generado por Cucumber
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
- Paso 3: Ejecutar tests directamente con Cucumber (modo debug / local): `npx cucumber-js --config cucumber.config.js --profile default`
- Paso 4: Ejecutar un dominio específico (ejemplo: Character): `npx cucumber-js --config cucumber.config.js --profile default --tags "@character"`
- Paso4.1: Ejecutar un dominio skipeando test con determinado tag `npx cucumber-js --config cucumber.config.js --profile default --tags "@tc-char-get-01 and not @skip"`
- Paso 5: Ejecutar una operación específica (ejemplo: Character List): `npx cucumber-js --config cucumber.config.js --profile default --tags "@character and @list"`
- Paso 6: Ejecutar un test case específico (ejemplo: TC-CHAR-LIST-01): `npx cucumber-js --config cucumber.config.js --profile default --tags "@tc-char-list-01"`

## 11: Revisar el reporte

Después de la ejecución, el reporte HTML se genera automáticamente en: `reports/cucumber-report.html`

## 12. Versionado y Release (GitHub)

Este proyecto usará versionado semántico (SemVer):

- `MAJOR`: cambios incompatibles.
- `MINOR`: nuevas funcionalidades compatibles.
- `PATCH`: correcciones compatibles.

### Primer tag recomendado

Como es el primer release estable del proyecto de tests, se recomienda iniciar con:

- `v1.0.0`

### Checklist antes de crear el tag

- Cambios mergeados en `main`.
- Tests principales ejecutados y en verde.
- README y documentación de escenarios actualizados.
- Sin cambios pendientes (`git status` limpio).

### Flujo sugerido para crear release

1. Asegurar rama actualizada:

```bash
git checkout main
git pull origin main
```

1. Crear tag anotado:

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
```

1. Publicar el tag:

```bash
git push origin v1.0.0
```

1. Crear Release en GitHub:

- Ir a `Releases` → `Draft a new release`.
- Seleccionar tag `v1.0.0`.
- Título sugerido: `World-Forge API Tests v1.0.0`.
- Incluir resumen de cambios (features cubiertas, fixes y mejoras de reporting).

### Recomendación para siguientes versiones

- `v1.0.1`: fixes menores en tests o reportes.
- `v1.1.0`: nuevos dominios o nuevos test cases.
- `v2.0.0`: cambios de estructura o breaking changes en contrato/flujo de testing.
