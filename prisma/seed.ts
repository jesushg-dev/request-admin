import { PrismaClient } from '@prisma/client';

import { hashPassword } from '@/lib/password';

import { createActivacionArea } from './area-seed/activacion.area';
import { createAprobadosCreditoMesaControlArea } from './area-seed/aprobados-credito-mesa-control.area';
import { createAreaTecnicaArea } from './area-seed/area-tecnica.area';
import { createCIAArea } from './area-seed/cia.area';
import { createCobranzaArea } from './area-seed/cobranza.area';
import { createInternalCommissionsArea } from './area-seed/comision-interna.area';
import { createCommissionsArea } from './area-seed/comision.area';
import { createComprasArea } from './area-seed/compras.area';
import { createCreditosArea } from './area-seed/creditos.area';
import { createEdatelReactivacionArea } from './area-seed/edatel-reactivacion.area';
import { createFacturacionDeudoresVariosArea } from './area-seed/facturacion-deudores-varios.area';
import { createFacturacionArea } from './area-seed/facturacion.area';
import { createGextionaReactivacionArea } from './area-seed/gextiona-reactivacion.area';
import { createInvercobroReactivacionArea } from './area-seed/invercobro-reactivacion.area';
import { createMultipagosReactivacionArea } from './area-seed/multipagos-reactivacion.area';
import { createProcesamientoEquiposArea } from './area-seed/procesamiento-equipos.area';
import { createReactivacionArea } from './area-seed/reactivacion.area';
import { createRecuperacionEquiposArea } from './area-seed/recuperacion-equipos.area';
import { createResuelvaReactivacionArea } from './area-seed/resuelva-reactivacion.area';
import { createSerdicoReactivacionArea } from './area-seed/serdico-reactivacion.area';
import { createTrasladosDeEquiposArea } from './area-seed/traslados-equipos.area';
import { PrismaModules } from './module';
import { UNSTABLE_TENANT_ID } from './util';

const prisma = new PrismaClient();

