import { UNSTABLE_TENANT_ID } from '@/lib/constant';
import { hashPassword } from '@/lib/password';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  //////////////////////////
  // Create Tenant
  //////////////////////////

  await prisma.tenant.create({
    data: {
      id: '2DA1FC13-1F87-4A5D-A64C-05823686A111',
      name: 'Claro',
      logoUrl: 'https://1000marcas.net/wp-content/uploads/2021/02/Claro-Logo.png',
      websiteUrl: 'https://www.claro.com.ni',
      title: 'Claro',
      description: 'Claro es una empresa de telecomunicaciones que opera en 18 países de América Latina.',
      primaryColor: '#FF0000',
      secondaryColor: '#FFFFFF',
    },
  });

  //////////////////////////
  // Create users
  //////////////////////////
  await prisma.user.create({
    data: {
      id: '51C9BBA8-6C86-4E6C-8FE2-E98BB42A07F8',
      name: 'Jesus Hernandez',
      email: 'jesus.hernandez@claro.com',
      password: await hashPassword('Lamisma123*'),
      superAdmin: true,
      //userName: 'jesus.hernandez',
    },
  });

  //////////////////////////
  // Create Identification Types
  //////////////////////////
  await prisma.identificationType.createMany({
    data: [
      {
        id: 'FF463BE7-CE18-4923-986E-BAD58A547177',
        name: 'Cedula',
        description: 'Cedula de identidad.',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'EBFB6FA0-BA18-4DF4-B925-12659A259957',
        name: 'Pasaporte',
        description: 'Pasaporte de identidad.',
        tenantId: UNSTABLE_TENANT_ID,
      },
    ],
  });

  //////////////////////////
  // Create Clients
  //////////////////////////
  await prisma.client.createMany({
    data: [
      {
        id: '7B159275-47A7-4957-9419-4ABBAED5B8AD',
        name: 'Jesus Hernandez',
        email: 'jesus.hernandez@gmail.com',
        identificationNumber: '134-123456-0000A',
        phone: '123',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'FB420CF8-8820-4FB7-9FE5-BFE7B2F83894',
        name: 'Danilo Acevedo',
        email: 'Danico.Acevedo@gmail.com',
        identificationNumber: '254-555456-0000A',
        tenantId: UNSTABLE_TENANT_ID,
      },
    ],
  });

  //////////////////////////
  // Create areas
  //        Request Types
  //                Categories
  //                        Subcategories
  //////////////////////////
  await createAreas();

  //////////////////////////
  // Create requirements categories
  //////////////////////////
  let requirementsCategories = await prisma.categoryRequirement.createMany({
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
        onlyRequireInNewClients: false,
        categoryRequirementId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'F379F551-75D1-4712-8D6A-2B8C06CF97F0',
        name: 'RUC/Matricula',
        description: 'Registro Único de Contribuyente o Matrícula de comercio, necesario para la formalización de servicios comerciales.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'E1DDB72F-B4C2-41A8-B70F-FE7458429B78',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '35A79D65-CB2F-4B75-A692-CB6D4E8622E8',
        name: 'Descriptor del servicio',
        description: 'Descripción detallada del servicio ofrecido, excluyendo detalles de planes comerciales.',
        onlyRequireInNewClients: false,
        categoryRequirementId: '7E2E9795-A90D-4E27-8ABF-FCA3CE528212',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '11137CF3-23F5-4DF7-B72E-A213CEA696A7',
        name: 'Detalle de líneas en Excel',
        description: 'Se requiere un detalle completo de las líneas de servicio activas en formato Excel, incluyendo número, plan, y estado actual.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'F131C4A2-9307-46B2-B24B-68ED1C5AA453',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '1F5D02DB-17AC-4C8D-B7B7-47847381D78D',
        name: 'Carta de empresas hermanas o correo',
        description: 'Documentación que acredita la relación entre empresas hermanas o comunicación oficial relativa a la prestación de servicios.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '3B65DF2C-3101-437A-93A8-7809C91880AA',
        name: 'Memo firmado GC',
        description: 'Memorando firmado por la Gerencia Comercial en casos de excepciones a ofertas estándar, incluyendo planes, rentas, y otros.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'E1B15EF5-2A40-4464-8877-F5D99939ABE6',
        name: 'Memo por excepción de política',
        description: 'Documento que justifica excepciones a la política estándar, como depósito, incremento limite de compra, documentos legales, entre otros.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '3220294F-7105-4EFA-A289-8C603D896B49',
        name: 'Documento de Identidad vigente',
        description: 'Identificación oficial vigente del titular del servicio, requerida para verificación legal y contractual.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'E8654751-52F5-4292-A6F5-C160A602928D',
        name: 'Acta/ Escritura de Constitucion de la Empresa',
        description: 'Documento legal que certifica la constitución de la empresa ante las autoridades correspondientes.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'B0F2D368-4997-47A9-B81E-FF320D263C4C',
        name: 'Hoja de Inscripción de escritura de constitución de la Empresa en el registro publico',
        description: 'Certificado de inscripción de la empresa en el registro público, necesario para la formalización y operación legal de la misma.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'D4F1F61C-4988-4E0E-8FC1-7810A0A9B55B',
        name: 'Poder de representación legal /publicación de nombramiento en la gaceta para ONG',
        description: 'Documento que acredita la representación legal de una persona o la publicación oficial de nombramiento para ONGs.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '384D4D94-1BED-4A47-8F4C-63A6E8C5BD5F',
        name: 'Cliente sin mora y CD',
        description: 'Verificación del estado de cuenta del cliente para asegurar que no existen moras y que cumple con los requisitos de crédito y deuda.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'E1DDB72F-B4C2-41A8-B70F-FE7458429B78',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'BF20B80C-FB60-4C7F-973D-AA2FD2E898CE',
        name: 'Carta de solicitud del representante legal',
        description: 'Documento formal presentado por el representante legal solicitando algún servicio o acción específica.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'C64857FF-55C3-4E51-ABBA-5D3F6187D0CD',
        name: 'OP',
        description: 'Orden de Pedido, documento formal que detalla la solicitud de compra de bienes o servicios.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: 'B9657AC0-33BE-40B0-BE6A-C06FE56E7CBF',
        name: 'Formato de compra a plazo (Equipos financiados)',
        description: 'Documento estándar que describe los términos y condiciones de una compra a plazo, especialmente para equipos financiados.',
        onlyRequireInNewClients: false,
        categoryRequirementId: '7E2E9795-A90D-4E27-8ABF-FCA3CE528212',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '8970A691-26CA-4893-A765-2D6CEA04BB54',
        name: 'Modificación contractual',
        description: 'Documento que registra cambios o modificaciones en un contrato existente.',
        onlyRequireInNewClients: false,
        categoryRequirementId: 'C449C1E6-C022-4BCA-A533-5C0BC85DA6E4',
        tenantId: UNSTABLE_TENANT_ID,
      },
    ],
  });

  //////////////////////////
  // Create sales channels
  //////////////////////////
  let salesChannels = await prisma.salesChannel.createMany({
    data: [
      {
        id: 'D37582FB-067A-4CC0-A634-B127D76511EC',
        name: 'Grandes Empresas',
        description: 'Ofrecido a Empresas, ONGs.',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
        name: 'Pymes',
        description: 'Ofrecido a pequeñas y medianas empresas.',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '02644847-C00E-44F6-843F-68907975B0B6',
        name: 'Gobierno',
        description: 'Ventas realizadas a través de la página web.',
        tenantId: UNSTABLE_TENANT_ID,
      },
      {
        id: '6E472E4B-C06A-40AB-AB2D-D6715D0F1599',
        name: 'Mayoristas',
        description: 'Ventas realizadas a través de subdistribuidores y distribuidores.',
        tenantId: UNSTABLE_TENANT_ID,
      },
    ],
  });

  //////////////////////////
  // Service types Grandes Empresas
  //////////////////////////
  const RonavacionGrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: 'D0476505-DF26-4295-8B8F-1DB96492635A',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Renovación',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const CambioPlanGrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: 'CD61EB0E-D297-4F94-9346-9636751ADB52',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Cambio de plan',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: false,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const DespachoEquiposGrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: '983B9DA5-C323-49FB-9C64-794504F180C1',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Despacho de Equipos',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: false,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const ActivacionLineasPospagoGrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: '94529F80-7519-472A-9C4C-E2B38D83C175',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Activación de lineas Pospagos',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: false,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const AdicionLineasPospagoGrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: '241FD5CD-131F-43C0-B239-A62EB8C7CA6F',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Adición de lineas pospagos',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: false,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const Internet1615GrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: '03E03558-0ED2-43AF-8037-77258E806802',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Internet 1615',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const InternetGponGrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: 'B01A3A8C-BA8D-4888-BC0E-F27570335DA2',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Internet Gpon',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const TVGrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: '0A193625-D7CE-4F87-8AFA-C2035D577949',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'TV',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const LineaBasicaGrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: '0AA39BC6-2C94-4FFC-8C9B-29E20417364E',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Linea Basica',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const InternetGrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: '83BC7839-704A-4965-9D58-5E5DDA1F6B51',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Internet',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const CesiónDerechoGrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: '8D438EAA-BDDC-4034-BA52-C269BB449B9F',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Cesión de Derecho',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const CambioRazonSocialGrandesEmpresas = await prisma.serviceType.create({
    data: {
      id: '4DEF976D-EEC6-4CFF-B369-34253BA27215',
      salesChannelId: 'D37582FB-067A-4CC0-A634-B127D76511EC',
      name: 'Cambio de razón social',
      description: 'Ofrecido a Empresas, ONGs.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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
  const RenovacionPymes = await prisma.serviceType.create({
    data: {
      id: '6A4A2234-256C-4494-978D-E61C99351467',
      salesChannelId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Renovación',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const CambioPlanPymes = await prisma.serviceType.create({
    data: {
      id: 'F0E7128E-A0CB-4617-BC62-628D720E2D5F',
      salesChannelId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Cambio de plan',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const DespachoEquiposPymes = await prisma.serviceType.create({
    data: {
      id: 'C50FB7AC-78D8-4780-A6D4-1B96F9AF1861',
      salesChannelId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Despacho de Equipos',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const ActivacionLineasPospagoPymes = await prisma.serviceType.create({
    data: {
      id: '71FEAB5A-05A3-4DC4-A12C-8512A4EF89C2',
      salesChannelId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Activación de lineas Pospagos',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const Internet1615Pymes = await prisma.serviceType.create({
    data: {
      id: 'B74652EB-9456-4D66-9895-9BD77E6C3E55',
      salesChannelId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Internet 1615',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const InternetGponPymes = await prisma.serviceType.create({
    data: {
      id: '521929C1-F029-48A1-91FC-D67CBFEE47F4',
      salesChannelId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Internet Gpon',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const TVPymes = await prisma.serviceType.create({
    data: {
      id: '18768DD2-5EEE-47BF-942C-8F4BEE39EBF1',
      salesChannelId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'TV',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const LineaBasicaPymes = await prisma.serviceType.create({
    data: {
      id: '0FBD66FD-0C13-49E6-A498-EB162C56DE71',
      salesChannelId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Linea Basica',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const InternetPymes = await prisma.serviceType.create({
    data: {
      id: '7EC04EB1-3954-46C9-9ECF-E5DFEB02B03F',
      salesChannelId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Internet',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const CesiónDerechoPymes = await prisma.serviceType.create({
    data: {
      id: '0A758B23-4ECC-4170-9C31-73058DDBA544',
      salesChannelId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Cesión de Derecho',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const CambioRazonSocialPymes = await prisma.serviceType.create({
    data: {
      id: '057DCBAE-4184-43B2-9980-77DCE3F9F2A8',
      salesChannelId: '348EC35A-E7A2-4389-A489-E4153EB6F92F',
      name: 'Cambio de razón social',
      description: 'Ofrecido a pequeñas y medianas empresas.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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
  const RenovacionGobierno = await prisma.serviceType.create({
    data: {
      id: '09527C48-CEC7-4FE2-927C-19BFB5E60210',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Renovación',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const CambioPlanGobierno = await prisma.serviceType.create({
    data: {
      id: '123C7C6C-6DF0-49D2-ACC9-2774EDC5551C',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Cambio de plan',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const DespachoEquiposGobierno = await prisma.serviceType.create({
    data: {
      id: '4954EE72-AE04-4B30-B342-653F635FB182',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Despacho de Equipos',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const ActivacionLineasPospagoGobierno = await prisma.serviceType.create({
    data: {
      id: '90B0195E-CADF-4D3D-9EAF-1558AF1A3047',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Activación de lineas Pospagos',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const AdicionLineasPospagosGobierno = await prisma.serviceType.create({
    data: {
      id: 'ED2D802C-57D2-422C-9A9B-F472A8102ADD',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Adición de lineas pospagos',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const Internet1615Gobierno = await prisma.serviceType.create({
    data: {
      id: '57E6C79B-8E32-42EF-AF4F-DD2D79410B0F',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Internet 1615',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const InternetGponGobierno = await prisma.serviceType.create({
    data: {
      id: '2C513C16-2070-47A5-A3A7-12619E1265B9',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Internet Gpon',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const TVGobierno = await prisma.serviceType.create({
    data: {
      id: 'C870D269-25A8-4AF3-B3D4-782A6EA296E4',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'TV',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const LineaBasicaGobierno = await prisma.serviceType.create({
    data: {
      id: 'D2189CDA-0B66-44BF-BED9-84CFFE34D36D',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Linea Basica',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const InternetGobierno = await prisma.serviceType.create({
    data: {
      id: '6171B46E-EBD0-4232-9BFB-DC549EAC4203',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Internet',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const CesiónDerechoGobierno = await prisma.serviceType.create({
    data: {
      id: '6FABDCFB-2C23-4BB5-9A13-FEDE912B7874',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Cesión de Derecho',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

  const CambioRazonSocialGobierno = await prisma.serviceType.create({
    data: {
      id: 'B2164B28-A492-4AC1-9749-ACFC08F51584',
      salesChannelId: '02644847-C00E-44F6-843F-68907975B0B6',
      name: 'Cambio de razón social',
      description: 'Ofrecido a entidades gubernamentales.',
      acceptsNewClients: true,
      tenantId: UNSTABLE_TENANT_ID,
      requirementServiceTypeAssociation: {
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

async function createAreas() {
  // Comisiones Internas
  await prisma.area.create({
    data: {
      name: 'Comisiones Internas',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Syrem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Calculo De Comisiones Corporativo',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Renovaciones',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Multas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Consulta',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Syrem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Calculo De Comisiones Corporativo',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Renovaciones',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Multas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Reclamo',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Syrem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseñas Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Calculo De Comisiones Corporativo',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Renovaciones',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Multas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Comisiones
  await prisma.area.create({
    data: {
      name: 'Comisiones',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Cable',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Linea Fija',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Internet Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Internet Analogico',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Enlace De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Soporte Cloud',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Doble',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Triple',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Legalizar Lfi / Modem Inalambrico Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Incentivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Bonos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Visitas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Prepago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Permanencia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Bono Kit',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion Simcard',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Descuento Equipo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Favoritos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reembolso',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Lfi',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Variacion De Precio',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Prepago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Otros',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Otros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Penalizacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Qflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Mesa De Control',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Malas Instalaciones (Tecnica)',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Otros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Port In Ficticio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Expediente Incompleto',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Falsificacion De Documentos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion Sin Entrga Y Uso De Equipos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Alta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apropiacion De Pagos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sustitucion De Equipos En Nuevas Contrataciones',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Realizar Pago Para Llegar A La Meta Permanencia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Comision Sin Digitalizar El Contrato',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Comsion Sin Entregar Documento En Fisico',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente No Ubicado En Visita Domiciliar',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Contratar Personal Circualdo En Lista Negra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Clientes Multimedias No Verificados',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Creditos',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Especiales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Facturacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Facturacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Semillero',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Semilleros Servicios Fijos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Semilleros Servicios Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Correccion De Canal De Venta',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Correccion De Canal De Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reasignacion Sispaco',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Mal Empaquetados',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Consulta',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Cable',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Linea Fija',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Internet Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Internet Analogo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Enlace De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Soporte Cloud',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Doble',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Triple',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Legalizar Lfi / Modem Inalambrico Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Incentivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Bonos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Visitas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Prepago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Permanencia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Bono Kit',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion Simcard',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Descuento Equipo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Favoritos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reembolso',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Lfi',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Variacion De Precio',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Prepago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Otros',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Otros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Penalizacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Qflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Mesa De Control',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Malas Instalaciones (Tecnica)',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Otros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Port In Ficticio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Expediente Incompleto',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Falsificacion De Documentos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion Sin Entrga Y Uso De Equipos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Alta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apropiacion De Pagos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sustitucion De Equipos En Nuevas Contrataciones',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Realizar Pago Para Llegar A La Meta Permanencia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Comision Sin Digitalizar El Contrato',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Comision Sin Entregar Expediente Fisico',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente No Ubicado En Visita Domiciliar',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Contratar Personal Circualdo En Lista Negra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Clientes Multimedias No Verificados',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Creditos',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Especiales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Facturacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Facturacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Semillero',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Semillero Servicio Fijo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Semillero Servicio Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Correccion De Canal De Venta',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Correccion De Canal De Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reasignacion Sispaco',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Mal Empaquetados',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Reclamo',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Cable',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Linea Fija',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Internet Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Internet Analogo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Enlace De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Soporte Cloud',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Doble',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Triple',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Legalizar Lfi / Modem Inalambrico Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Incentivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Bonos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Visitas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Prepago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Permanencia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Bono Kit',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion Simcard',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Descuento Equipo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Favoritos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reembolso',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Lfi',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Variacion De Precio',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Prepago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Otros',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Otros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Penalizacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Qflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Mesa De Control',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Malas Instalaciones (Tecnica)',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Otros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Port In Ficticio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Expediente Incompleto',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Falsificacion De Documentos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion Sin Entrga Y Uso De Equipos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Alta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apropiacion De Pagos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sustitucion De Equipos En Nuevas Contrataciones',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Realizar Pago Para Llegar A La Meta Permanencia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Comision Sin Digitalizar El Contrato',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Comision Sin Entregar Expediente Fisico',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente No Ubicado En Visita Domiciliar',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Contratar Personal Circualdo En Lista Negra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Clientes Multimedias No Verificados',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Creditos',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Especiales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Facturacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Facturacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'nan',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Semillero',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Semillero Servicio Fijo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Semillero Servicio Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Correccion De Canal De Venta',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Correccion De Canal De Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reasignacion Sispaco',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Mal Empaquetados',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Activaciones
  await prisma.area.create({
    data: {
      name: 'Activaciones',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Activacion Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Despacho De Equipos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion De Linea',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitud De Simcard',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Cable',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Linea Fija',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Internet Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Interneet Analogo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion ',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Enlace De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Soporte Cloud',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Doble',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Triple',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Legalizar Lfi / Modem Inalambrico Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Correccion De Canal De Venta',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Correccion De Canal De Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Baja De Servicio',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Baja De Servicio Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicios Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion / Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Asignaciones Internas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Linea Asignada',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion De Planes De Prueba',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activaciones De Servicios Fijos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Razon Social',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Servicio O Lineas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Carga De Financiamiento',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Financiamiento Bscs',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Financiamiento Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reinicio De Contraseña',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Reinicio De Contraseña Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Bscs',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Siv',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Intranet',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Onbase',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Vpn',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Contrato Fisico',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Entrega De Contratos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivacion Cambio De Razon Social',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivacion Cambio De Plan',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Qflow - Mala Venta',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Mala Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Solicitud Activacion',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Activacion Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Despacho De Equipos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion De Linea',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitud De Simcard',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Cable',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Linea Fija',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Internet Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Internet Analogo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Enlace De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Soporte Cloud',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Doble',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Triple',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Legalizar Lfi / Modem Inalambrico Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Correccion Canal De Venta',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Correccion Canal De Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Baja De Servicio',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Baja De Servicio Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicios Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Asignaciones Internas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Linea Asignada',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activaciones De Planes De Prueba',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion De Servicios Fijos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Servicio O Lineas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Carga De Financiamiento',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Financiamiento Bscs',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Financiamiento Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reinicio De Contraseña',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Reinicio De Contraseña Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Bscs',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Siv',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Intranet',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Onbase',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Vpn',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Contrato Fisico',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Entrega De Contratos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivacion Cambio De Razon Social',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth ',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivacion Cambio De Plan',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Qflow - Mala Venta',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Mala Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Entrega Documentos Logistic',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Activacion Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Despacho De Equipos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion De Linea',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitud De Simcard',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Cable',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Hfc Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Linea Fija',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Internet Digital',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Internet Analogo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Simulacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Enlace De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Soporte Cloud',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Doble',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Hogar Triple',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Legalizar Lfi / Modem Inalambrico Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Correccion Canal De Venta',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Correccion Canal De Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Baja De Servicio',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Baja De Servicio Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicios Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Asignaciones Internas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Linea Asignada',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activaciones De Planes De Prueba',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Activacion De Servicios Fijos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Servicio O Lineas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Carga De Financiamiento',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Financiamiento Bscs',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Financiamiento Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reinicio De Contraseña',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Reinicio De Contraseña Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Bscs',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Siv',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Intranet',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Onbase',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Vpn',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Contrato Fisico',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Entrega De Contratos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivacion Cambio De Razon Social',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth ',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivacion Cambio De Plan',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Qflow - Mala Venta',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Mala Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Creditos
  await prisma.area.create({
    data: {
      name: 'Creditos',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Consulta',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validaciones Para Entrega Terminaes',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion Problemas Sistema',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apoyo Posventa',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Activacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicion Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion / Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Baja De Migracion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Baja De Migracion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth ',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Activar Desde El Facturador',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validaciones Para Entrega Terminaes',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion Problemas Sistema',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apoyo Posventa',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Activacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicios Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion / Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Bajas De Migracion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Bajas De Migracion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth ',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Agregar Servicios Moviles',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validaciones Para Entrega Terminaes',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion Problemas Sistema',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apoyo Posventa',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Activacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicios Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion / Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Bajas De Migracion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Bajas De Migracion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth ',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Agregar Numero Favorito',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validaciones Para Entrega Terminaes',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion Problemas Sistema',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apoyo Posventa',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Activacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicios Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion / Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Bajas De Migracion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Bajas De Migracion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth ',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Cambio Razon Social',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validaciones Para Entrega Terminaes',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion Problemas Sistema',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apoyo Posventa',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Activacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicios Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion / Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Bajas De Migracion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Bajas De Migracion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Correccion De Nombre',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validaciones Para Entrega Terminaes',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion Problemas Sistema',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apoyo Posventa',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Activacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicios Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion / Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Bajas De Migracion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Bajas De Migracion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Validacion Financiamientos Equipos De Alto Valor',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validaciones Para Entrega Terminaes',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion Problemas Sistema',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apoyo Posventa',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Activacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicios Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion / Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Bajas De Migracion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Bajas De Migracion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Solicitudes Bloqueadas De Claro Altas',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validaciones Para Entrega Terminaes',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion Problemas Sistema',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apoyo Posventa',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Activacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicios Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion / Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Bajas De Migracion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Bajas De Migracion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Pospago',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Autorizacion Por Tercer Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Segmento Nuevo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Incobrables',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Extrajero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Excedente En Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Empaquetamiento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Renovacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derecho',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Limite De Compra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validaciones Para Entrega Terminaes',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion Problemas Sistema',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Apoyo Posventa',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solicitudes Bloqueadas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Activacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Modificaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Activacion De Servicios Suplementarios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja Por Migracion De Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Variable / Empaquetamientos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion De Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Anulacion De Solicitud De Venta Por Mal Registro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion / Retiro De Paquetes De Canales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Correccion / Cambio De Direccion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio Razon Social / Actualizacion De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Adicion De Numero Favorito Lda',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Bajas De Migracion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Bajas De Migracion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Sistemas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Creacion De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Baja De Accesos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cambio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Claro Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Altas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Docflow',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Syrem Ventas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reinicio De Contraseña Helpdesk',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reactivaciones',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Desbloqueo De Modem',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Multas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Compras
  await prisma.area.create({
    data: {
      name: 'Compras',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Cotizacion',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Planta Interna',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Acciones Comerciales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Administrativas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Conmutacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Consumibles',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Contenido',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Datacenter',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Decodificador Cpe',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Equipo Venta',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Equipos Cpe Corp',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Fuerza Y Clima',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Handsets',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Mo Aliado Corporat',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Mo Aliado Residenc',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Marketing',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Mobiliario Equipo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Planta Externa',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Proyectos Especial',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Publicidad',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Solucion Adm Corpo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Terminales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Ti',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Transmision',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Traslados',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Planta Externa',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Cable Coaxial',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Fibra Optica',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Infraestructura Tv',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Infraestructura Corporat',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Infraestructura Red',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Miscelaneos Infrae',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Obra Civil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Obra Civil Tecnica',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Planta Externa',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Servicios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Servicios Tecnicos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Cobranza
  await prisma.area.create({
    data: {
      name: 'Cobranza',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Reclamo',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Reclamos',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Mala Facturacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Falla Tecnica',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Falllas Con El Dispositivo Del Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'No Recibio Factura',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Exceso De Llamadas Internacionales Y Celulares',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Problemas De Debito Automatico',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Descuento No Aplicado',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Promocion No Aplicada',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Retiro De Servicio No Atendido',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'No Instalaron El Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pago Mal Aplicado',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Solicitudes',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Limpieza De Cd',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Autorizacion De Descuento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Autorizacion Recepcion De Equipos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Autorizacion De Arp',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reversion Cd Reactivadores',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Limpieza Reactivacion Casa Claro / Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Limpieza Reactivacion Casa Claro / Suspendido',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Limpieza Por Certificado De Defuncion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Gestion De Cobro Por Agencia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Asignacion De Cartera',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Rebaja De Cartera',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Reclamos',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Mala Facturacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Falla Tecnica',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Falllas Con El Dispositivo Del Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'No Recibio Factura',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Exceso De Llamadas Internacionales Y Celulares',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Problemas De Debito Automatico',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Descuento No Aplicado',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Promocion No Aplicada',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Retiro De Servicio No Atendido',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'No Instalaron El Servicio',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pago Mal Aplicado',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Solicitudes',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Limpieza De Cd',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Autorizacion De Descuento',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Autorizacion Recepcion De Equipos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Autorizacion De Arp',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reversion Cd Reactivadores',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Limpieza Reactivacion Casa Claro / Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Limpieza Reactivacion Casa Claro / Suspendido',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Limpieza Por Certificado De Defuncion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Gestion De Cobro Por Agencia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Asignacion De Cartera',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Rebaja De Cartera',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // CIA
  await prisma.area.create({
    data: {
      name: 'CIA',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Carga De Financiamiento',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Financiamiento Bscs',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Financiamiento Open',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Aprobados Credito Mesa Control
  await prisma.area.create({
    data: {
      name: 'Aprobados Credito Mesa Control',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Validacion',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Validacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Validacion De Cliente',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Compromiso',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Venta Incobrable',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Venta Extranjero',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Con Seguimiento Desactivo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Nuevo Desea Otro Producto',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cliente Excede Limite De Credito',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Segmentacion Del Cliente Manual',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Validacion De Soporte De Ingresos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Sesion De Derechos O Crs',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Agregar Favoritos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Facturacion
  await prisma.area.create({
    data: {
      name: 'Facturacion',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Facturacion Por Instalacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Finiquitos',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Finiquitos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Autoconsumo',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pruebas Internas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Prueba Clientes (Degustacion)',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Donacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Deduccion De Equipo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cantidad De Registros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Parametrizacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Prepago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reporte',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Revision De Facturas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Exoneracion Iba',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Generar Factura Sap',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Generar Factura Sap',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Nota De Credito',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Nota De Debito',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'St-Pre Facturacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Television',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Linea Fija',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Enlace De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Otros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Finiquitos',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Facturacion Por Instalacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Finiquitos',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Finiquitos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Autoconsumo',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pruebas Internas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Prueba Clientes (Degustacion)',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Donacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Deduccion De Equipo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cantidad De Registros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Parametrizacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Prepago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reporte',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Revision De Facturas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Exoneracion Iba',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Generar Factura Sap',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Generar Factura Sap',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Nota De Credito',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Nota De Debito',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'St-Pre Facturacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Television',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Linea Fija',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Enlace De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Otros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Autoconsumo',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Facturacion Por Instalacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Finiquitos',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Finiquitos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Autoconsumo',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pruebas Internas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Prueba Clientes (Degustacion)',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Donacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Deduccion De Equipo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cantidad De Registros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Parametrizacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Prepago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reporte',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Revision De Facturas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Exoneracion Iba',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Generar Factura Sap',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Generar Factura Sap',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Nota De Credito',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Nota De Debito',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'St-Pre Facturacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Television',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Linea Fija',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Enlace De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Otros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Parametrizacion',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Multimedia',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Facturacion Por Instalacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Finiquitos',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Finiquitos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Autoconsumo',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pruebas Internas',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Prueba Clientes (Degustacion)',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Donacion',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Deduccion De Equipo',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Cantidad De Registros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Parametrizacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Pospago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Prepago',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Reporte',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Revision De Facturas',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Exoneracion Iba',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Generar Factura Sap',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Generar Factura Sap',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Nota De Credito',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Nota De Debito',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Multimedia',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'St-Pre Facturacion',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Television',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Linea Fija',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Enlace De Datos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Otros',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Multipagos Reactivacion
  await prisma.area.create({
    data: {
      name: 'Multipagos Reactivacion',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Reactivacion De Servicios',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Reactivacion Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reactivacion Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Resuelva Reactivacion
  await prisma.area.create({
    data: {
      name: 'Resuelva Reactivacion',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Reactivacion De Servicios',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Reactivacion Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reactivacion Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Edatel Reactivacion
  await prisma.area.create({
    data: {
      name: 'Edatel Reactivacion',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Reactivacion De Servicios',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Reactivacion Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reactivacion Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Invercobro Reactivacion
  await prisma.area.create({
    data: {
      name: 'Invercobro Reactivacion',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Reactivacion De Servicios',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Reactivacion Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reactivacion Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Gextiona Reactivacion
  await prisma.area.create({
    data: {
      name: 'Gextiona Reactivacion',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Reactivacion De Servicios',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Reactivacion Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reactivacion Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Serdico Reactivacion
  await prisma.area.create({
    data: {
      name: 'Serdico Reactivacion',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Reactivacion De Servicios',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Reactivacion Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reactivacion Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Reactivacion
  await prisma.area.create({
    data: {
      name: 'Reactivacion',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Reactivacion De Servicios',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Reactivacion Casa Claro',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Reactivacion Dth',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Recuperacion Equipos
  await prisma.area.create({
    data: {
      name: 'Recuperacion Equipos',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Registro Equipos Recuperados',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Recuperacion Por Mora',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Equipos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Traslados De Equipos
  await prisma.area.create({
    data: {
      name: 'Traslados De Equipos',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Traslados De Equipos',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Recuperacion Por Mora',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Equipos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Procesamiento Equipos
  await prisma.area.create({
    data: {
      name: 'Procesamiento Equipos',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Registro Retiro Equipo',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Recuperacion Por Mora',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Equipos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Facturacion Deudores Varios
  await prisma.area.create({
    data: {
      name: 'Facturacion Deudores Varios',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Deudores Varios',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Deudores Varios',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Area Tecnica
  await prisma.area.create({
    data: {
      name: 'Area Tecnica',
      description: '',
      tenantId: UNSTABLE_TENANT_ID,
      requestType: {
        create: [
          {
            name: 'Solicitud',
            description: '',
            tenantId: UNSTABLE_TENANT_ID,
            category: {
              create: [
                {
                  name: 'Ultima Milla',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Fibra Clientes Y Troncales',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Fibra Movil',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Fibra Hfc',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Fibra Cobre Infraestructura',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Enlaces De Fibra',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Proyectos Inducidos',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                      {
                        name: 'Msan',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
                {
                  name: 'Hfc',
                  tenantId: UNSTABLE_TENANT_ID,
                  subCategories: {
                    create: [
                      {
                        name: 'Hfc Coaxial',
                        description: '',
                        tenantId: UNSTABLE_TENANT_ID,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
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
