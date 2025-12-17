# Propuesta: Hacer Module y Feature Globales

## Problema Actual

Actualmente, `Module` y `Feature` están scoped al tenant (`TenantScoped`), lo que significa que:

1. **Duplicación de datos**: Cada vez que se crea un tenant, se replican todos los módulos y features
2. **Inconsistencias**: Si se actualiza un módulo en un tenant, no se refleja en otros
3. **Ineficiencia**: Datos que son conceptualmente globales del sistema se almacenan por tenant
4. **Mantenimiento complejo**: Cambios en módulos/features requieren actualizar todos los tenants

## Propuesta de Arquitectura: Híbrida (Recomendada)

### Arquitectura con Control Multi-Nivel

**Concepto:** Module y Feature son globales, pero se pueden habilitar/deshabilitar a través de:
1. **Plan** (`PlanFeature` - ya existe): Define qué features están disponibles en un plan con límites
2. **Tenant** (`TenantModule` - nuevo): Permite desactivar módulos completos independientemente del plan

**Cambios en el Schema:**

```prisma
// Module y Feature sin tenantId (GLOBALES)
model Module {
  id          String    @id() @default(uuid())
  name        String    @db.VarChar(100)
  description String?   @db.VarChar(255)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime? @updatedAt()
  deletedAt   DateTime?
  createdBy   String?   @db.VarChar(50)
  updatedBy   String?   @db.VarChar(50)
  // ❌ REMOVER: tenantId
  feature     Feature[]
  tenantModules TenantModule[] // Nueva relación
  
  @@unique([name]) // Ya no necesita tenantId
  @@index([name])
}

model Feature {
  id              String            @id() @default(uuid())
  name            String            @db.VarChar(100)
  description     String?           @db.VarChar(255)
  isActive        Boolean           @default(true)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime?         @updatedAt()
  deletedAt       DateTime?
  createdBy       String?           @db.VarChar(50)
  updatedBy       String?           @db.VarChar(50)
  // ❌ REMOVER: tenantId
  key             String            @unique() @db.VarChar(100)
  scope           String            @default("global")
  moduleId        String
  module          Module            @relation(fields: [moduleId], references: [id])
  roleFeature     RoleFeature[]
  areaRoleFeature AreaRoleFeature[]
  planFeatures    PlanFeature[]     // Ya existe - control a nivel de plan
  
  @@unique([key]) // Ya no necesita tenantId
}
```

**Nueva Tabla para Habilitar/Deshabilitar Módulos por Tenant:**

```prisma
// Tabla intermedia para habilitar/deshabilitar módulos por tenant
// Permite que un tenant desactive módulos independientemente de su plan
model TenantModule {
  id          String    @id() @default(uuid())
  tenantId    String
  moduleId    String
  isEnabled   Boolean   @default(true) // Por defecto habilitado
  createdAt   DateTime  @default(now())
  updatedAt   DateTime? @updatedAt()
  createdBy   String?   @db.VarChar(50)
  updatedBy   String?   @db.VarChar(50)
  
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  module      Module    @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  @@unique([tenantId, moduleId])
  @@index([tenantId])
  @@index([moduleId])
}
```

**Lógica de Verificación de Disponibilidad:**

Un módulo/feature está disponible para un tenant si:

1. ✅ El módulo/feature existe (global)
2. ✅ El tenant tiene el módulo habilitado en `TenantModule` (o no existe registro = inhabilitado por defecto)
3. ✅ El plan del tenant tiene las features en `PlanFeature` (con límites si aplica)

**Ejemplo de Query:**

```typescript
// Verificar si un módulo está disponible para un tenant
async function isModuleAvailableForTenant(
  tenantId: string, 
  moduleId: string
): Promise<boolean> {
  const db = await getDb();
  
  // 1. Verificar si el tenant tiene el módulo habilitado
  const tenantModule = await db.tenantModule.findUnique({
    where: { tenantId_moduleId: { tenantId, moduleId } }
  });
  
  // Si existe registro y está deshabilitado, retornar false
  if (tenantModule && !tenantModule.isEnabled) {
    return false;
  }
  
  // 2. Verificar si el plan del tenant tiene las features del módulo
  const subscription = await db.subscription.findFirst({
    where: { tenantId, status: 'active' },
    include: {
      plan: {
        include: {
          features: {
            include: { feature: { include: { module: true } } }
          }
        }
      }
    }
  });
  
  if (!subscription) return false;
  
  // Verificar si alguna feature del módulo está en el plan
  const hasModuleFeatures = subscription.plan.features.some(
    pf => pf.feature.moduleId === moduleId
  );
  
  return hasModuleFeatures;
}
```

