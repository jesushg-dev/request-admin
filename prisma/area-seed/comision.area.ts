import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { generateUuid, UNSTABLE_TENANT_ID, type AssignmentCategoryInput } from '../util';

export async function createCommissionsArea(
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
          name: 'Multimedia',
          subcategories: [
            { name: 'Dth', description: '' },
            { name: 'Hfc', description: '' },
            { name: 'Hfc Cable', description: '' },
            { name: 'Hfc Digital', description: '' },
            { name: 'Linea Fija', description: '' },
            { name: 'Internet Digital', description: '' },
            { name: 'Internet Analogico', description: '' },
            { name: 'Simulacion', description: '' },
            { name: 'Enlace De Datos', description: '' },
            { name: 'Soporte Cloud', description: '' },
            { name: 'Claro Hogar Doble', description: '' },
            { name: 'Claro Hogar Triple', description: '' },
            {
              name: 'Legalizar Lfi / Modem Inalambrico Open',
              description: '',
            },
          ],
        },
        {
          name: 'Pospago',
          subcategories: [
            { name: 'Pospago', description: '' },
            { name: 'Incentivo', description: '' },
            { name: 'Bonos', description: '' },
            { name: 'Simulacion', description: '' },
            { name: 'Visitas', description: '' },
          ],
        },
        {
          name: 'Prepago',
          subcategories: [
            { name: 'Permanencia', description: '' },
            { name: 'Bono Kit', description: '' },
            { name: 'Activacion Simcard', description: '' },
            { name: 'Descuento Equipo', description: '' },
            { name: 'Favoritos', description: '' },
            { name: 'Simulacion', description: '' },
          ],
        },
        {
          name: 'Reembolso',
          subcategories: [
            { name: 'Lfi', description: '' },
            { name: 'Dth', description: '' },
            { name: 'Pospago', description: '' },
            { name: 'Modem', description: '' },
            { name: 'Simulacion', description: '' },
          ],
        },
        {
          name: 'Variacion De Precio',
          subcategories: [
            { name: 'Prepago', description: '' },
            { name: 'Simulacion', description: '' },
          ],
        },
        {
          name: 'Otros',
          subcategories: [{ name: 'Otros', description: '' }],
        },
        {
          name: 'Penalizacion',
          subcategories: [
            { name: 'Qflow', description: '' },
            { name: 'Mesa De Control', description: '' },
            { name: 'Malas Instalaciones (Tecnica)', description: '' },
            { name: 'Otros', description: '' },
            { name: 'Port In Ficticio', description: '' },
            { name: 'Expediente Incompleto', description: '' },
            { name: 'Falsificacion De Documentos', description: '' },
            {
              name: 'Activacion Sin Entrga Y Uso De Equipos',
              description: '',
            },
            { name: 'Baja Por Alta', description: '' },
            { name: 'Apropiacion De Pagos', description: '' },
            {
              name: 'Sustitucion De Equipos En Nuevas Contrataciones',
              description: '',
            },
            {
              name: 'Realizar Pago Para Llegar A La Meta Permanencia',
              description: '',
            },
            {
              name: 'Comision Sin Digitalizar El Contrato',
              description: '',
            },
            {
              name: 'Comsion Sin Entregar Documento En Fisico',
              description: '',
            },
            {
              name: 'Cliente No Ubicado En Visita Domiciliar',
              description: '',
            },
            {
              name: 'Contratar Personal Circualdo En Lista Negra',
              description: '',
            },
            {
              name: 'Clientes Multimedias No Verificados',
              description: '',
            },
          ],
        },
        {
          name: 'Creditos',
          subcategories: [{ name: 'Especiales', description: '' }],
        },
        {
          name: 'Facturacion',
          subcategories: [{ name: 'Facturacion', description: '' }],
        },
        {
          name: 'Semillero',
          subcategories: [
            { name: 'Semilleros Servicios Fijos', description: '' },
            { name: 'Semilleros Servicios Movil', description: '' },
          ],
        },
        {
          name: 'Correccion De Canal De Venta',
          subcategories: [{ name: 'Correccion De Canal De Venta', description: '' }],
        },
        {
          name: 'Reasignacion Sispaco',
          subcategories: [{ name: 'Mal Empaquetados', description: '' }],
        },
      ],
    },
    {
      name: 'Consulta',
      description: '',
      subcategories: [
        {
          name: 'Multimedia',
          subcategories: [
            { name: 'Dth', description: '' },
            { name: 'Hfc', description: '' },
            { name: 'Hfc Cable', description: '' },
            { name: 'Hfc Digital', description: '' },
            { name: 'Linea Fija', description: '' },
            { name: 'Internet Digital', description: '' },
            { name: 'Internet Analogo', description: '' },
            { name: 'Simulacion', description: '' },
            { name: 'Enlace De Datos', description: '' },
            { name: 'Soporte Cloud', description: '' },
            { name: 'Claro Hogar Doble', description: '' },
            { name: 'Claro Hogar Triple', description: '' },
            {
              name: 'Legalizar Lfi / Modem Inalambrico Open',
              description: '',
            },
          ],
        },
        {
          name: 'Pospago',
          subcategories: [
            { name: 'Pospago', description: '' },
            { name: 'Incentivo', description: '' },
            { name: 'Bonos', description: '' },
            { name: 'Simulacion', description: '' },
            { name: 'Visitas', description: '' },
          ],
        },
        {
          name: 'Prepago',
          subcategories: [
            { name: 'Permanencia', description: '' },
            { name: 'Bono Kit', description: '' },
            { name: 'Activacion Simcard', description: '' },
            { name: 'Descuento Equipo', description: '' },
            { name: 'Favoritos', description: '' },
            { name: 'Simulacion', description: '' },
          ],
        },
        {
          name: 'Reembolso',
          subcategories: [
            { name: 'Lfi', description: '' },
            { name: 'Dth', description: '' },
            { name: 'Pospago', description: '' },
            { name: 'Modem', description: '' },
            { name: 'Simulacion', description: '' },
          ],
        },
        {
          name: 'Variacion De Precio',
          subcategories: [
            { name: 'Prepago', description: '' },
            { name: 'Simulacion', description: '' },
          ],
        },
        {
          name: 'Otros',
          subcategories: [{ name: 'Otros', description: '' }],
        },
        {
          name: 'Penalizacion',
          subcategories: [
            { name: 'Qflow', description: '' },
            { name: 'Mesa De Control', description: '' },
            { name: 'Malas Instalaciones (Tecnica)', description: '' },
            { name: 'Otros', description: '' },
            { name: 'Port In Ficticio', description: '' },
            { name: 'Expediente Incompleto', description: '' },
            { name: 'Falsificacion De Documentos', description: '' },
            {
              name: 'Activacion Sin Entrga Y Uso De Equipos',
              description: '',
            },
            { name: 'Baja Por Alta', description: '' },
            { name: 'Apropiacion De Pagos', description: '' },
            {
              name: 'Sustitucion De Equipos En Nuevas Contrataciones',
              description: '',
            },
            {
              name: 'Realizar Pago Para Llegar A La Meta Permanencia',
              description: '',
            },
            {
              name: 'Comision Sin Digitalizar El Contrato',
              description: '',
            },
            {
              name: 'Comision Sin Entregar Expediente Fisico',
              description: '',
            },
            {
              name: 'Cliente No Ubicado En Visita Domiciliar',
              description: '',
            },
            {
              name: 'Contratar Personal Circualdo En Lista Negra',
              description: '',
            },
            {
              name: 'Clientes Multimedias No Verificados',
              description: '',
            },
          ],
        },
        {
          name: 'Creditos',
          subcategories: [{ name: 'Especiales', description: '' }],
        },
        {
          name: 'Facturacion',
          subcategories: [{ name: 'Facturacion', description: '' }],
        },
        {
          name: 'Semillero',
          subcategories: [
            { name: 'Semillero Servicio Fijo', description: '' },
            { name: 'Semillero Servicio Movil', description: '' },
          ],
        },
        {
          name: 'Correccion De Canal De Venta',
          subcategories: [{ name: 'Correccion De Canal De Venta', description: '' }],
        },
        {
          name: 'Reasignacion Sispaco',
          subcategories: [{ name: 'Mal Empaquetados', description: '' }],
        },
      ],
    },
    {
      name: 'Reclamo',
      description: '',
      subcategories: [
        {
          name: 'Multimedia',
          subcategories: [
            { name: 'Dth', description: '' },
            { name: 'Hfc', description: '' },
            { name: 'Hfc Cable', description: '' },
            { name: 'Hfc Digital', description: '' },
            { name: 'Linea Fija', description: '' },
            { name: 'Internet Digital', description: '' },
            { name: 'Internet Analogo', description: '' },
            { name: 'Simulacion', description: '' },
            { name: 'Enlace De Datos', description: '' },
            { name: 'Soporte Cloud', description: '' },
            { name: 'Claro Hogar Doble', description: '' },
            { name: 'Claro Hogar Triple', description: '' },
            {
              name: 'Legalizar Lfi / Modem Inalambrico Open',
              description: '',
            },
          ],
        },
        {
          name: 'Pospago',
          subcategories: [
            { name: 'Pospago', description: '' },
            { name: 'Incentivo', description: '' },
            { name: 'Bonos', description: '' },
            { name: 'Simulacion', description: '' },
            { name: 'Visitas', description: '' },
          ],
        },
        {
          name: 'Prepago',
          subcategories: [
            { name: 'Permanencia', description: '' },
            { name: 'Bono Kit', description: '' },
            { name: 'Activacion Simcard', description: '' },
            { name: 'Descuento Equipo', description: '' },
            { name: 'Favoritos', description: '' },
            { name: 'Simulacion', description: '' },
          ],
        },
        {
          name: 'Reembolso',
          subcategories: [
            { name: 'Lfi', description: '' },
            { name: 'Dth', description: '' },
            { name: 'Pospago', description: '' },
            { name: 'Modem', description: '' },
            { name: 'Simulacion', description: '' },
          ],
        },
        {
          name: 'Variacion De Precio',
          subcategories: [
            { name: 'Prepago', description: '' },
            { name: 'Simulacion', description: '' },
          ],
        },
        {
          name: 'Otros',
          subcategories: [{ name: 'Otros', description: '' }],
        },
        {
          name: 'Penalizacion',
          subcategories: [
            { name: 'Qflow', description: '' },
            { name: 'Mesa De Control', description: '' },
            { name: 'Malas Instalaciones (Tecnica)', description: '' },
            { name: 'Otros', description: '' },
            { name: 'Port In Ficticio', description: '' },
            { name: 'Expediente Incompleto', description: '' },
            { name: 'Falsificacion De Documentos', description: '' },
            {
              name: 'Activacion Sin Entrga Y Uso De Equipos',
              description: '',
            },
            { name: 'Baja Por Alta', description: '' },
            { name: 'Apropiacion De Pagos', description: '' },
            {
              name: 'Sustitucion De Equipos En Nuevas Contrataciones',
              description: '',
            },
            {
              name: 'Realizar Pago Para Llegar A La Meta Permanencia',
              description: '',
            },
            {
              name: 'Comision Sin Digitalizar El Contrato',
              description: '',
            },
            {
              name: 'Comision Sin Entregar Expediente Fisico',
              description: '',
            },
            {
              name: 'Cliente No Ubicado En Visita Domiciliar',
              description: '',
            },
            {
              name: 'Contratar Personal Circualdo En Lista Negra',
              description: '',
            },
            {
              name: 'Clientes Multimedias No Verificados',
              description: '',
            },
            {
              name: 'Creditos',
              subcategories: [{ name: 'Especiales', description: '' }],
            },
            {
              name: 'Facturacion',
              subcategories: [{ name: 'Facturacion', description: '' }],
            },
            {
              name: 'Semillero',
              subcategories: [
                { name: 'Semillero Servicio Fijo', description: '' },
                { name: 'Semillero Servicio Movil', description: '' },
              ],
            },
            {
              name: 'Correccion De Canal De Venta',
              subcategories: [{ name: 'Correccion De Canal De Venta', description: '' }],
            },
            {
              name: 'Reasignacion Sispaco',
              subcategories: [{ name: 'Mal Empaquetados', description: '' }],
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
      name: 'Comisiones',
      description: '',
      tenantId,
      assignmentCategories: {
        create: assignmentCategoryData,
      },
    },
  });
}