async function main() {
  //////////////////////////
  // Create Tenant
  //////////////////////////

  await prisma.tenant.create({
    data: {
      id: UNSTABLE_TENANT_ID,
      name: 'Claro',
      logoUrl: 'https://1000marcas.net/wp-content/uploads/2021/02/Claro-Logo.png',
      websiteUrl: 'https://www.claro.com.ni',
      title: 'Claro',
      description: 'Claro es una empresa de telecomunicaciones que opera en 18 países de América Latina.',
      primaryColor: '#FF0000',
      secondaryColor: '#FFFFFF',
    },
  });

  await createModuleAndFeature();

  //////////////////////////
  // Create Identification Types
  //////////////////////////
  const dnIdentificationType = await prisma.identificationType.create({
    data: {
      id: 'FF463BE7-CE18-4923-986E-BAD58A547177',
      name: 'Cedula',
      description: 'Cedula de identidad.',
      tenantId: UNSTABLE_TENANT_ID,
    },
  });

  const passportIdentificationType = await prisma.identificationType.create({
    data: {
      id: 'EBFB6FA0-BA18-4DF4-B925-12659A259957',
      name: 'Pasaporte',
      description: 'Pasaporte de identidad.',
      tenantId: UNSTABLE_TENANT_ID,
    },
  });

  //////////////////////////
  // Create users
  //////////////////////////
  const user = await prisma.user.create({
    data: {
      id: '51C9BBA8-6C86-4E6C-8FE2-E98BB42A07F8',
      email: 'jess232016@gmail.com',
      username: 'jess232016',
      password: await hashPassword('Lamisma123*'),
      isGlobalAdmin: true,
      userTenants: {
        create: {
          id: '98c74680-9b23-473d-a105-b2591e2cd187',
          tenantId: UNSTABLE_TENANT_ID,
          isActive: true,
          joinedAt: new Date(),
          isSuperAdmin: true,
          person: {
            create: {
              id: '7B159275-47A7-4957-9419-4ABBAED5B8AD',
              firstName: 'Jesus',
              lastName: 'Hernandez',
              email: 'jesus.hernandez@gmail.com',
              phone: '89898989',
              identificationNumber: '134-123456-0000A',
              identificationTypeId: dnIdentificationType.id,
              tenantId: UNSTABLE_TENANT_ID,
            },
          },
        },
      },
    },
  });

  const secondUser = await prisma.user.create({
    data: {
      id: 'D1A3D3A4-3D3A-4D3A-8D3A-3D3A3D3A3D3A',
      email: 'danilo@gmail.com',
      username: 'danilo',
      password: await hashPassword('Lamisma123*'),
      isGlobalAdmin: true,
      userTenants: {
        create: {
          tenantId: UNSTABLE_TENANT_ID,
          isActive: true,
          joinedAt: new Date(),
          isSuperAdmin: true,
          person: {
            create: {
              id: 'FB420CF8-8820-4FB7-9FE5-BFE7B2F83894',
              firstName: 'Danilo',
              lastName: 'Acevedo',
              email: 'Danico.Acevedo@gmail.com',
              phone: '12345678',
              identificationNumber: '254-555456-0000A',
              identificationTypeId: dnIdentificationType.id,
              tenantId: UNSTABLE_TENANT_ID,
            },
          },
        },
      },
    },
  });

  //////////////////////////
  // Create areas
  //        Request Types
  //                Categories
  //                        Subcategories
  //////////////////////////
  const hierarchy = await createAreaHierarchy();

  await createAreas(hierarchy.hierarchyId, hierarchy.hierarchyLevelRequestTypeId, hierarchy.hierarchyLevelCategoryId, hierarchy.hierarchyLevelSubcategoryId);

  //////////////////////////
  // Create requirements categories
  //////////////////////////
  await prisma.requirementType.createMany({
    data: [
      {
        id: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        name: 'Legal',
        description: 'Requerimientos legales para la conformidad y operación.',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '7E2E9795-A90D-4E27-8ABF-FCA3CE528212',
        name: 'Técnico',
        description: 'Requerimientos técnicos necesarios para la prestación del servicio.',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'E1DDB72F-B4C2-41A8-B70F-FE7458429B78',
        name: 'Financiero',
        description: 'Documentación y requisitos financieros para la operación.',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'F131C4A2-9307-46B2-B24B-68ED1C5AA453',
        name: 'Operativo',
        description: 'Requerimientos operativos para la ejecución del servicio.',
        tenantId: UNSTABLE_TENANT_ID,
      },
    ],
  });

  //////////////////////////
  // Create requirements
  //////////////////////////
  let requirements = await prisma.requirement.createMany({
    data: [
      {
        id: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
        name: 'Contrato',
        description: 'Documento oficial que establece los términos de servicio entre el proveedor y el cliente.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
        name: 'RUC/Matricula',
        description: 'Registro Único de Contribuyente o Matrícula de comercio, necesario para la formalización de servicios comerciales.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'E1DDB72F-B4C2-41A8-B70F-FE7458429B78',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '35A79D65-CB2F-4B75-A692-CB6D4E8622E8',
        name: 'Descriptor del servicio',
        description: 'Descripción detallada del servicio ofrecido, excluyendo detalles de planes comerciales.',
        isRequiredOnlyOnce: false,
        requirementTypeId: '7E2E9795-A90D-4E27-8ABF-FCA3CE528212',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '11137CF3-23F5-4DF7-B72E-A213CEA696A7',
        name: 'Detalle de líneas en Excel',
        description: 'Se requiere un detalle completo de las líneas de servicio activas en formato Excel, incluyendo número, plan, y estado actual.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'F131C4A2-9307-46B2-B24B-68ED1C5AA453',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
        name: 'Carta de empresas hermanas o correo',
        description: 'Documentación que acredita la relación entre empresas hermanas o comunicación oficial relativa a la prestación de servicios.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '3B65DF2C-3101-437A-93A8-7809C91880AA',
        name: 'Memo firmado GC',
        description: 'Memorando firmado por la Gerencia Comercial en casos de excepciones a ofertas estándar, incluyendo planes, rentas, y otros.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
        name: 'Memo por excepción de política',
        description: 'Documento que justifica excepciones a la política estándar, como depósito, incremento limite de compra, documentos legales, entre otros.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '3220294F-7105-4EFA-A289-8C603D896B49',
        name: 'Documento de Identidad vigente',
        description: 'Identificación oficial vigente del titular del servicio, requerida para verificación legal y contractual.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'E8654751-52F5-4292-A6F5-C160A602928D',
        name: 'Acta/ Escritura de Constitucion de la Empresa',
        description: 'Documento legal que certifica la constitución de la empresa ante las autoridades correspondientes.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'B0F2D368-4997-47A9-B81E-FF320D263C4C',
        name: 'Hoja de Inscripción de escritura de constitución de la Empresa en el registro publico',
        description: 'Certificado de inscripción de la empresa en el registro público, necesario para la formalización y operación legal de la misma.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
        name: 'Poder de representación legal /publicación de nombramiento en la gaceta para ONG',
        description: 'Documento que acredita la representación legal de una persona o la publicación oficial de nombramiento para ONGs.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
        name: 'Cliente sin mora y CD',
        description: 'Verificación del estado de cuenta del cliente para asegurar que no existen moras y que cumple con los requisitos de crédito y deuda.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'E1DDB72F-B4C2-41A8-B70F-FE7458429B78',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
        name: 'Carta de solicitud del representante legal',
        description: 'Documento formal presentado por el representante legal solicitando algún servicio o acción específica.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
        name: 'OP',
        description: 'Orden de Pedido, documento formal que detalla la solicitud de compra de bienes o servicios.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'B9657AC0-33BE-40B0-BE6A-C06FE56E7CBF',
        name: 'Formato de compra a plazo (Equipos financiados)',
        description: 'Documento estándar que describe los términos y condiciones de una compra a plazo, especialmente para equipos financiados.',
        isRequiredOnlyOnce: false,
        requirementTypeId: '7E2E9795-A90D-4E27-8ABF-FCA3CE528212',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '8970A691-26CA-4893-A765-2D6CEA04BB54',
        name: 'Modificación contractual',
        description: 'Documento que registra cambios o modificaciones en un contrato existente.',
        isRequiredOnlyOnce: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'E1B2D4A5-7C5A-4F08-9B27-2D6E57F8C9F2',
        name: 'Comprobante de Ingresos',
        description: 'Documento que certifica los ingresos mensuales de una persona.',
        isRequiredOnlyOnce: true,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'F2C3A6E4-9B8A-49D3-B764-3E5F29D8B1C6',
        name: 'Recibo básico no mayor a 2 meses',
        description: 'Recibo reciente que certifique el uso de un servicio básico dentro de los últimos dos meses.',
        isRequiredOnlyOnce: true,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
    ],
  });

  //////////////////////////
  // Create sales channels
  //////////////////////////

  const { hierarchyId, hierarchyLevelparentCategoryId, hierarchyLevelServiceTypeId } = await createSalesChannelHierarchy();

  // Crear cada sales channel de manera individual
  let grandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Grandes Empresas',
      description: 'Ofrecido a Empresas, ONGs.',
      tenantId: UNSTABLE_TENANT_ID,
      isEligibleForNewClients: true,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelparentCategoryId,
      requestCategoryRequirement: {
        create: [
          { requirementId: 'E1B2D4A5-7C5A-4F08-9B27-2D6E57F8C9F2', tenantId: UNSTABLE_TENANT_ID },
          { requirementId: 'F2C3A6E4-9B8A-49D3-B764-3E5F29D8B1C6', tenantId: UNSTABLE_TENANT_ID },
        ],
      },
    },
  });

  let pymes = await prisma.requestCategory.create({
    data: {
      id: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Pymes',
      isEligibleForNewClients: true,
      description: 'Ofrecido a pequeñas y medianas empresas.',
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelparentCategoryId,
      requestCategoryRequirement: {
        create: [
          { requirementId: 'E1B2D4A5-7C5A-4F08-9B27-2D6E57F8C9F2', tenantId: UNSTABLE_TENANT_ID },
          { requirementId: 'F2C3A6E4-9B8A-49D3-B764-3E5F29D8B1C6', tenantId: UNSTABLE_TENANT_ID },
        ],
      },
    },
  });

  let gobierno = await prisma.requestCategory.create({
    data: {
      id: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Gobierno',
      description: 'Ventas realizadas a través de la página web.',
      tenantId: UNSTABLE_TENANT_ID,
      isEligibleForNewClients: true,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelparentCategoryId,
      requestCategoryRequirement: {
        create: [
          { requirementId: 'E1B2D4A5-7C5A-4F08-9B27-2D6E57F8C9F2', tenantId: UNSTABLE_TENANT_ID },
          { requirementId: 'F2C3A6E4-9B8A-49D3-B764-3E5F29D8B1C6', tenantId: UNSTABLE_TENANT_ID },
        ],
      },
    },
  });

  let mayoristas = await prisma.requestCategory.create({
    data: {
      id: '6E472E4B-C06A-40AB-AB2D-D6715D0F1599',
      name: 'Mayoristas',
      description: 'Ventas realizadas a través de subdistribuidores y distribuidores.',
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelparentCategoryId,
      requestCategoryRequirement: {
        create: [
          { requirementId: 'E1B2D4A5-7C5A-4F08-9B27-2D6E57F8C9F2', tenantId: UNSTABLE_TENANT_ID },
          { requirementId: 'F2C3A6E4-9B8A-49D3-B764-3E5F29D8B1C6', tenantId: UNSTABLE_TENANT_ID },
        ],
      },
    },
  });

  //////////////////////////
  // Service types Grandes Empresas
  //////////////////////////
  const RonavacionGrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: 'D0476505-DF26-4295-8B8F-1DB96492635A',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Renovación',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const CambioPlanGrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: 'CD61EB0E-D297-4F94-9346-9636751ADB52',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Cambio de plan',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: false,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const DespachoEquiposGrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: '983B9DA5-C323-49FB-9C64-794504F180C1',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Despacho de Equipos',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: false,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'B9657AC0-33BE-40B0-BE6A-C06FE56E7CBF',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const ActivacionLineasPospagoGrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: '94529F80-7519-472A-9C4C-E2B38D83C175',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Activación de lineas Pospagos',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: false,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const AdicionLineasPospagoGrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: '241FD5CD-131F-43C0-B239-A62EB8C7CA6F',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Adición de lineas pospagos',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: false,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const Internet1615GrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: '03E03558-0ED2-43AF-8037-77258E806802',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Internet 1615',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const InternetGponGrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: 'B01A3A8C-BA8D-4888-BC0E-F27570335DA2',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Internet Gpon',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const TVGrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: '0A193625-D7CE-4F87-8AFA-C2035D577949',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'TV',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const LineaBasicaGrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: '0AA39BC6-2C94-4FFC-8C9B-29E20417364E',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Linea Basica',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const InternetGrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: '83BC7839-704A-4965-9D58-5E5DDA1F6B51',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Internet',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const CesiónDerechoGrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: '8D438EAA-BDDC-4034-BA52-C269BB449B9F',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Cesión de Derecho',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const CambioRazonSocialGrandesEmpresas = await prisma.requestCategory.create({
    data: {
      id: '4DEF976D-EEC6-4CFF-B369-34253BA27215',
      parentCategoryId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Cambio de razón social',
      description: 'Ofrecido a Empresas, ONGs.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  //////////////////////////
  // Service types Pymes
  //////////////////////////
  const RenovacionPymes = await prisma.requestCategory.create({
    data: {
      id: '6A4A2234-256C-4494-978D-E61C99351467',
      parentCategoryId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Renovación',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const CambioPlanPymes = await prisma.requestCategory.create({
    data: {
      id: 'F0E7128E-A0CB-4617-BC62-628D720E2D5F',
      parentCategoryId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Cambio de plan',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const DespachoEquiposPymes = await prisma.requestCategory.create({
    data: {
      id: 'C50FB7AC-78D8-4780-A6D4-1B96F9AF1861',
      parentCategoryId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Despacho de Equipos',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'B9657AC0-33BE-40B0-BE6A-C06FE56E7CBF',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const ActivacionLineasPospagoPymes = await prisma.requestCategory.create({
    data: {
      id: '71FEAB5A-05A3-4DC4-A12C-8512A4EF89C2',
      parentCategoryId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Activación de lineas Pospagos',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const Internet1615Pymes = await prisma.requestCategory.create({
    data: {
      id: 'B74652EB-9456-4D66-9895-9BD77E6C3E55',
      parentCategoryId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Internet 1615',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const InternetGponPymes = await prisma.requestCategory.create({
    data: {
      id: '521929C1-F029-48A1-91FC-D67CBFEE47F4',
      parentCategoryId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Internet Gpon',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const TVPymes = await prisma.requestCategory.create({
    data: {
      id: '18768DD2-5EEE-47BF-942C-8F4BEE39EBF1',
      parentCategoryId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'TV',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const LineaBasicaPymes = await prisma.requestCategory.create({
    data: {
      id: '0FBD66FD-0C13-49E6-A498-EB162C56DE71',
      parentCategoryId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Linea Basica',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const InternetPymes = await prisma.requestCategory.create({
    data: {
      id: '7EC04EB1-3954-46C9-9ECF-E5DFEB02B03F',
      parentCategoryId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Internet',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const CesiónDerechoPymes = await prisma.requestCategory.create({
    data: {
      id: '0A758B23-4ECC-4170-9C31-73058DDBA544',
      parentCategoryId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Cesión de Derecho',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'B9657AC0-33BE-40B0-BE6A-C06FE56E7CBF',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const CambioRazonSocialPymes = await prisma.requestCategory.create({
    data: {
      id: '057DCBAE-4184-43B2-9980-77DCE3F9F2A8',
      parentCategoryId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Cambio de razón social',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  //////////////////////////
  // Service types Gobierno
  //////////////////////////
  const RenovacionGobierno = await prisma.requestCategory.create({
    data: {
      id: '09527C48-CEC7-4FE2-927C-19BFB5E60210',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Renovación',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const CambioPlanGobierno = await prisma.requestCategory.create({
    data: {
      id: '123C7C6C-6DF0-49D2-ACC9-2774EDC5551C',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Cambio de plan',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const DespachoEquiposGobierno = await prisma.requestCategory.create({
    data: {
      id: '4954EE72-AE04-4B30-B342-653F635FB182',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Despacho de Equipos',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'B9657AC0-33BE-40B0-BE6A-C06FE56E7CBF',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const ActivacionLineasPospagoGobierno = await prisma.requestCategory.create({
    data: {
      id: '90B0195E-CADF-4D3D-9EAF-1558AF1A3047',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Activación de lineas Pospagos',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const AdicionLineasPospagosGobierno = await prisma.requestCategory.create({
    data: {
      id: 'ED2D802C-57D2-422C-9A9B-F472A8102ADD',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Adición de lineas pospagos',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const Internet1615Gobierno = await prisma.requestCategory.create({
    data: {
      id: '57E6C79B-8E32-42EF-AF4F-DD2D79410B0F',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Internet 1615',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const InternetGponGobierno = await prisma.requestCategory.create({
    data: {
      id: '2C513C16-2070-47A5-A3A7-12619E1265B9',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Internet Gpon',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const TVGobierno = await prisma.requestCategory.create({
    data: {
      id: 'C870D269-25A8-4AF3-B3D4-782A6EA296E4',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'TV',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const LineaBasicaGobierno = await prisma.requestCategory.create({
    data: {
      id: 'D2189CDA-0B66-44BF-BED9-84CFFE34D36D',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Linea Basica',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const InternetGobierno = await prisma.requestCategory.create({
    data: {
      id: '6171B46E-EBD0-4232-9BFB-DC549EAC4203',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Internet',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const CesiónDerechoGobierno = await prisma.requestCategory.create({
    data: {
      id: '6FABDCFB-2C23-4BB5-9A13-FEDE912B7874',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Cesión de Derecho',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'B9657AC0-33BE-40B0-BE6A-C06FE56E7CBF',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });

  const CambioRazonSocialGobierno = await prisma.requestCategory.create({
    data: {
      id: 'B2164B28-A492-4AC1-9749-ACFC08F51584',
      parentCategoryId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Cambio de razón social',
      description: 'Ofrecido a entidades gubernamentales.',
      isEligibleForNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId,
      hierarchyLevelId: hierarchyLevelServiceTypeId,
      requestCategoryRequirement: {
        create: [
          {
            requirementId: '93D0BF8B-D813-4D12-A2C9-00A8D01E91EA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3220294F-7105-4EFA-A289-8C603D896B49',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '3B65DF2C-3101-437A-93A8-7809C91880AA',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'E8654751-52F5-4292-A6F5-C160A602928D',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
            tenantId: UNSTABLE_TENANT_ID,
          },
          {
            requirementId: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
            tenantId: UNSTABLE_TENANT_ID,
          },
        ],
      },
    },
  });
}

async function createModuleAndFeature() {
  for (const [, applicationModule] of Object.entries(PrismaModules)) {
    await prisma.module.create({
      data: {
        name: applicationModule.name.es,
        description: applicationModule.description.es,
        tenantId: UNSTABLE_TENANT_ID,
        feature: {
          create: Object.entries(applicationModule.features).map(([, feature]) => ({
            name: feature.name.es,
            key: feature.action,
            description: feature.description.es,
            scope: feature.scope,
            tenantId: UNSTABLE_TENANT_ID,
          })),
        },
      },
    });
  }
}

async function createAreas(hierarchyId: string, hierarchyLevelRequestTypeId: string, hierarchyLevelCategoryId: string, hierarchyLevelSubcategoryId: string) {
  // Comisiones Internas
  await createInternalCommissionsArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Comisiones
  await createCommissionsArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Activaciones
  await createActivacionArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Creditos
  await createCreditosArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Compras
  await createComprasArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Cobranza
  await createCobranzaArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // CIA
  await createCIAArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Aprobados Credito Mesa Control
  await createAprobadosCreditoMesaControlArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Facturacion
  await createFacturacionArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Multipagos Reactivacion
  await createMultipagosReactivacionArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Resuelva Reactivacion
  await createResuelvaReactivacionArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Edatel Reactivacion
  await createEdatelReactivacionArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Invercobro Reactivacion
  await createInvercobroReactivacionArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Gextiona Reactivacion
  await createGextionaReactivacionArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Serdico Reactivacion
  await createSerdicoReactivacionArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Reactivacion
  await createReactivacionArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Recuperacion Equipos
  await createRecuperacionEquiposArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Traslados De Equipos
  await createTrasladosDeEquiposArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Procesamiento Equipos
  await createProcesamientoEquiposArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Facturacion Deudores Varios
  await createFacturacionDeudoresVariosArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);

  // Area Tecnica
  await createAreaTecnicaArea(prisma, hierarchyId, hierarchyLevelRequestTypeId, hierarchyLevelCategoryId, hierarchyLevelSubcategoryId);
}

async function createAreaHierarchy() {
  const hierarchy = await prisma.assignmentHierarchy.create({
    data: {
      name: 'Gestión de solicitudes',
      description: 'Jerarquía de gestión de los tipos, categorías y subcategorías de solicitudes',
      tenantId: UNSTABLE_TENANT_ID,
    },
  });

  const hierarchyLevelRequestType = await prisma.assignmentHierarchyLevel.create({
    data: {
      name: 'Tipo de Solicitud',
      position: 1,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId: hierarchy.id,
    },
  });

  const hierarchyLevelCategory = await prisma.assignmentHierarchyLevel.create({
    data: {
      name: 'Categoria',
      position: 2,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId: hierarchy.id,
    },
  });

  const hierarchyLevelSubcategory = await prisma.assignmentHierarchyLevel.create({
    data: {
      name: 'Subcategoria',
      position: 3,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId: hierarchy.id,
    },
  });

  return {
    hierarchyId: hierarchy.id,
    hierarchyLevelRequestTypeId: hierarchyLevelRequestType.id,
    hierarchyLevelCategoryId: hierarchyLevelCategory.id,
    hierarchyLevelSubcategoryId: hierarchyLevelSubcategory.id,
  };
}

async function createSalesChannelHierarchy() {
  const hierarchy = await prisma.requestHierarchy.create({
    data: {
      name: 'Relación Canales-Servicios',
      description: 'Organización de los canales de venta y sus tipos de servicio',
      tenantId: UNSTABLE_TENANT_ID,
    },
  });

  const hierarchyLevelSalesChannel = await prisma.requestHierarchyLevel.create({
    data: {
      name: 'Canal de Venta',
      position: 1,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId: hierarchy.id,
    },
  });

  const hierarchyLevelServiceType = await prisma.requestHierarchyLevel.create({
    data: {
      name: 'Tipo de Servicio',
      position: 2,
      tenantId: UNSTABLE_TENANT_ID,
      hierarchyId: hierarchy.id,
    },
  });

  return {
    hierarchyId: hierarchy.id,
    hierarchyLevelparentCategoryId: hierarchyLevelSalesChannel.id,
    hierarchyLevelServiceTypeId: hierarchyLevelServiceType.id,
  };
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
