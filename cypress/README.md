# Cypress E2E Tests

Este directorio contiene las pruebas end-to-end (E2E) para la aplicación de administración de solicitudes.

## Configuración

### Dependencias Instaladas

- `@4tw/cypress-drag-drop`: Para operaciones de drag & drop en React Flow
- `@faker-js/faker`: Para generar datos de prueba aleatorios

### Comandos Personalizados

Los siguientes comandos personalizados están disponibles en `cypress/support/commands.ts`:

#### `loginIfNeeded()`

Realiza login automático si es necesario usando las credenciales de las variables de entorno.

#### `selectReactSelectOption(selector, optionText)`

Selecciona una opción en un componente react-select.

#### `addWorkflowNode(name, type)`

Agrega un nuevo nodo al workflow con el nombre y tipo especificados.

#### `moveWorkflowNode(name, offset)`

Mueve un nodo del workflow a una posición específica.

#### `connectNodes(sourceSelector, targetSelector)`

Conecta dos nodos usando sus selectores de handles.

## Pruebas Disponibles

### 1. Crear Prioridad (`create-priority.cy.ts`)

Prueba el flujo completo de creación de una nueva prioridad:

- Llena el formulario con datos aleatorios
- Selecciona color
- Configura toggles (Default Priority, Active)
- Verifica la creación exitosa

### 2. Crear Workflow (`create-workflow.cy.ts`)

Prueba el flujo completo de creación de un workflow:

- Llena el formulario de workflow
- Agrega tres nodos (Initial, Default, Final)
- Mueve los nodos a posiciones específicas
- Conecta los nodos entre sí
- Verifica la creación exitosa

## Ejecución de Pruebas

### Modo Interactivo

```bash
npx cypress open
```

### Modo Headless

```bash
npx cypress run
```

### Ejecutar Pruebas Específicas

```bash
npx cypress run --spec "cypress/e2e/request/create-workflow.cy.ts"
npx cypress run --spec "cypress/e2e/request/create-priority.cy.ts"
```

## Configuración

### Variables de Entorno

Las credenciales de prueba se configuran en `cypress.config.ts`:

```typescript
env: {
  TEST_USER_EMAIL: 'jess232016@gmail.com',
  TEST_USER_PASSWORD: 'Lamisma123*',
}
```

### Desarrollo local de temas del Runner

Si quieres desarrollar o probar temas localmente para el Test Runner, puedes usar la carpeta `cypress/themes` del proyecto:

1. Crea `cypress/themes` y coloca `light.css`, `dark.css` o `colorblind.css` allí (ya hay un `light.css` de ejemplo).
2. Activa el modo local exportando la variable de entorno antes de lanzar Cypress:

```bash
# Linux / macOS
export CYPRESS_RUNNER_THEMES_LOCAL=true

# Windows PowerShell
$env:CYPRESS_RUNNER_THEMES_LOCAL='true'
```

3. Abre Cypress (o ejecútalo) y pasa `env.theme` al valor que quieras probar:

```bash
pnpm run cypress:open -- --env theme=light
pnpm run cypress:run:headed -- --env theme=light
```

La configuración hace que el paquete `cypress-runner-themes` lea los archivos CSS desde `cypress/themes` en lugar de su carpeta interna, permitiendo edición rápida sin publicar el paquete.

```

### Configuración de Viewport

- Ancho: 1920px
- Alto: 1080px
- Timeout por defecto: 10 segundos

## Estructura de Archivos

```

cypress/
├── e2e/
│ └── request/
│ ├── create-priority.cy.ts
│ └── create-workflow.cy.ts
├── support/
│ └── commands.ts
├── cypress.config.ts
└── README.md

```

## Data Test IDs

Los siguientes `data-testid` están disponibles para las pruebas:

### Workflow

- `add-node-button`: Botón para agregar nuevo nodo
- `workflow-node-{name}`: Contenedor de nodo específico
- `source-handle-{id}`: Handle de conexión saliente
- `target-handle-{id}`: Handle de conexión entrante

## Notas Importantes

1. **Tiempos de Espera**: Las pruebas incluyen timeouts apropiados para operaciones asíncronas
2. **Datos Aleatorios**: Se usa Faker.js para generar datos únicos en cada ejecución
3. **Drag & Drop**: Las operaciones de conexión de nodos usan eventos de mouse simulados
4. **Verificaciones**: Cada paso incluye verificaciones para asegurar el estado correcto

## Troubleshooting

### Problemas Comunes

1. **Nodos no visibles**: Asegúrate de que los nodos se hayan creado correctamente antes de intentar moverlos
2. **Conexiones fallidas**: Verifica que los handles estén presentes y sean accesibles
3. **Timeouts**: Aumenta los timeouts si la aplicación es lenta en desarrollo

### Debugging

Para debugging, puedes:

- Usar `cy.pause()` en puntos específicos
- Agregar `cy.wait(1000)` para pausas temporales
- Usar `cy.screenshot()` para capturar el estado en puntos críticos
```
