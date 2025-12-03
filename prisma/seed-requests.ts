import { PrismaClient } from '@prisma/client';
import { generateUuid } from '../src/lib/id.js';

const prisma = new PrismaClient();

// Realistic descriptions and subjects for Claro Nicaragua context
// Extended scenarios covering all major areas and use cases
const SCENARIOS = [
    // ========== ACTIVACIONES ==========
    {
        area: 'Activaciones',
        category: 'Renovación', // Categoría hoja (nivel 2)
        parentCategory: 'Grandes Empresas', // Categoría padre (nivel 1)
        assignmentCategory: 'Activacion De Linea',
        subject: 'Activación de Flota Corporativa - Minsa',
        description: 'Solicitud para activar 50 líneas nuevas del plan Corporativo Ilimitado para el personal de campo del Ministerio de Salud. Se adjunta orden de compra y listado de usuarios.'
    },
    {
        area: 'Activaciones',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Activacion De Linea',
        subject: 'Nuevas líneas para Call Center - Sitel',
        description: 'Requerimiento urgente de 20 líneas móviles para supervisores de nueva campaña. Plan de datos 10GB.'
    },
    {
        area: 'Activaciones',
        category: 'Despacho de Equipos',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Despacho De Equipos',
        subject: 'Despacho de Equipos Corporativos - Banco Central',
        description: 'Solicitud de despacho de 25 equipos Samsung Galaxy S24 para ejecutivos. Requiere entrega en sucursal principal.'
    },
    {
        area: 'Activaciones',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Renovacion Pospago',
        subject: 'Renovación de Planes - Restaurante La Plancha',
        description: 'Cliente solicita renovación de 8 líneas pospago con actualización a planes de datos ilimitados.'
    },
    {
        area: 'Activaciones',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Solicitud De Simcard',
        subject: 'Solicitud de Simcards M2M - Coca Cola',
        description: 'Activación de 100 simcards M2M para rastreo vehicular de flota de distribución. Requiere configuración especial.'
    },
    {
        area: 'Activaciones',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Dth',
        subject: 'Instalación DTH Corporativa - Hotel Intercontinental',
        description: 'Instalación de servicio DTH en 120 habitaciones del hotel. Requiere coordinación con área técnica.'
    },
    {
        area: 'Activaciones',
        category: 'Internet',
        parentCategory: 'Pymes',
        assignmentCategory: 'Internet Digital',
        subject: 'Nueva Conexión Internet Digital - Clínica San Juan',
        description: 'Solicitud de instalación de internet digital 100 Mbps para clínica médica. Requiere evaluación técnica.'
    },
    {
        area: 'Activaciones',
        category: 'TV',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Claro Hogar Triple',
        subject: 'Paquete Triple Play - Residencial Los Robles',
        description: 'Instalación de paquete triple play (Internet + TV + Teléfono) para complejo residencial de 50 unidades.'
    },
    {
        area: 'Activaciones',
        category: 'Internet Gpon',
        parentCategory: 'Pymes',
        assignmentCategory: 'Enlace De Datos',
        subject: 'Enlace de Datos Dedicado - Universidad UNAN',
        description: 'Solicitud de enlace de datos dedicado de 500 Mbps para conexión entre campus universitarios.'
    },
    {
        area: 'Activaciones',
        category: 'Linea Basica',
        parentCategory: 'Gobierno',
        assignmentCategory: 'Linea Fija',
        subject: 'Instalación Líneas Fijas - Ministerio de Educación',
        description: 'Instalación de 30 líneas fijas para oficinas administrativas del Ministerio de Educación.'
    },

    // ========== CRÉDITOS ==========
    {
        area: 'Creditos',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Cliente Segmento Nuevo',
        subject: 'Evaluación Crediticia - Ferretería El Halcón',
        description: 'Solicitud de crédito para adquisición de 5 equipos iPhone 15 Pro Max a plazos. Cliente nuevo con RUC 1234567890.'
    },
    {
        area: 'Creditos',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Cliente Segmento Nuevo',
        subject: 'Consulta de límite de crédito - Farmacia San Sebastián',
        description: 'Cliente desea aumentar su límite de crédito para adquirir 10 líneas adicionales. Revisar historial de pagos y buró.'
    },
    {
        area: 'Creditos',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Excedente En Limite De Compra',
        subject: 'Excedente en Límite - Constructora Meco',
        description: 'Cliente requiere autorización para compra que excede su límite establecido. Monto: $75,000 en equipos.'
    },
    {
        area: 'Creditos',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Cliente Desactivo',
        subject: 'Reactivación de Cliente Desactivado - Taller Mecánico El Motor',
        description: 'Cliente desactivado por mora solicita reactivación. Historial de 2 años sin incidencias previas.'
    },
    {
        area: 'Creditos',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Validacion De Limite De Compra',
        subject: 'Validación de Límite - Supermercado La Colonia',
        description: 'Validación y actualización de límite de compra para cliente corporativo. Revisar estados financieros actualizados.'
    },
    {
        area: 'Creditos',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Validacion De Soporte De Ingresos',
        subject: 'Validación de Ingresos - Clínica Dental Sonrisa',
        description: 'Cliente nuevo requiere validación de soporte de ingresos para aprobación de crédito. Adjunta estados bancarios.'
    },
    {
        area: 'Creditos',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Renovacion',
        subject: 'Renovación de Crédito - Banco Lafise',
        description: 'Renovación automática de línea de crédito corporativa. Revisar cumplimiento de pagos del período anterior.'
    },
    {
        area: 'Creditos',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Cliente Extrajero',
        subject: 'Aprobación Cliente Extranjero - Restaurante Italiano',
        description: 'Cliente extranjero solicita crédito. Requiere validación de documentos migratorios y referencias bancarias internacionales.'
    },
    {
        area: 'Creditos',
        category: 'Cesión de Derecho',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Sesion De Derecho',
        subject: 'Cesión de Derecho - Empresa de Seguridad',
        description: 'Solicitud de cesión de derecho de servicios móviles corporativos a nueva razón social. Requiere documentación legal.'
    },
    {
        area: 'Creditos',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Solicitudes Bloqueadas',
        subject: 'Desbloqueo de Solicitud - Tienda de Ropa Fashion',
        description: 'Solicitud bloqueada por sistema requiere revisión manual. Cliente con historial positivo solicita desbloqueo.'
    },

    // ========== FACTURACIÓN ==========
    {
        area: 'Facturacion',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Facturacion Por Instalacion',
        subject: 'Facturación por Instalación - Hotel Barceló',
        description: 'Generar factura por instalación de servicios corporativos. Incluye instalación de 50 líneas y equipos.'
    },
    {
        area: 'Facturacion',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Nota De Credito',
        subject: 'Nota de Crédito - Error en Facturación Movil',
        description: 'Cliente reporta error en facturación de llamadas internacionales. Requiere emisión de nota de crédito por $450.'
    },
    {
        area: 'Facturacion',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Nota De Debito',
        subject: 'Nota de Débito - Servicios Adicionales',
        description: 'Emitir nota de débito por servicios adicionales de datos no incluidos en plan base. Monto: $320.'
    },
    {
        area: 'Facturacion',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Revision De Facturas',
        subject: 'Revisión de Factura - Discrepancia en Cargos',
        description: 'Cliente solicita revisión de factura por cargos no reconocidos. Revisar historial de consumo y servicios contratados.'
    },
    {
        area: 'Facturacion',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Exoneracion Iba',
        subject: 'Exoneración IBA - Entidad Gubernamental',
        description: 'Solicitud de exoneración de IBA para servicios gubernamentales. Requiere documentación de exoneración fiscal.'
    },
    {
        area: 'Facturacion',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Finiquitos',
        subject: 'Finiquito de Servicios - Cliente que Cierra Operaciones',
        description: 'Cliente solicita finiquito de todos los servicios. Requiere cálculo de saldos pendientes y devolución de equipos.'
    },
    {
        area: 'Facturacion',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Generar Factura Sap',
        subject: 'Generación Factura SAP - Cliente Corporativo',
        description: 'Generar factura en sistema SAP para cliente corporativo con condiciones especiales de pago.'
    },
    {
        area: 'Facturacion',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Autoconsumo',
        subject: 'Autoconsumo - Pruebas Internas',
        description: 'Solicitud de autoconsumo para pruebas internas de equipos. Asignar a área de desarrollo.'
    },

    // ========== COMISIONES ==========
    {
        area: 'Comision',
        category: 'TV',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Dth',
        subject: 'Comisión DTH - Venta Corporativa',
        description: 'Cálculo y pago de comisión por venta de servicio DTH corporativo. 120 instalaciones en complejo residencial.'
    },
    {
        area: 'Comision',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Pospago',
        subject: 'Comisión Pospago - Nueva Activación',
        description: 'Procesar comisión por activación de 15 líneas pospago para empresa de seguridad.'
    },
    {
        area: 'Comision',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Incentivo',
        subject: 'Incentivo por Meta Cumplida - Equipo de Ventas',
        description: 'Cálculo de incentivo adicional por superar meta mensual de activaciones corporativas.'
    },
    {
        area: 'Comision',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Bonos',
        subject: 'Bono por Retención - Cliente Pyme',
        description: 'Bono otorgado por retención de cliente pyme que estaba considerando cancelar servicios.'
    },
    {
        area: 'Comision',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Reembolso',
        subject: 'Reembolso LFI - Cliente Insatisfecho',
        description: 'Procesar reembolso de servicio LFI por cancelación dentro del período de garantía. Monto: $180.'
    },
    {
        area: 'Comision',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Penalizacion',
        subject: 'Penalización - Port In Ficticio',
        description: 'Aplicar penalización por detección de portabilidad ficticia. Revisar documentación y aplicar sanción correspondiente.'
    },

    // ========== COBRANZA ==========
    {
        area: 'Cobranza',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Mala Facturacion',
        subject: 'Reclamo por Mala Facturación - Restaurante El Patio',
        description: 'Cliente reclama facturación incorrecta por servicios no contratados. Revisar historial y corregir facturación.'
    },
    {
        area: 'Cobranza',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Falla Tecnica',
        subject: 'Reclamo Falla Técnica - Empresa de Logística',
        description: 'Cliente reporta falla técnica que afectó operaciones. Solicita descuento en facturación del período afectado.'
    },
    {
        area: 'Cobranza',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'No Recibio Factura',
        subject: 'No Recibió Factura - Clínica Dental',
        description: 'Cliente no recibió factura del mes anterior. Enviar duplicado y verificar dirección de correo electrónico.'
    },
    {
        area: 'Cobranza',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Descuento No Aplicado',
        subject: 'Descuento No Aplicado - Promoción Corporativa',
        description: 'Cliente corporativo reporta que descuento promocional no fue aplicado en factura. Revisar y corregir.'
    },
    {
        area: 'Cobranza',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Autorizacion De Descuento',
        subject: 'Autorización de Descuento - Cliente con Dificultades',
        description: 'Solicitud de autorización de descuento especial para cliente con dificultades económicas temporales.'
    },
    {
        area: 'Cobranza',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Limpieza De Cd',
        subject: 'Limpieza de CD - Cliente Recurrente',
        description: 'Solicitud de limpieza de código de deuda para cliente con historial positivo que resolvió situación pendiente.'
    },
    {
        area: 'Cobranza',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Asignacion De Cartera',
        subject: 'Asignación de Cartera - Nueva Agencia',
        description: 'Asignar cartera de clientes pyme a nueva agencia de cobranza. Transferir 150 casos pendientes.'
    },

    // ========== COMPRAS ==========
    {
        area: 'Compras',
        category: 'Despacho de Equipos',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Equipo Venta',
        subject: 'Cotización Equipos de Venta - Renovación de Inventario',
        description: 'Solicitud de cotización para renovación de inventario de equipos de venta. Requiere 200 unidades de smartphones.'
    },
    {
        area: 'Compras',
        category: 'Despacho de Equipos',
        parentCategory: 'Pymes',
        assignmentCategory: 'Handsets',
        subject: 'Cotización Handsets - Modelos 2024',
        description: 'Cotización de handsets para reposición de inventario. Incluir modelos iPhone, Samsung y Xiaomi.'
    },
    {
        area: 'Compras',
        category: 'Internet Gpon',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Infraestructura Red',
        subject: 'Infraestructura de Red - Expansión de Cobertura',
        description: 'Cotización de infraestructura de red para expansión de cobertura en zona rural. Incluye equipos y materiales.'
    },
    {
        area: 'Compras',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Consumibles',
        subject: 'Consumibles - Materiales de Oficina',
        description: 'Solicitud de cotización de consumibles para operaciones diarias. Incluye simcards, cables y accesorios.'
    },

    // ========== REACTIVACIÓN ==========
    {
        area: 'Reactivacion',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Reactivacion Casa Claro',
        subject: 'Reactivación Casa Claro - Cliente que Regresó',
        description: 'Cliente solicita reactivación de servicio Casa Claro después de 6 meses de inactividad. Verificar estado de instalación.'
    },
    {
        area: 'Reactivacion',
        category: 'TV',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Reactivacion Dth',
        subject: 'Reactivación DTH - Hotel Reabierto',
        description: 'Hotel que cerró temporalmente solicita reactivación de servicio DTH en todas las habitaciones.'
    },
    {
        area: 'Reactivacion',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Reactivacion Casa Claro',
        subject: 'Reactivación por Pago Pendiente - Clínica',
        description: 'Cliente pagó deuda pendiente y solicita reactivación inmediata de servicios. Verificar pago y proceder.'
    },

    // ========== ÁREA TÉCNICA ==========
    {
        area: 'Area Técnica',
        category: 'Internet Gpon',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Fibra Clientes Y Troncales',
        subject: 'Instalación Fibra Óptica - Edificio Corporativo',
        description: 'Instalación de fibra óptica para cliente corporativo. Requiere tendido de 2 km de fibra y configuración de enlaces.'
    },
    {
        area: 'Area Técnica',
        category: 'Internet Gpon',
        parentCategory: 'Pymes',
        assignmentCategory: 'Fibra Movil',
        subject: 'Conexión Fibra Móvil - Empresa de Transporte',
        description: 'Instalación de conexión fibra móvil para flota de transporte. Requiere configuración de routers móviles.'
    },
    {
        area: 'Area Técnica',
        category: 'Internet Gpon',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Enlaces De Fibra',
        subject: 'Enlace de Fibra Dedicado - Banco',
        description: 'Configuración de enlace de fibra dedicado entre sucursales bancarias. Requiere alta disponibilidad.'
    },
    {
        area: 'Area Técnica',
        category: 'Internet',
        parentCategory: 'Pymes',
        assignmentCategory: 'Hfc Coaxial',
        subject: 'Mantenimiento HFC Coaxial - Zona Residencial',
        description: 'Mantenimiento preventivo de red HFC coaxial en zona residencial. Incluye revisión de amplificadores y nodos.'
    },

    // ========== REACTIVACIÓN ESPECIALIZADA ==========
    {
        area: 'Multipagos Reactivacion',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Reactivacion Casa Claro',
        subject: 'Reactivación Multipagos - Cliente con Arreglo de Pago',
        description: 'Cliente con arreglo de pago solicita reactivación de servicios. Verificar cumplimiento de pagos acordados.'
    },
    {
        area: 'Resuelva Reactivacion',
        category: 'TV',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Reactivacion Dth',
        subject: 'Reactivación Resuelva - Cliente Corporativo',
        description: 'Reactivación de servicios DTH para cliente corporativo a través de programa Resuelva.'
    },
    {
        area: 'Edatel Reactivacion',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Reactivacion Casa Claro',
        subject: 'Reactivación Edatel - Cliente Residencial',
        description: 'Solicitud de reactivación de servicios residenciales a través de programa Edatel.'
    },

    // ========== EQUIPOS ==========
    {
        area: 'Recuperacion Equipos',
        category: 'Despacho de Equipos',
        parentCategory: 'Pymes',
        assignmentCategory: 'Equipos',
        subject: 'Recuperación de Equipos - Cliente que Canceló',
        description: 'Cliente canceló servicios y requiere recuperación de equipos en comodato. Coordinar retiro y verificación.'
    },
    {
        area: 'Procesamiento Equipos',
        category: 'Despacho de Equipos',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Equipos',
        subject: 'Procesamiento de Equipos Retornados - Lote Corporativo',
        description: 'Procesar lote de 50 equipos retornados de cliente corporativo. Verificar estado y actualizar inventario.'
    },
    {
        area: 'Traslados De Equipos',
        category: 'Despacho de Equipos',
        parentCategory: 'Pymes',
        assignmentCategory: 'Equipos',
        subject: 'Traslado de Equipos - Cambio de Dirección',
        description: 'Cliente cambió de dirección y requiere traslado de equipos. Coordinar con área técnica para reinstalación.'
    },

    // ========== FACTURACIÓN DEUDORES VARIOS ==========
    {
        area: 'Facturacion Deudores Varios',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Deudores Varios',
        subject: 'Facturación Deudores Varios - Servicios Adicionales',
        description: 'Procesar facturación de servicios adicionales para cliente con cuenta deudores varios. Monto pendiente: $280.'
    },

    // ========== CIA ==========
    {
        area: 'CIA',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Financiamiento Bscs',
        subject: 'Financiamiento BSCS - Cliente Corporativo',
        description: 'Carga de financiamiento en sistema BSCS para cliente corporativo. Requiere validación de límite de crédito.'
    },
    {
        area: 'CIA',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Financiamiento Open',
        subject: 'Financiamiento Open - Cliente Pyme',
        description: 'Carga de financiamiento en sistema Open para cliente pyme. Verificar condiciones de crédito aprobadas.'
    },

    // ========== APROBADOS CRÉDITO MESA CONTROL ==========
    {
        area: 'Aprobados Credito Mesa Control',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Validacion De Cliente',
        subject: 'Validación de Cliente - Mesa de Control',
        description: 'Solicitud de crédito aprobada requiere revisión final en mesa de control. Validar documentación completa.'
    },
    {
        area: 'Aprobados Credito Mesa Control',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Cliente Excede Limite De Credito',
        subject: 'Cliente Excede Límite - Revisión Especial',
        description: 'Cliente corporativo excede límite de crédito establecido. Requiere revisión y aprobación especial.'
    },
    {
        area: 'Aprobados Credito Mesa Control',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Validacion De Soporte De Ingresos',
        subject: 'Validación de Ingresos - Mesa de Control',
        description: 'Validación de soporte de ingresos para cliente pyme. Revisar documentación financiera adjunta.'
    },

    // ========== COMISIÓN INTERNA ==========
    {
        area: 'Comisiones Internas',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Altas',
        subject: 'Comisión Interna - Altas Corporativas',
        description: 'Cálculo de comisión interna por altas corporativas. Incluye activaciones y servicios adicionales.'
    },
    {
        area: 'Comisiones Internas',
        category: 'Renovación',
        parentCategory: 'Pymes',
        assignmentCategory: 'Renovaciones',
        subject: 'Comisión Interna - Renovaciones',
        description: 'Procesar comisión interna por renovaciones de contratos pyme. Verificar cumplimiento de condiciones.'
    },
    {
        area: 'Comisiones Internas',
        category: 'Renovación',
        parentCategory: 'Grandes Empresas',
        assignmentCategory: 'Creacion De Accesos',
        subject: 'Creación de Accesos - Sistema Altas',
        description: 'Solicitud de creación de accesos en sistema Claro Altas para nuevo usuario corporativo.'
    }
];

