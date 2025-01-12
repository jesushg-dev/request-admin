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
import { UNSTABLE_TENANT_ID } from './util';

const prisma = new PrismaClient();

async function main() {
  //////////////////////////
  // Create Tenant
  //////////////////////////

  const tenant = await prisma.tenant.create({
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
          tenantId: UNSTABLE_TENANT_ID,
          isActive: true,
          joinedAt: new Date(),
          isSuperAdmin: true,
        },
      },
    },
  });

  await prisma.person.create({
    data: {
      id: '7B159275-47A7-4957-9419-4ABBAED5B8AD',
      firstName: 'Jesus',
      lastName: 'Hernandez',
      email: 'jesus.hernandez@gmail.com',
      phone: '89898989',
      identificationNumber: '134-123456-0000A',
      identificationTypeId: dnIdentificationType.id,
      tenantId: UNSTABLE_TENANT_ID,
      userId: user.id,
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
        },
      },
    },
  });

  await prisma.person.create({
    data: {
      id: 'FB420CF8-8820-4FB7-9FE5-BFE7B2F83894',
      firstName: 'Danilo',
      lastName: 'Acevedo',
      email: 'Danico.Acevedo@gmail.com',
      phone: '12345678',
      identificationNumber: '254-555456-0000A',
      identificationTypeId: dnIdentificationType.id,
      tenantId: UNSTABLE_TENANT_ID,
      userId: secondUser.id,
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
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
        name: 'RUC/Matricula',
        description: 'Registro Único de Contribuyente o Matrícula de comercio, necesario para la formalización de servicios comerciales.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'E1DDB72F-B4C2-41A8-B70F-FE7458429B78',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '35A79D65-CB2F-4B75-A692-CB6D4E8622E8',
        name: 'Descriptor del servicio',
        description: 'Descripción detallada del servicio ofrecido, excluyendo detalles de planes comerciales.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: '7E2E9795-A90D-4E27-8ABF-FCA3CE528212',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '11137CF3-23F5-4DF7-B72E-A213CEA696A7',
        name: 'Detalle de líneas en Excel',
        description: 'Se requiere un detalle completo de las líneas de servicio activas en formato Excel, incluyendo número, plan, y estado actual.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'F131C4A2-9307-46B2-B24B-68ED1C5AA453',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
        name: 'Carta de empresas hermanas o correo',
        description: 'Documentación que acredita la relación entre empresas hermanas o comunicación oficial relativa a la prestación de servicios.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '3B65DF2C-3101-437A-93A8-7809C91880AA',
        name: 'Memo firmado GC',
        description: 'Memorando firmado por la Gerencia Comercial en casos de excepciones a ofertas estándar, incluyendo planes, rentas, y otros.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
        name: 'Memo por excepción de política',
        description: 'Documento que justifica excepciones a la política estándar, como depósito, incremento limite de compra, documentos legales, entre otros.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '3220294F-7105-4EFA-A289-8C603D896B49',
        name: 'Documento de Identidad vigente',
        description: 'Identificación oficial vigente del titular del servicio, requerida para verificación legal y contractual.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'E8654751-52F5-4292-A6F5-C160A602928D',
        name: 'Acta/ Escritura de Constitucion de la Empresa',
        description: 'Documento legal que certifica la constitución de la empresa ante las autoridades correspondientes.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'B0F2D368-4997-47A9-B81E-FF320D263C4C',
        name: 'Hoja de Inscripción de escritura de constitución de la Empresa en el registro publico',
        description: 'Certificado de inscripción de la empresa en el registro público, necesario para la formalización y operación legal de la misma.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
        name: 'Poder de representación legal /publicación de nombramiento en la gaceta para ONG',
        description: 'Documento que acredita la representación legal de una persona o la publicación oficial de nombramiento para ONGs.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
        name: 'Cliente sin mora y CD',
        description: 'Verificación del estado de cuenta del cliente para asegurar que no existen moras y que cumple con los requisitos de crédito y deuda.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'E1DDB72F-B4C2-41A8-B70F-FE7458429B78',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
        name: 'Carta de solicitud del representante legal',
        description: 'Documento formal presentado por el representante legal solicitando algún servicio o acción específica.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
        name: 'OP',
        description: 'Orden de Pedido, documento formal que detalla la solicitud de compra de bienes o servicios.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'B9657AC0-33BE-40B0-BE6A-C06FE56E7CBF',
        name: 'Formato de compra a plazo (Equipos financiados)',
        description: 'Documento estándar que describe los términos y condiciones de una compra a plazo, especialmente para equipos financiados.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: '7E2E9795-A90D-4E27-8ABF-FCA3CE528212',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '8970A691-26CA-4893-A765-2D6CEA04BB54',
        name: 'Modificación contractual',
        description: 'Documento que registra cambios o modificaciones en un contrato existente.',
        isRequiredOnlyForNewClients: false,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'E1B2D4A5-7C5A-4F08-9B27-2D6E57F8C9F2',
        name: 'Comprobante de Ingresos',
        description: 'Documento que certifica los ingresos mensuales de una persona.',
        isRequiredOnlyForNewClients: true,
        requirementTypeId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'F2C3A6E4-9B8A-49D3-B764-3E5F29D8B1C6',
        name: 'Recibo básico no mayor a 2 meses',
        description: 'Recibo reciente que certifique el uso de un servicio básico dentro de los últimos dos meses.',
        isRequiredOnlyForNewClients: true,
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
  await prisma.module.create({
    data: {
      id: '8086ec48-a74e-4ab8-a890-07534d1d57bd', // Module ID
      tenantId: UNSTABLE_TENANT_ID,
      name: 'Gestión de Solicitudes',
      description: 'Módulo para gestionar todo el ciclo de vida de las solicitudes, desde su creación hasta la asignación y seguimiento',
      feature: {
        create: [
          // Global features
          {
            id: 'afffef09-71e5-4682-ba96-fd0e65323ba1', // Create Feature
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Crear',
            key: 'request_create', // Code-friendly key
            description: 'Permiso para crear nuevas solicitudes en el sistema',
            scope: 'global',
          },
          {
            id: 'e938dcfb-07ff-4e57-82c4-abe4326d23dc', // View Feature
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Ver',
            key: 'request_view', // Code-friendly key
            description: 'Permiso para consultar las solicitudes registradas en el sistema',
            scope: 'global',
          },
          {
            id: 'eeb3aaad-bb2e-40e5-a9c5-5473fd1e66bf', // Edit Feature
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Editar',
            key: 'request_edit', // Code-friendly key
            description: 'Permiso para modificar datos o información de las solicitudes existentes',
            scope: 'global',
          },
          {
            id: '00b039bd-6a9e-46ce-945d-6bcf91982e88', // Disable Feature
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Inhabilitar',
            key: 'request_disable', // Code-friendly key
            description: 'Permiso para inhabilitar solicitudes existentes en el sistema',
            scope: 'global',
          },
          // Area-specific features
          {
            id: '157f5216-866b-41ce-8da1-f4491d774d6c', // Assign User Feature
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Asignar',
            key: 'request_assign_user', // Code-friendly key
            description: 'Permiso para asignar responsables a solicitudes dentro de un área específica',
            scope: 'area',
          },
          {
            id: '93a77660-56e6-4d46-8c81-b75dfb62847c', // Set Priority Feature
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Establecer prioridad',
            key: 'request_set_priority', // Code-friendly key
            description: 'Permiso para definir la prioridad de las solicitudes dentro de un área',
            scope: 'area',
          },
          {
            id: '94f0fe04-0ea8-4e6a-afc9-ac8ff6a766af', // Send Documents Feature
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Enviar documentos',
            key: 'request_send_documents', // Code-friendly key
            description: 'Permiso para subir o enviar documentos relacionados a solicitudes dentro de un área específica',
            scope: 'area',
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      id: 'e6477158-c08a-4c5d-b5b4-e9aae79f536f', // Module ID (Form Designer)
      tenantId: UNSTABLE_TENANT_ID,
      name: 'Diseñador de Formularios',
      description: 'Módulo para diseñar, gestionar y publicar formularios personalizados',
      feature: {
        create: [
          {
            id: 'c9d0b87a-2c32-45b1-a86a-da8f79e9af3d', // Create Form
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Crear',
            key: 'form_create', // Code-friendly key
            description: 'Permiso para crear nuevos formularios personalizados',
            scope: 'global',
          },
          {
            id: 'e54ad210-5510-47e7-9012-60dcf0dc0bb4', // View Form
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Ver',
            key: 'form_view', // Code-friendly key
            description: 'Permiso para consultar formularios existentes',
            scope: 'global',
          },
          {
            id: '6929ae3d-a6fa-409f-8d4b-37e6b5d7d712', // Edit Form
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Editar',
            key: 'form_edit', // Code-friendly key
            description: 'Permiso para modificar formularios existentes',
            scope: 'global',
          },
          {
            id: '0b196979-ff06-4b75-bd7a-4841f6a9873a', // Delete Form
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Eliminar',
            key: 'form_delete', // Code-friendly key
            description: 'Permiso para eliminar formularios existentes',
            scope: 'global',
          },
          {
            id: '7180295a-da49-403b-babf-ed2b9d8b7ce9', // Publish Form
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Publicar',
            key: 'form_publish', // Code-friendly key
            description: 'Permiso para publicar formularios y ponerlos en producción',
            scope: 'global',
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      id: '4fb18f3a-b911-4eec-92ea-018af5ec03ca', // Module ID (Requirement Type)
      tenantId: UNSTABLE_TENANT_ID,
      name: 'Tipos de Requerimientos',
      description: 'Módulo para gestionar los diferentes tipos de requerimientos del sistema',
      feature: {
        create: [
          {
            id: 'dc695619-ba2c-4872-9c19-796a654e4793', // Create Requirement Type
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Crear',
            key: 'requirement_type_create', // Code-friendly key
            description: 'Permiso para crear nuevos tipos de requerimientos',
            scope: 'global',
          },
          {
            id: 'a951dfda-f911-4a4a-87f5-987788088f45', // View Requirement Type
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Ver',
            key: 'requirement_type_view', // Code-friendly key
            description: 'Permiso para consultar los tipos de requerimientos existentes',
            scope: 'global',
          },
          {
            id: '92dca8ee-35be-4724-8a05-8bf634ea3542', // Edit Requirement Type
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Editar',
            key: 'requirement_type_edit', // Code-friendly key
            description: 'Permiso para modificar los tipos de requerimientos existentes',
            scope: 'global',
          },
          {
            id: '176464a9-01b6-4c36-8358-7f49c8040dfa', // Delete Requirement Type
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Eliminar',
            key: 'requirement_type_delete', // Code-friendly key
            description: 'Permiso para eliminar tipos de requerimientos existentes',
            scope: 'global',
          },
          {
            id: '672fb7a1-de12-4c87-98d5-12b6eb450f73', // Activate Requirement Type
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Activar',
            key: 'requirement_type_activate', // Code-friendly key
            description: 'Permiso para activar o desactivar tipos de requerimientos',
            scope: 'global',
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      id: 'e7b6bb57-72fa-4407-857a-f37d220da0ab', // Module ID (Requirement)
      tenantId: UNSTABLE_TENANT_ID,
      name: 'Requerimientos',
      description: 'Módulo para gestionar los requerimientos del sistema, incluyendo su creación, asignación y cierre',
      feature: {
        create: [
          {
            id: 'a40ad849-7d9e-4ad9-af7a-dda394e463ad', // Create Requirement
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Crear',
            key: 'requirement_create', // Code-friendly key
            description: 'Permiso para crear nuevos requerimientos en el sistema',
            scope: 'global',
          },
          {
            id: '0d5b71eb-8de7-4b7b-b65e-091b67588375', // View Requirement
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Ver',
            key: 'requirement_view', // Code-friendly key
            description: 'Permiso para consultar los requerimientos existentes',
            scope: 'global',
          },
          {
            id: '1f10a52f-a969-42ea-8f92-ddf610d01820', // Edit Requirement
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Editar',
            key: 'requirement_edit', // Code-friendly key
            description: 'Permiso para modificar los requerimientos existentes',
            scope: 'global',
          },
          {
            id: 'd2942f7a-7470-4012-8732-e98ae3eda6f2', // Delete Requirement
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Eliminar',
            key: 'requirement_delete', // Code-friendly key
            description: 'Permiso para eliminar requerimientos existentes',
            scope: 'global',
          },
          {
            id: '93ed81a5-dba7-499b-9876-1369ed10746a', // Assign Requirement
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Asignar',
            key: 'requirement_assign', // Code-friendly key
            description: 'Permiso para asignar responsables a un requerimiento',
            scope: 'area',
          },
          {
            id: '502c481b-8d4d-4778-9691-2d78f06ec0b5', // Close Requirement
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Cerrar',
            key: 'requirement_close', // Code-friendly key
            description: 'Permiso para cerrar requerimientos una vez resueltos',
            scope: 'area',
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      id: '6a894ced-bde2-49be-83ba-bb673a7fff29', // Module ID (Request Type)
      tenantId: UNSTABLE_TENANT_ID,
      name: 'Tipos de Solicitud',
      description: 'Módulo para gestionar los diferentes tipos de solicitudes que pueden ser creadas en el sistema',
      feature: {
        create: [
          {
            id: '02ab78ff-9a82-42ed-b06b-082dbb141dc2', // Create Request Type
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Crear',
            key: 'request_type_create', // Code-friendly key
            description: 'Permiso para crear nuevos tipos de solicitud',
            scope: 'global',
          },
          {
            id: '56d5c597-2623-4cdb-a63c-5ee5d7f0b9fe', // View Request Type
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Ver',
            key: 'request_type_view', // Code-friendly key
            description: 'Permiso para consultar los tipos de solicitud existentes',
            scope: 'global',
          },
          {
            id: 'c6d1e40d-815f-4488-b229-bfd3e395f48d', // Edit Request Type
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Editar',
            key: 'request_type_edit', // Code-friendly key
            description: 'Permiso para modificar los tipos de solicitud existentes',
            scope: 'global',
          },
          {
            id: 'c0ac2673-360d-47a8-a4f3-be2682a3a908', // Delete Request Type
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Eliminar',
            key: 'request_type_delete', // Code-friendly key
            description: 'Permiso para eliminar tipos de solicitud existentes',
            scope: 'global',
          },
          {
            id: '9495dcf6-e650-45b9-b076-b0ae328486c8', // Activate Request Type
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Activar',
            key: 'request_type_activate', // Code-friendly key
            description: 'Permiso para activar o desactivar tipos de solicitud',
            scope: 'global',
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      id: '8f37a9ef-c6b9-46e3-bdcd-d330d5cc60bd', // Module ID (Client)
      tenantId: UNSTABLE_TENANT_ID,
      name: 'Cliente',
      description: 'Módulo para gestionar la información de clientes y sus asignaciones',
      feature: {
        create: [
          {
            id: '5bd5010f-1e6a-48ef-a143-8b41bfec59b9', // Create Client
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Crear',
            key: 'client_create', // Code-friendly key
            description: 'Permiso para crear nuevos clientes en el sistema',
            scope: 'global',
          },
          {
            id: '16fe680d-3cec-41a6-852c-5535fae52d1a', // View Client
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Ver',
            key: 'client_view', // Code-friendly key
            description: 'Permiso para consultar la información de clientes',
            scope: 'global',
          },
          {
            id: '1da41b66-b2b2-4921-8dfa-759374b2de38', // Edit Client
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Editar',
            key: 'client_edit', // Code-friendly key
            description: 'Permiso para modificar la información de clientes existentes',
            scope: 'global',
          },
          {
            id: '1a59ef85-c60d-424c-a90c-483f4961736d', // Delete Client
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Eliminar',
            key: 'client_delete', // Code-friendly key
            description: 'Permiso para eliminar clientes existentes del sistema',
            scope: 'global',
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      id: 'a99a1e1c-6594-4d9b-ae9f-65ae28def79b', // Module ID (Area)
      tenantId: UNSTABLE_TENANT_ID,
      name: 'Áreas',
      description: 'Módulo para gestionar las diferentes áreas dentro del sistema',
      feature: {
        create: [
          {
            id: '1c9c8b7c-d3bb-4c13-bba9-69ed33e7652e', // Create Area
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Crear',
            key: 'area_create', // Code-friendly key
            description: 'Permiso para crear nuevas áreas en el sistema',
            scope: 'global',
          },
          {
            id: '2375ab1b-4c50-46bb-a7e7-74c3c97b53e1', // View Area
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Ver',
            key: 'area_view', // Code-friendly key
            description: 'Permiso para consultar las áreas existentes',
            scope: 'global',
          },
          {
            id: 'c6cc8b8a-5215-4efc-b853-b83cd6968f81', // Edit Area
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Editar',
            key: 'area_edit', // Code-friendly key
            description: 'Permiso para modificar las áreas existentes',
            scope: 'global',
          },
          {
            id: 'f8070042-171c-4ca5-9a06-1d634d5318b7', // Delete Area
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Eliminar',
            key: 'area_delete', // Code-friendly key
            description: 'Permiso para eliminar áreas existentes del sistema',
            scope: 'global',
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      id: '70adb6bf-8178-48bf-bc90-f9c77e59ccf6', // Module ID (User Management)
      tenantId: UNSTABLE_TENANT_ID,
      name: 'Gestión de Usuarios',
      description: 'Módulo para gestionar usuarios y sus asignaciones de roles',
      feature: {
        create: [
          {
            id: '25be11e1-db3b-4eaa-8272-7f6fbb5fc4e3', // Create User
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Crear',
            key: 'user_create', // Code-friendly key
            description: 'Permiso para crear nuevos usuarios en el sistema',
            scope: 'global',
          },
          {
            id: 'ab4b9a35-dfe5-4cc2-a78a-6f48005a270c', // View User
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Ver',
            key: 'user_view', // Code-friendly key
            description: 'Permiso para consultar usuarios existentes',
            scope: 'global',
          },
          {
            id: '280bb2e6-bc57-4b19-a75d-5a3306aec126', // Edit User
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Editar',
            key: 'user_edit', // Code-friendly key
            description: 'Permiso para modificar la información de usuarios existentes',
            scope: 'global',
          },
          {
            id: 'd45df009-5576-4823-80dd-3fc85fb9b306', // Delete User
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Eliminar',
            key: 'user_delete', // Code-friendly key
            description: 'Permiso para eliminar usuarios del sistema',
            scope: 'global',
          },
        ],
      },
    },
  });

  await prisma.module.create({
    data: {
      id: '53b056d6-5739-4a97-b62b-1aa16921347c', // Module ID (Role Management)
      tenantId: UNSTABLE_TENANT_ID,
      name: 'Gestión de Roles',
      description: 'Módulo para gestionar roles y asignaciones de roles',
      feature: {
        create: [
          {
            id: '53b056d6-5739-4a97-b62b-1aa16921347c', // Create Role
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Crear',
            key: 'role_create', // Code-friendly key
            description: 'Permiso para crear nuevos roles en el sistema',
            scope: 'global',
          },
          {
            id: '5d73ff4b-1735-42d8-ac6b-ccb45d6a343e', // Assign Role
            tenantId: UNSTABLE_TENANT_ID,
            name: 'Asignar',
            key: 'role_assign', // Code-friendly key
            description: 'Permiso para asignar roles a usuarios',
            scope: 'global',
          },
        ],
      },
    },
  });
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
