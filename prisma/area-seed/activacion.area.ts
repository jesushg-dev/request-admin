import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { generateUuid, UNSTABLE_TENANT_ID, type AssignmentCategoryInput } from 'prisma/util';

export async function createActivacionArea(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  hierarchyId: string,
  hierarchyLevelRequestTypeId: string,
  hierarchyLevelCategoryId: string,
  hierarchyLevelSubcategoryId: string
) {
  const areaId = generateUuid();
  const tenantId = UNSTABLE_TENANT_ID;

  const assignmentCategories: AssignmentCategoryInput[] = [
    {
      name: 'Solicitud',
      description: '',
      subcategories: [
        {
          name: 'Activacion Pospago',
          subcategories: [
            {
              name: 'Despacho De Equipos',
              description: '',
            },
            {
              name: 'Activacion De Linea',
              description: '',
            },
            {
              name: 'Solicitud De Simcard',
              description: '',
            },
            {
              name: 'Renovacion Pospago',
              description: '',
            },
          ],
        },
        {
          name: 'Multimedia',
          subcategories: [
            {
              name: 'Dth',
              description: '',
            },
            {
              name: 'Hfc',
              description: '',
            },
            {
              name: 'Hfc Cable',
              description: '',
            },
            {
              name: 'Hfc Digital',
              description: '',
            },
            {
              name: 'Linea Fija',
              description: '',
            },
            {
              name: 'Internet Digital',
              description: '',
            },
            {
              name: 'Internet Analogo',
              description: '',
            },
            {
              name: 'Simulacion',
              description: '',
            },
            {
              name: 'Enlace De Datos',
              description: '',
            },
            {
              name: 'Soporte Cloud',
              description: '',
            },
            {
              name: 'Claro Hogar Doble',
              description: '',
            },
            {
              name: 'Claro Hogar Triple',
              description: '',
            },
            {
              name: 'Legalizar Lfi / Modem Inalambrico Open',
              description: '',
            },
          ],
        },
        {
          name: 'Correccion De Canal De Venta',
          subcategories: [
            {
              name: 'Correccion De Canal De Venta',
              description: '',
            },
          ],
        },
        {
          name: 'Baja De Servicio',
          subcategories: [
            {
              name: 'Baja De Servicio Movil',
              description: '',
            },
          ],
        },
        {
          name: 'Modificaciones',
          subcategories: [
            {
              name: 'Activacion De Servicios Suplementarios',
              description: '',
            },
            {
              name: 'Baja Por Migracion De Servicios',
              description: '',
            },
            {
              name: 'Cambio De Razon Social / Actualizacion De Datos',
              description: '',
            },
            {
              name: 'Cambio De Variable / Empaquetamientos',
              description: '',
            },
            {
              name: 'Correccion De Servicio',
              description: '',
            },
            {
              name: 'Anulacion De Solicitud De Venta Por Mal Registro',
              description: '',
            },
            {
              name: 'Adicion De Numero Favorito Lda',
              description: '',
            },
            {
              name: 'Adicion / Retiro De Paquetes De Canales',
              description: '',
            },
            {
              name: 'Cambio De Direccion',
              description: '',
            },
            {
              name: 'Correccion / Cambio De Direccion',
              description: '',
            },
          ],
        },
        {
          name: 'Asignaciones Internas',
          subcategories: [
            {
              name: 'Activacion De Linea Asignada',
              description: '',
            },
            {
              name: 'Activacion De Planes De Prueba',
              description: '',
            },
            {
              name: 'Activaciones De Servicios Fijos',
              description: '',
            },
            {
              name: 'Cambio De Razon Social',
              description: '',
            },
            {
              name: 'Baja De Servicio O Lineas',
              description: '',
            },
          ],
        },
        {
          name: 'Carga De Financiamiento',
          subcategories: [
            {
              name: 'Financiamiento Bscs',
              description: '',
            },
            {
              name: 'Financiamiento Open',
              description: '',
            },
          ],
        },
        {
          name: 'Reinicio De Contraseña',
          subcategories: [
            {
              name: 'Reinicio De Contraseña Open',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Bscs',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Siv',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Intranet',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Onbase',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Vpn',
              description: '',
            },
          ],
        },
        {
          name: 'Sistemas',
          subcategories: [
            {
              name: 'Creacion De Accesos',
              description: '',
            },
            {
              name: 'Baja De Accesos',
              description: '',
            },
            {
              name: 'Cambio',
              description: '',
            },
            {
              name: 'Claro Altas',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Altas',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Docflow',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Syrem Ventas',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Helpdesk',
              description: '',
            },
          ],
        },
        {
          name: 'Contrato Fisico',
          subcategories: [
            {
              name: 'Entrega De Contratos',
              description: '',
            },
          ],
        },
        {
          name: 'Reactivacion Cambio De Razon Social',
          subcategories: [
            {
              name: 'Pospago',
              description: '',
            },
            {
              name: 'Casa Claro',
              description: '',
            },
            {
              name: 'Dth',
              description: '',
            },
          ],
        },
        {
          name: 'Reactivaciones',
          subcategories: [
            {
              name: 'Dth',
              description: '',
            },
            {
              name: 'Pospago',
              description: '',
            },
            {
              name: 'Casa Claro',
              description: '',
            },
            {
              name: 'Desbloqueo De Modem',
              description: '',
            },
          ],
        },
        {
          name: 'Reactivacion Cambio De Plan',
          subcategories: [
            {
              name: 'Pospago',
              description: '',
            },
            {
              name: 'Dth',
              description: '',
            },
            {
              name: 'Casa Claro',
              description: '',
            },
          ],
        },
        {
          name: 'Qflow - Mala Venta',
          subcategories: [
            {
              name: 'Mala Venta',
              description: '',
            },
          ],
        },
      ],
    },
    {
      name: 'Solicitud Activacion',
      description: '',
      subcategories: [
        {
          name: 'Activacion Pospago',
          subcategories: [
            {
              name: 'Despacho De Equipos',
              description: '',
            },
            {
              name: 'Activacion De Linea',
              description: '',
            },
            {
              name: 'Solicitud De Simcard',
              description: '',
            },
            {
              name: 'Renovacion Pospago',
              description: '',
            },
          ],
        },
        {
          name: 'Multimedia',
          subcategories: [
            {
              name: 'Dth',
              description: '',
            },
            {
              name: 'Hfc',
              description: '',
            },
            {
              name: 'Hfc Cable',
              description: '',
            },
            {
              name: 'Hfc Digital',
              description: '',
            },
            {
              name: 'Linea Fija',
              description: '',
            },
            {
              name: 'Internet Digital',
              description: '',
            },
            {
              name: 'Internet Analogo',
              description: '',
            },
            {
              name: 'Simulacion',
              description: '',
            },
            {
              name: 'Enlace De Datos',
              description: '',
            },
            {
              name: 'Soporte Cloud',
              description: '',
            },
            {
              name: 'Claro Hogar Doble',
              description: '',
            },
            {
              name: 'Claro Hogar Triple',
              description: '',
            },
            {
              name: 'Legalizar Lfi / Modem Inalambrico Open',
              description: '',
            },
          ],
        },
        {
          name: 'Correccion Canal De Venta',
          subcategories: [
            {
              name: 'Correccion Canal De Venta',
              description: '',
            },
          ],
        },
        {
          name: 'Baja De Servicio',
          subcategories: [
            {
              name: 'Baja De Servicio Movil',
              description: '',
            },
          ],
        },
        {
          name: 'Modificaciones',
          subcategories: [
            {
              name: 'Activacion De Servicios Suplementarios',
              description: '',
            },
            {
              name: 'Baja Por Migracion De Servicios',
              description: '',
            },
            {
              name: 'Cambio De Razon Social / Actualizacion De Datos',
              description: '',
            },
            {
              name: 'Cambio De Variable / Empaquetamientos',
              description: '',
            },
            {
              name: 'Correccion De Servicio',
              description: '',
            },
            {
              name: 'Anulacion De Solicitud De Venta Por Mal Registro',
              description: '',
            },
            {
              name: 'Adicion De Numero Favorito Lda',
              description: '',
            },
            {
              name: 'Adicion / Retiro De Paquetes De Canales',
              description: '',
            },
            {
              name: 'Cambio De Direccion',
              description: '',
            },
          ],
        },
        {
          name: 'Asignaciones Internas',
          subcategories: [
            {
              name: 'Activacion De Linea Asignada',
              description: '',
            },
            {
              name: 'Activacion De Planes De Prueba',
              description: '',
            },
            {
              name: 'Activacion De Servicios Fijos',
              description: '',
            },
            {
              name: 'Cambio Razon Social',
              description: '',
            },
            {
              name: 'Baja De Servicio O Lineas',
              description: '',
            },
          ],
        },
        {
          name: 'Carga De Financiamiento',
          subcategories: [
            {
              name: 'Financiamiento Bscs',
              description: '',
            },
            {
              name: 'Financiamiento Open',
              description: '',
            },
          ],
        },
        {
          name: 'Reinicio De Contraseña',
          subcategories: [
            {
              name: 'Reinicio De Contraseña Open',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Bscs',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Siv',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Intranet',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Onbase',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Vpn',
              description: '',
            },
          ],
        },
        {
          name: 'Sistemas',
          subcategories: [
            {
              name: 'Creacion De Accesos',
              description: '',
            },
            {
              name: 'Baja De Accesos',
              description: '',
            },
            {
              name: 'Cambio',
              description: '',
            },
            {
              name: 'Claro Altas',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Altas',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Docflow',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Syrem Ventas',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Helpdesk',
              description: '',
            },
          ],
        },
        {
          name: 'Contrato Fisico',
          subcategories: [
            {
              name: 'Entrega De Contratos',
              description: '',
            },
          ],
        },
        {
          name: 'Reactivacion Cambio De Razon Social',
          subcategories: [
            {
              name: 'Pospago',
              description: '',
            },
            {
              name: 'Casa Claro',
              description: '',
            },
            {
              name: 'Dth',
              description: '',
            },
          ],
        },
        {
          name: 'Reactivaciones',
          subcategories: [
            {
              name: 'Dth',
              description: '',
            },
            {
              name: 'Pospago',
              description: '',
            },
            {
              name: 'Casa Claro',
              description: '',
            },
            {
              name: 'Desbloqueo De Modem',
              description: '',
            },
          ],
        },
        {
          name: 'Reactivacion Cambio De Plan',
          subcategories: [
            {
              name: 'Pospago',
              description: '',
            },
            {
              name: 'Dth',
              description: '',
            },
            {
              name: 'Casa Claro',
              description: '',
            },
          ],
        },
        {
          name: 'Qflow - Mala Venta',
          subcategories: [
            {
              name: 'Mala Venta',
              description: '',
            },
          ],
        },
      ],
    },
    {
      name: 'Entrega Documentos Logistic',
      description: '',
      subcategories: [
        {
          name: 'Activacion Pospago',
          subcategories: [
            {
              name: 'Despacho De Equipos',
              description: '',
            },
            {
              name: 'Activacion De Linea',
              description: '',
            },
            {
              name: 'Solicitud De Simcard',
              description: '',
            },
            {
              name: 'Renovacion Pospago',
              description: '',
            },
          ],
        },
        {
          name: 'Multimedia',
          subcategories: [
            {
              name: 'Dth',
              description: '',
            },
            {
              name: 'Hfc',
              description: '',
            },
            {
              name: 'Hfc Cable',
              description: '',
            },
            {
              name: 'Hfc Digital',
              description: '',
            },
            {
              name: 'Linea Fija',
              description: '',
            },
            {
              name: 'Internet Digital',
              description: '',
            },
            {
              name: 'Internet Analogo',
              description: '',
            },
            {
              name: 'Simulacion',
              description: '',
            },
            {
              name: 'Enlace De Datos',
              description: '',
            },
            {
              name: 'Soporte Cloud',
              description: '',
            },
            {
              name: 'Claro Hogar Doble',
              description: '',
            },
            {
              name: 'Claro Hogar Triple',
              description: '',
            },
            {
              name: 'Legalizar Lfi / Modem Inalambrico Open',
              description: '',
            },
          ],
        },
        {
          name: 'Correccion Canal De Venta',
          subcategories: [
            {
              name: 'Correccion Canal De Venta',
              description: '',
            },
          ],
        },
        {
          name: 'Baja De Servicio',
          subcategories: [
            {
              name: 'Baja De Servicio Movil',
              description: '',
            },
          ],
        },
        {
          name: 'Modificaciones',
          subcategories: [
            {
              name: 'Activacion De Servicios Suplementarios',
              description: '',
            },
            {
              name: 'Baja Por Migracion De Servicios',
              description: '',
            },
            {
              name: 'Cambio De Razon Social / Actualizacion De Datos',
              description: '',
            },
            {
              name: 'Cambio De Variable / Empaquetamientos',
              description: '',
            },
            {
              name: 'Correccion De Servicio',
              description: '',
            },
            {
              name: 'Anulacion De Solicitud De Venta Por Mal Registro',
              description: '',
            },
            {
              name: 'Adicion De Numero Favorito Lda',
              description: '',
            },
            {
              name: 'Adicion / Retiro De Paquetes De Canales',
              description: '',
            },
            {
              name: 'Cambio De Direccion',
              description: '',
            },
          ],
        },
        {
          name: 'Asignaciones Internas',
          subcategories: [
            {
              name: 'Activacion De Linea Asignada',
              description: '',
            },
            {
              name: 'Activacion De Planes De Prueba',
              description: '',
            },
            {
              name: 'Activacion De Servicios Fijos',
              description: '',
            },
            {
              name: 'Cambio Razon Social',
              description: '',
            },
            {
              name: 'Baja De Servicio O Lineas',
              description: '',
            },
          ],
        },
        {
          name: 'Carga De Financiamiento',
          subcategories: [
            {
              name: 'Financiamiento Bscs',
              description: '',
            },
            {
              name: 'Financiamiento Open',
              description: '',
            },
          ],
        },
        {
          name: 'Reinicio De Contraseña',
          subcategories: [
            {
              name: 'Reinicio De Contraseña Open',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Bscs',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Siv',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Intranet',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Onbase',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Vpn',
              description: '',
            },
          ],
        },
        {
          name: 'Sistemas',
          subcategories: [
            {
              name: 'Creacion De Accesos',
              description: '',
            },
            {
              name: 'Baja De Accesos',
              description: '',
            },
            {
              name: 'Cambio',
              description: '',
            },
            {
              name: 'Claro Altas',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Altas',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Docflow',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Syrem Ventas',
              description: '',
            },
            {
              name: 'Reinicio De Contraseña Helpdesk',
              description: '',
            },
          ],
        },
        {
          name: 'Contrato Fisico',
          subcategories: [
            {
              name: 'Entrega De Contratos',
              description: '',
            },
          ],
        },
        {
          name: 'Reactivacion Cambio De Razon Social',
          subcategories: [
            {
              name: 'Pospago',
              description: '',
            },
            {
              name: 'Casa Claro',
              description: '',
            },
            {
              name: 'Dth',
              description: '',
            },
          ],
        },
        {
          name: 'Reactivaciones',
          subcategories: [
            {
              name: 'Dth',
              description: '',
            },
            {
              name: 'Pospago',
              description: '',
            },
            {
              name: 'Casa Claro',
              description: '',
            },
            {
              name: 'Desbloqueo De Modem',
              description: '',
            },
          ],
        },
        {
          name: 'Reactivacion Cambio De Plan',
          subcategories: [
            {
              name: 'Pospago',
              description: '',
            },
            {
              name: 'Dth',
              description: '',
            },
            {
              name: 'Casa Claro',
              description: '',
            },
          ],
        },
        {
          name: 'Qflow - Mala Venta',
          subcategories: [
            {
              name: 'Mala Venta',
              description: '',
            },
          ],
        },
      ],
    },
  ];

  const assignmentCategoryData = assignmentCategories.map((category) => ({
    name: category.name,
    description: category.description,
    tenantId,
    hierarchyId,
    hierarchyLevelId: hierarchyLevelRequestTypeId,
    subcategories: {
      create: category.subcategories?.map((subcategory) => ({
        name: subcategory.name,
        description: subcategory.description,
        tenantId,
        hierarchyId,
        hierarchyLevelId: hierarchyLevelCategoryId,
        areaId,
        subcategories: {
          create: subcategory.subcategories?.map((subSubcategory) => ({
            name: subSubcategory.name,
            description: subSubcategory.description,
            tenantId,
            hierarchyId,
            hierarchyLevelId: hierarchyLevelSubcategoryId,
            areaId,
          })),
        },
      })),
    },
  }));

  await prisma.area.create({
    data: {
      id: areaId,
      name: 'Activaciones',
      description: '',
      tenantId,
      assignmentCategories: {
        create: assignmentCategoryData,
      },
    },
  });
}