async function main() {
    console.log('🌱 Starting request seeding with realistic scenarios...');

    // 1. Get Tenant
    const targetTenant = await prisma.tenant.findFirst();

    if (!targetTenant) {
        console.error('❌ No tenant found. Please run the main seed first.');
        return;
    }

    const tenantId = targetTenant.id;
    console.log(`Using tenant: ${tenantId}`);

    // 2. Get Common Reference Data
    const statuses = await prisma.requestWorkflowStatus.findMany({ where: { tenantId } });
    const priorities = await prisma.requestPriorityType.findMany({ where: { tenantId } });
    const assignmentTypes = await prisma.assignmentType.findMany({ where: { tenantId } });
    const users = await prisma.userTenant.findMany({
        where: { tenantId },
        include: { user: true }
    });

    if (!statuses.length || !priorities.length || !assignmentTypes.length || !users.length) {
        console.error('❌ Missing common reference data. Please run the main seed first.');
        return;
    }

    // Helper to get random item
    const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

    // Helper to find leaf request category (must be at last level and have no subcategories)
    const findLeafRequestCategory = async (categoryName: string, parentCategoryName?: string) => {
        const whereClause: any = {
            tenantId,
            name: categoryName,
        };

        // If parent category name is provided, filter by it
        if (parentCategoryName) {
            const parentCategory = await prisma.requestCategory.findFirst({
                where: { tenantId, name: parentCategoryName },
                select: { id: true },
            });
            if (parentCategory) {
                whereClause.parentCategoryId = parentCategory.id;
            }
        }

        const category = await prisma.requestCategory.findFirst({
            where: whereClause,
            include: {
                subcategories: { select: { id: true } },
                hierarchyLevel: {
                    include: {
                        hierarchy: {
                            include: {
                                levels: {
                                    orderBy: { position: 'asc' },
                                    select: { position: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!category) {
            return null;
        }

        // Validate it's a leaf node (no subcategories and at last level)
        const totalLevels = category.hierarchyLevel.hierarchy.levels.length;
        const isLeaf = category.subcategories.length === 0 && category.hierarchyLevel.position === totalLevels;

        return isLeaf ? category : null;
    };

    // Helper to find leaf assignment category (must be at last level and have no subcategories)
    const findLeafAssignmentCategory = async (areaId: string, categoryName: string) => {
        // First try direct match
        let assignmentCategory = await prisma.assignmentCategory.findFirst({
            where: {
                tenantId,
                name: categoryName,
                areaId: areaId,
                subcategories: { none: {} }, // Must have no subcategories (leaf node)
            },
            include: {
                subcategories: { select: { id: true } },
                hierarchyLevel: {
                    include: {
                        hierarchy: {
                            include: {
                                levels: {
                                    orderBy: { position: 'asc' },
                                    select: { position: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (assignmentCategory) {
            // Validate it's at the last level
            const totalLevels = assignmentCategory.hierarchyLevel.hierarchy.levels.length;
            if (assignmentCategory.hierarchyLevel.position === totalLevels && assignmentCategory.subcategories.length === 0) {
                return assignmentCategory;
            }
        }

        // If not found, search in subcategories recursively
        const allCategories = await prisma.assignmentCategory.findMany({
            where: {
                tenantId,
                areaId: areaId,
            },
            include: {
                subcategories: {
                    include: {
                        hierarchyLevel: {
                            include: {
                                hierarchy: {
                                    include: {
                                        levels: {
                                            orderBy: { position: 'asc' },
                                            select: { position: true },
                                        },
                                    },
                                },
                            },
                        },
                        subcategories: {
                            include: {
                                hierarchyLevel: {
                                    include: {
                                        hierarchy: {
                                            include: {
                                                levels: {
                                                    orderBy: { position: 'asc' },
                                                    select: { position: true },
                                                },
                                            },
                                        },
                                    },
                                },
                                subcategories: { select: { id: true } },
                            },
                        },
                    },
                },
                hierarchyLevel: {
                    include: {
                        hierarchy: {
                            include: {
                                levels: {
                                    orderBy: { position: 'asc' },
                                    select: { position: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Recursive function to find leaf category
        const findLeafRecursive = (categories: typeof allCategories, targetName: string): typeof assignmentCategory => {
            for (const cat of categories) {
                if (cat.name === targetName) {
                    const totalLevels = cat.hierarchyLevel.hierarchy.levels.length;
                    if (cat.hierarchyLevel.position === totalLevels && cat.subcategories.length === 0) {
                        return cat;
                    }
                }
                if (cat.subcategories.length > 0) {
                    const found = findLeafRecursive(cat.subcategories as any, targetName);
                    if (found) return found;
                }
            }
            return null;
        };

        return findLeafRecursive(allCategories, categoryName);
    };

    // 3. Create Requests based on Scenarios
    let createdCount = 0;
    let skippedCount = 0;

    for (const scenario of SCENARIOS) {
        const area = await prisma.area.findFirst({ where: { tenantId, name: scenario.area } });

        if (!area) {
            console.warn(`⚠️ Skipping scenario "${scenario.subject}": Area "${scenario.area}" not found.`);
            skippedCount++;
            continue;
        }

        // Find leaf request category (must be at last level and have no subcategories)
        const requestCategory = await findLeafRequestCategory(
            scenario.category,
            (scenario as any).parentCategory
        );

        if (!requestCategory) {
            console.warn(`⚠️ Skipping scenario "${scenario.subject}": Request Category "${scenario.category}" (leaf node) not found.`);
            skippedCount++;
            continue;
        }

        // Validate request category is a leaf (no subcategories and at last level)
        const requestTotalLevels = requestCategory.hierarchyLevel.hierarchy.levels.length;
        if (requestCategory.subcategories.length > 0 || requestCategory.hierarchyLevel.position !== requestTotalLevels) {
            console.warn(`⚠️ Skipping scenario "${scenario.subject}": Request Category "${scenario.category}" is not a leaf node (has ${requestCategory.subcategories.length} subcategories, level ${requestCategory.hierarchyLevel.position}/${requestTotalLevels}).`);
            skippedCount++;
            continue;
        }

        // Find leaf assignment category (must be at last level and have no subcategories)
        const assignmentCategory = await findLeafAssignmentCategory(area.id, scenario.assignmentCategory);

        if (!assignmentCategory) {
            console.warn(`⚠️ Skipping scenario "${scenario.subject}": Assignment Category "${scenario.assignmentCategory}" (leaf node) not found in Area "${scenario.area}".`);
            skippedCount++;
            continue;
        }

        // Validate assignment category is a leaf (no subcategories and at last level)
        const assignmentTotalLevels = assignmentCategory.hierarchyLevel.hierarchy.levels.length;
        if (assignmentCategory.subcategories.length > 0 || assignmentCategory.hierarchyLevel.position !== assignmentTotalLevels) {
            console.warn(`⚠️ Skipping scenario "${scenario.subject}": Assignment Category "${scenario.assignmentCategory}" is not a leaf node (has ${assignmentCategory.subcategories.length} subcategories, level ${assignmentCategory.hierarchyLevel.position}/${assignmentTotalLevels}).`);
            skippedCount++;
            continue;
        }

        const requester = getRandom(users);
        const assignee = getRandom(users);
        const status = getRandom(statuses);
        const priority = getRandom(priorities);
        const type = getRandom(assignmentTypes);

        const requestId = generateUuid();

        try {
            const request = await prisma.request.create({
                data: {
                    id: requestId,
                    tenantId,
                    issueSubject: scenario.subject,
                    description: scenario.description,
                    isDraft: false,
                    createdBy: requester.user.email,
                    requestAssignments: {
                        create: {
                            tenantId,
                            areaId: area.id,
                            statusId: status.id,
                            typeId: type.id,
                            priorityId: priority.id,
                            requestCategoryId: requestCategory.id,
                            assignmentCategoryId: assignmentCategory.id,
                            createdBy: 'system-seed',
                            assignedUsers: {
                                create: {
                                    tenantId,
                                    userTenantId: assignee.id,
                                    role: 'coordinator',
                                    createdBy: 'system-seed'
                                }
                            }
                        }
                    }
                }
            });
            console.log(`✅ Created Request: ${request.issueSubject} (${request.id})`);
            createdCount++;
        } catch (error: any) {
            console.error(`❌ Error creating request "${scenario.subject}":`, error.message);
            skippedCount++;
        }
    }

    console.log(`\n🎉 Request seeding completed.`);
    console.log(`   ✅ Created: ${createdCount} requests`);
    console.log(`   ⚠️  Skipped: ${skippedCount} requests`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