**Ventajas:**
- ✅ Una sola fuente de verdad para módulos y features
- ✅ Control granular: Plan define features disponibles, Tenant puede desactivar módulos
- ✅ Flexibilidad: Un tenant puede desactivar un módulo aunque su plan lo incluya
- ✅ Actualizaciones globales se reflejan en todos los tenants
- ✅ Menos almacenamiento (no duplicación)
- ✅ Más fácil de mantener

**Casos de Uso:**

1. **Plan Básico**: Solo incluye features de módulos básicos
2. **Plan Premium**: Incluye todos los módulos y features
3. **Tenant con Plan Premium**: Puede desactivar módulos que no necesita (ej: módulo de reportes avanzados)
4. **Actualización Global**: Se agrega un nuevo feature a un módulo → automáticamente disponible para todos los tenants que tengan el módulo habilitado y su plan lo incluya

## Migración Propuesta

1. **Crear tabla `TenantModule`** para habilitar/deshabilitar módulos
2. **Migrar datos existentes**: Consolidar módulos y features duplicados en una versión global
3. **Actualizar queries**: Remover `tenantId` de queries de Module y Feature
4. **Actualizar inicialización**: En lugar de crear módulos/features, solo habilitarlos en `TenantModule`

## Impacto en el Código

### Cambios Necesarios:

1. **Schema (`zmodel/permission.zmodel`)**:
   - Remover `TenantScoped` de `Module` y `Feature`
   - Agregar modelo `TenantModule`

2. **Inicialización (`src/actions/tenant.ts`)**:
   ```typescript
   // ANTES: Crear módulos y features por tenant
   await initializeModulesAndFeatures(db, tenantId);
   
   // DESPUÉS: Solo habilitar módulos globales para el tenant
   await enableDefaultModulesForTenant(db, tenantId);
   
   // Función propuesta:
   async function enableDefaultModulesForTenant(
     db: PrismaClient, 
     tenantId: string
   ) {
     // Obtener todos los módulos globales
     const allModules = await db.module.findMany({
       where: { isActive: true, deletedAt: null }
     });
     
     // Habilitar todos los módulos por defecto para el nuevo tenant
     await db.tenantModule.createMany({
       data: allModules.map(module => ({
         tenantId,
         moduleId: module.id,
         isEnabled: true,
         createdBy: 'system'
       })),
       skipDuplicates: true
     });
   }
   ```

3. **Queries existentes**:
   - Remover filtros por `tenantId` en queries de Module y Feature
   - Agregar joins con `TenantModule` cuando se necesite verificar si está habilitado
   - Crear helper functions para verificar disponibilidad:
     ```typescript
     // Verificar si un módulo está disponible para un tenant
     async function isModuleEnabledForTenant(tenantId: string, moduleId: string)
     
     // Obtener módulos disponibles para un tenant (considerando plan y tenantModule)
     async function getAvailableModulesForTenant(tenantId: string)
     
     // Obtener features disponibles para un tenant (considerando plan, tenantModule y límites)
     async function getAvailableFeaturesForTenant(tenantId: string)
     ```

4. **Roles y Permisos**:
   - `RoleFeature` y `AreaRoleFeature` seguirán siendo tenant-scoped (correcto)
   - Solo la referencia a `Feature` cambiará (ya no necesitará `tenantId`)

5. **PlanFeature (ya existe)**:
   - No requiere cambios, ya funciona con features globales
   - Solo actualizar la relación para que `featureId` apunte a features globales

6. **UsageTracking**:
   - Actualizar para usar `featureName` o `featureId` (sin `tenantId`)
   - O mantener `featureName` como está (string) para flexibilidad

## Recomendación

**Implementar la Arquitectura Híbrida** porque:
- Los módulos y features son definiciones del sistema, no configuraciones por tenant
- Permite control a dos niveles: Plan (qué features están disponibles) y Tenant (qué módulos activar)
- Simplifica significativamente el código (no duplicación)
- Facilita el mantenimiento y actualizaciones globales
- Flexibilidad para que tenants desactiven módulos que no necesitan, incluso si su plan los incluye
- Compatible con el sistema existente de `PlanFeature`

## Próximos Pasos

1. ✅ Crear server action para inicialización (COMPLETADO)
2. ⏳ Diseñar migración de datos
3. ⏳ Implementar modelo `TenantModule`
4. ⏳ Actualizar schema de Module y Feature
5. ⏳ Migrar datos existentes
6. ⏳ Actualizar queries y lógica de negocio

