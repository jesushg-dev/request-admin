import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { generateUuid, UNSTABLE_TENANT_ID, type AssignmentCategoryInput } from 'prisma/util';

export async function createCobranzaArea(
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
      name: 'Reclamo',
      description: '',
      subcategories: [
        {
          name: 'Reclamos',
          description: '',
          subcategories: [
            { name: 'Mala Facturacion', description: '' },
            { name: 'Falla Tecnica', description: '' },
            { name: 'Falllas Con El Dispositivo Del Servicio', description: '' },
            { name: 'No Recibio Factura', description: '' },
            { name: 'Exceso De Llamadas Internacionales Y Celulares', description: '' },
            { name: 'Problemas De Debito Automatico', description: '' },
            { name: 'Descuento No Aplicado', description: '' },
            { name: 'Promocion No Aplicada', description: '' },
            { name: 'Retiro De Servicio No Atendido', description: '' },
            { name: 'No Instalaron El Servicio', description: '' },
            { name: 'Pago Mal Aplicado', description: '' },
          ],
        },
        {
          name: 'Solicitudes',
          description: '',
          subcategories: [
            { name: 'Limpieza De Cd', description: '' },
            { name: 'Autorizacion De Descuento', description: '' },
            { name: 'Autorizacion Recepcion De Equipos', description: '' },
            { name: 'Autorizacion De Arp', description: '' },
            { name: 'Reversion Cd Reactivadores', description: '' },
            { name: 'Limpieza Reactivacion Casa Claro / Dth', description: '' },
            { name: 'Limpieza Reactivacion Casa Claro / Suspendido', description: '' },
            { name: 'Limpieza Por Certificado De Defuncion', description: '' },
          ],
        },
        {
          name: 'Gestion De Cobro Por Agencia',
          description: '',
          subcategories: [
            { name: 'Asignacion De Cartera', description: '' },
            { name: 'Rebaja De Cartera', description: '' },
          ],
        },
      ],
    },
    {
      name: 'Solicitud',
      description: '',
      subcategories: [
        {
          name: 'Reclamos',
          description: '',
          subcategories: [
            { name: 'Mala Facturacion', description: '' },
            { name: 'Falla Tecnica', description: '' },
            { name: 'Falllas Con El Dispositivo Del Servicio', description: '' },
            { name: 'No Recibio Factura', description: '' },
            { name: 'Exceso De Llamadas Internacionales Y Celulares', description: '' },
            { name: 'Problemas De Debito Automatico', description: '' },
            { name: 'Descuento No Aplicado', description: '' },
            { name: 'Promocion No Aplicada', description: '' },
            { name: 'Retiro De Servicio No Atendido', description: '' },
            { name: 'No Instalaron El Servicio', description: '' },
            { name: 'Pago Mal Aplicado', description: '' },
          ],
        },
        {
          name: 'Solicitudes',
          description: '',
          subcategories: [
            { name: 'Limpieza De Cd', description: '' },
            { name: 'Autorizacion De Descuento', description: '' },
            { name: 'Autorizacion Recepcion De Equipos', description: '' },
            { name: 'Autorizacion De Arp', description: '' },
            { name: 'Reversion Cd Reactivadores', description: '' },
            { name: 'Limpieza Reactivacion Casa Claro / Dth', description: '' },
            { name: 'Limpieza Reactivacion Casa Claro / Suspendido', description: '' },
            { name: 'Limpieza Por Certificado De Defuncion', description: '' },
          ],
        },
        {
          name: 'Gestion De Cobro Por Agencia',
          description: '',
          subcategories: [
            { name: 'Asignacion De Cartera', description: '' },
            { name: 'Rebaja De Cartera', description: '' },
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
      name: 'Cobranza',
      description: '',
      tenantId,
      assignmentCategories: {
        create: assignmentCategoryData,
      },
    },
  });
}
