# Usuarios de Prueba - Documentación QA

## Tabla de Usuarios

| Nombre | Email | Username | Contraseña | Rol Sistema |
|--------|-------|----------|------------|-------------|
| Jesus Hernandez | jess232016@gmail.com | jess232016 | `Lamisma123*` | Administrador |
| Danilo Acevedo | danilo@gmail.com | danilo | `Lamisma123*` | Analista |
| María González | maria.gonzalez@claro.com.ni | maria.gonzalez | `Test123*` | Coordinador |
| Luis Fernández | luis.fernandez@claro.com.ni | luis.fernandez | `Test123*` | Coordinador |
| Carmen Díaz | carmen.diaz@claro.com.ni | carmen.diaz | `Test123*` | Coordinador |
| Carlos Ramírez | carlos.ramirez@claro.com.ni | carlos.ramirez | `Test123*` | Analista |
| Laura Sánchez | laura.sanchez@claro.com.ni | laura.sanchez | `Test123*` | Analista |
| Diego Morales | diego.morales@claro.com.ni | diego.morales | `Test123*` | Analista |
| Fernando Castro | fernando.castro@claro.com.ni | fernando.castro | `Test123*` | Analista |
| Ana Martínez | ana.martinez@claro.com.ni | ana.martinez | `Test123*` | Distribuidor |
| Roberto Jiménez | roberto.jimenez@claro.com.ni | roberto.jimenez | `Test123*` | Distribuidor |
| Patricia Vega | patricia.vega@claro.com.ni | patricia.vega | `Test123*` | Distribuidor |

**Total:** 12 usuarios
- 1 Administrador
- 5 Analistas (1 del sistema + 4 de prueba)
- 3 Coordinadores
- 3 Distribuidores

## Tabla de Roles del Sistema

| Rol | Descripción | Permisos Principales |
|-----|-------------|---------------------|
| **Administrador** | Control total del sistema | • Acceso completo a todas las funcionalidades<br>• Gestión de usuarios, roles y permisos<br>• Configuración del sistema<br>• Todos los permisos de gestión de solicitudes |
| **Coordinador** | Supervisa y gestiona solicitudes | • Ver y supervisar solicitudes<br>• Asignar usuarios a solicitudes<br>• Establecer prioridades y estados<br>• Ver reportes y exportar datos<br>• Ver documentos |
| **Analista** | Resuelve solicitudes asignadas | • Ver solicitudes asignadas<br>• Editar solicitudes asignadas<br>• Establecer estados de solicitudes<br>• Enviar documentos<br>• Ver documentos |
| **Distribuidor** | Crea solicitudes en nombre de clientes | • Crear solicitudes<br>• Ver solicitudes creadas<br>• Enviar documentos relacionados<br>• Ver documentos básicos |

## Notas Importantes

- **Usuarios del sistema** (Jesus, Danilo): Contraseña `Lamisma123*`
- **Usuarios de prueba**: Contraseña `Test123*`
- Todos los usuarios tienen email verificado y están activos
- Los usuarios se asignan automáticamente roles de área (Supervisor/Colaborador) en cada área del sistema
- La distribución de roles de área es automática: primera mitad = Supervisor, segunda mitad = Colaborador