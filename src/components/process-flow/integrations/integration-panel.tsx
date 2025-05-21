'use client';

import type React from 'react';
import { useState } from 'react';
import { AlertCircle, Check, Clock, ExternalLink, FileText, Filter, Info, Mail, MessageSquare, Plus, RefreshCw, Search, Settings, Star, Trash2 } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Tipos para las integraciones
type IntegrationType = 'servicenow' | 'jira' | 'rest' | 'teams' | 'slack' | 'email' | 'custom';
type IntegrationStatus = 'connected' | 'error' | 'pending' | 'disconnected';

interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  lastSync?: string;
  description: string;
  icon: React.ReactNode;
}

interface SyncLog {
  id: string;
  integration: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

interface Template {
  id: string;
  name: string;
  type: IntegrationType;
  description: string;
  popularity: number;
}

export default function IntegrationPanel() {
  const [activeTab, setActiveTab] = useState<IntegrationType>('servicenow');
  const [isConfigured, setIsConfigured] = useState({
    servicenow: false,
    jira: false,
    rest: false,
    teams: false,
    slack: false,
    email: false,
    custom: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  // Datos de ejemplo para las integraciones activas
  const [activeIntegrations, setActiveIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'ServiceNow Producción',
      type: 'servicenow',
      status: 'connected',
      lastSync: '2023-05-04T14:30:00',
      description: 'Integración principal con ServiceNow para gestión de incidentes',
      icon: (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="font-bold text-blue-700">SN</span>
        </div>
      ),
    },
    {
      id: '2',
      name: 'Jira Cloud',
      type: 'jira',
      status: 'error',
      lastSync: '2023-05-04T10:15:00',
      description: 'Integración con Jira para seguimiento de tareas',
      icon: (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="font-bold text-blue-700">J</span>
        </div>
      ),
    },
    {
      id: '3',
      name: 'API Interna',
      type: 'rest',
      status: 'connected',
      lastSync: '2023-05-04T13:45:00',
      description: 'Conexión con API interna para notificaciones',
      icon: (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="font-bold text-blue-700">API</span>
        </div>
      ),
    },
  ]);

  // Datos de ejemplo para el historial de sincronización
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      id: 'log1',
      integration: 'ServiceNow Producción',
      timestamp: '2023-05-04T14:30:00',
      status: 'success',
      message: 'Sincronización completada: 24 incidentes importados',
      details: 'Tiempo total: 3.2s, Nuevos: 5, Actualizados: 19',
    },
    {
      id: 'log2',
      integration: 'Jira Cloud',
      timestamp: '2023-05-04T10:15:00',
      status: 'error',
      message: 'Error de autenticación',
      details: 'Token de API expirado o inválido. Código de error: AUTH_401',
    },
    {
      id: 'log3',
      integration: 'API Interna',
      timestamp: '2023-05-04T13:45:00',
      status: 'success',
      message: 'Sincronización completada: 12 notificaciones enviadas',
      details: 'Tiempo total: 1.8s, Éxito: 12, Fallidas: 0',
    },
    {
      id: 'log4',
      integration: 'ServiceNow Producción',
      timestamp: '2023-05-04T08:30:00',
      status: 'warning',
      message: 'Sincronización parcial: 18 de 20 incidentes importados',
      details: '2 incidentes no pudieron ser importados debido a campos obligatorios faltantes',
    },
    {
      id: 'log5',
      integration: 'ServiceNow Producción',
      timestamp: '2023-05-03T14:30:00',
      status: 'success',
      message: 'Sincronización completada: 15 incidentes importados',
      details: 'Tiempo total: 2.5s, Nuevos: 3, Actualizados: 12',
    },
  ]);

  // Datos de ejemplo para las plantillas
  const [templates] = useState<Template[]>([
    {
      id: 'template1',
      name: 'ServiceNow ITSM Completo',
      type: 'servicenow',
      description: 'Configuración completa para ServiceNow ITSM con sincronización de incidentes, problemas y cambios',
      popularity: 4.8,
    },
    {
      id: 'template2',
      name: 'Jira Service Management',
      type: 'jira',
      description: 'Integración con Jira Service Management para gestión de tickets',
      popularity: 4.5,
    },
    {
      id: 'template3',
      name: 'REST API Básica',
      type: 'rest',
      description: 'Configuración básica para API REST con autenticación por token',
      popularity: 4.2,
    },
    {
      id: 'template4',
      name: 'Microsoft Teams Notificaciones',
      type: 'teams',
      description: 'Envío de notificaciones a canales de Microsoft Teams',
      popularity: 4.6,
    },
    {
      id: 'template5',
      name: 'Slack Alertas',
      type: 'slack',
      description: 'Sistema de alertas en canales de Slack',
      popularity: 4.4,
    },
  ]);

  const handleConfigure = (integration: IntegrationType) => {
    setIsConfigured((prev) => ({
      ...prev,
      [integration]: true,
    }));

    // Añadir la integración a la lista de activas
    const newIntegration: Integration = {
      id: `new-${Date.now()}`,
      name: getIntegrationDefaultName(integration),
      type: integration,
      status: 'connected',
      lastSync: new Date().toISOString(),
      description: `Nueva integración con ${getIntegrationDefaultName(integration)}`,
      icon: getIntegrationIcon(integration),
    };

    setActiveIntegrations((prev) => [...prev, newIntegration]);

    // Añadir un log de sincronización
    const newLog: SyncLog = {
      id: `log-${Date.now()}`,
      integration: newIntegration.name,
      timestamp: new Date().toISOString(),
      status: 'success',
      message: `Configuración inicial completada para ${newIntegration.name}`,
      details: 'Conexión establecida correctamente',
    };

    setSyncLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteIntegration = (id: string) => {
    setActiveIntegrations((prev) => prev.filter((integration) => integration.id !== id));

    // Añadir un log de eliminación
    const integration = activeIntegrations.find((i) => i.id === id);
    if (integration) {
      const newLog: SyncLog = {
        id: `log-${Date.now()}`,
        integration: integration.name,
        timestamp: new Date().toISOString(),
        status: 'warning',
        message: `Integración ${integration.name} eliminada`,
        details: 'Todos los datos asociados han sido eliminados',
      };

      setSyncLogs((prev) => [newLog, ...prev]);
    }

    setShowDeleteDialog(false);
  };

  const handleSyncNow = (id: string) => {
    // Simular una sincronización
    const integration = activeIntegrations.find((i) => i.id === id);
    if (integration) {
      // Actualizar la fecha de última sincronización
      setActiveIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, lastSync: new Date().toISOString() } : i)));

      // Añadir un log de sincronización
      const newLog: SyncLog = {
        id: `log-${Date.now()}`,
        integration: integration.name,
        timestamp: new Date().toISOString(),
        status: 'success',
        message: `Sincronización manual completada para ${integration.name}`,
        details: 'Tiempo total: 2.1s, Elementos procesados: 15',
      };

      setSyncLogs((prev) => [newLog, ...prev]);
    }
  };

  const getIntegrationDefaultName = (type: IntegrationType): string => {
    const names: Record<IntegrationType, string> = {
      servicenow: 'ServiceNow',
      jira: 'Jira',
      rest: 'REST API',
      teams: 'Microsoft Teams',
      slack: 'Slack',
      email: 'Email',
      custom: 'Integración Personalizada',
    };
    return names[type];
  };

  const getIntegrationIcon = (type: IntegrationType): React.ReactNode => {
    const icons: Record<IntegrationType, React.ReactNode> = {
      servicenow: (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="font-bold text-blue-700">SN</span>
        </div>
      ),
      jira: (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="font-bold text-blue-700">J</span>
        </div>
      ),
      rest: (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="font-bold text-blue-700">API</span>
        </div>
      ),
      teams: (
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-purple-700" />
        </div>
      ),
      slack: (
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-green-700" />
        </div>
      ),
      email: (
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <Mail className="w-4 h-4 text-yellow-700" />
        </div>
      ),
      custom: (
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Plus className="w-4 h-4 text-gray-700" />
        </div>
      ),
    };
    return icons[type];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" /> Conectado
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Error
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pendiente
          </Badge>
        );
      case 'disconnected':
        return <Badge className="bg-gray-100 text-gray-800">Desconectado</Badge>;
    }
  };

  const getLogStatusBadge = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Éxito</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>;
    }
  };

  const filteredTemplates = templates.filter((template) => template.name.toLowerCase().includes(searchQuery.toLowerCase()) || template.description.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderConfigurationForm = () => {
    switch (activeTab) {
      case 'servicenow':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="instance_url">URL de la Instancia</Label>
              <Input
                id="instance_url"
                placeholder="https://your-instance.service-now.com"
                defaultValue={isConfigured.servicenow ? 'https://acme-demo.service-now.com' : ''}
                disabled={isConfigured.servicenow}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input id="username" placeholder="admin" defaultValue={isConfigured.servicenow ? 'itil_admin' : ''} disabled={isConfigured.servicenow} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••••" defaultValue={isConfigured.servicenow ? '••••••••' : ''} disabled={isConfigured.servicenow} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sync_incidents">Sincronizar Incidentes</Label>
                <Switch id="sync_incidents" defaultChecked={isConfigured.servicenow} />
              </div>
              <p className="text-sm text-muted-foreground">Permite que los incidentes de ServiceNow se sincronicen con los flujos de trabajo</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sync_changes">Sincronizar Cambios</Label>
                <Switch id="sync_changes" defaultChecked={isConfigured.servicenow} />
              </div>
              <p className="text-sm text-muted-foreground">Permite que los cambios de ServiceNow se sincronicen con los flujos de trabajo</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sync_problems">Sincronizar Problemas</Label>
                <Switch id="sync_problems" defaultChecked={isConfigured.servicenow} />
              </div>
              <p className="text-sm text-muted-foreground">Permite que los problemas de ServiceNow se sincronicen con los flujos de trabajo</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced">
                <AccordionTrigger className="text-sm font-medium">Opciones Avanzadas</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="webhook_url">URL de Webhook</Label>
                      <Input
                        id="webhook_url"
                        placeholder="https://your-webhook-url.com"
                        defaultValue={isConfigured.servicenow ? 'https://flow-builder.example.com/api/servicenow/webhook' : ''}
                        disabled={isConfigured.servicenow}
                      />
                      <p className="text-sm text-muted-foreground">URL para recibir notificaciones de ServiceNow</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sync_interval">Intervalo de Sincronización</Label>
                      <Select defaultValue="15">
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar intervalo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Cada 5 minutos</SelectItem>
                          <SelectItem value="15">Cada 15 minutos</SelectItem>
                          <SelectItem value="30">Cada 30 minutos</SelectItem>
                          <SelectItem value="60">Cada hora</SelectItem>
                          <SelectItem value="360">Cada 6 horas</SelectItem>
                          <SelectItem value="720">Cada 12 horas</SelectItem>
                          <SelectItem value="1440">Cada día</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom_fields">Campos Personalizados (JSON)</Label>
                      <Textarea id="custom_fields" placeholder='{"u_category": "incident", "u_priority": "high"}' rows={3} />
                      <p className="text-sm text-muted-foreground">Campos personalizados para incluir en las solicitudes a ServiceNow</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="debug_mode">Modo Debug</Label>
                        <Switch id="debug_mode" />
                      </div>
                      <p className="text-sm text-muted-foreground">Habilita logs detallados para depuración</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {isConfigured.servicenow && (
              <div className="space-y-2 p-4 border rounded bg-green-50">
                <h3 className="font-medium">Conexión Exitosa</h3>
                <p className="text-sm">La conexión con ServiceNow se ha establecido correctamente. Puedes usar esta integración en tus flujos de trabajo.</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Abrir ServiceNow
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="w-3 h-3" />
                    Configuración Avanzada
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'jira':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jira_url">URL de Jira</Label>
              <Input id="jira_url" placeholder="https://your-domain.atlassian.net" defaultValue={isConfigured.jira ? 'https://acme-itil.atlassian.net' : ''} disabled={isConfigured.jira} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jira_email">Email</Label>
              <Input id="jira_email" type="email" placeholder="your-email@example.com" defaultValue={isConfigured.jira ? 'admin@acme.com' : ''} disabled={isConfigured.jira} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jira_token">API Token</Label>
              <Input id="jira_token" placeholder="Tu token de API de Jira" defaultValue={isConfigured.jira ? '••••••••••••••••' : ''} disabled={isConfigured.jira} />
              <p className="text-sm text-muted-foreground">Puedes generar un token de API en tu perfil de Atlassian</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jira_project">Proyecto por Defecto</Label>
              <Input id="jira_project" placeholder="ITIL" defaultValue={isConfigured.jira ? 'ITIL' : ''} disabled={isConfigured.jira} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sync_issues">Sincronizar Issues</Label>
                <Switch id="sync_issues" defaultChecked={isConfigured.jira} />
              </div>
              <p className="text-sm text-muted-foreground">Permite que los issues de Jira se sincronicen con los flujos de trabajo</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="create_issues">Crear Issues</Label>
                <Switch id="create_issues" defaultChecked={isConfigured.jira} />
              </div>
              <p className="text-sm text-muted-foreground">Permite crear issues en Jira desde los flujos de trabajo</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced">
                <AccordionTrigger className="text-sm font-medium">Opciones Avanzadas</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="jira_issue_types">Tipos de Issues</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="task">Tareas</SelectItem>
                          <SelectItem value="bug">Bugs</SelectItem>
                          <SelectItem value="story">Historias</SelectItem>
                          <SelectItem value="epic">Epics</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jira_webhook">Webhook de Jira</Label>
                      <Input id="jira_webhook" placeholder="URL del webhook" defaultValue={isConfigured.jira ? 'https://flow-builder.example.com/api/jira/webhook' : ''} />
                      <p className="text-sm text-muted-foreground">URL para recibir notificaciones de Jira</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jira_custom_fields">Campos Personalizados (JSON)</Label>
                      <Textarea id="jira_custom_fields" placeholder='{"customfield_10001": "value", "customfield_10002": "value"}' rows={3} />
                      <p className="text-sm text-muted-foreground">Campos personalizados para incluir en las solicitudes a Jira</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="jira_attachments">Sincronizar Adjuntos</Label>
                        <Switch id="jira_attachments" />
                      </div>
                      <p className="text-sm text-muted-foreground">Sincroniza archivos adjuntos entre Jira y el Flow Builder</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {isConfigured.jira && (
              <div className="space-y-2 p-4 border rounded bg-green-50">
                <h3 className="font-medium">Conexión Exitosa</h3>
                <p className="text-sm">La conexión con Jira se ha establecido correctamente. Puedes usar esta integración en tus flujos de trabajo.</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Abrir Jira
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="w-3 h-3" />
                    Configuración Avanzada
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'teams':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teams_webhook">URL del Webhook de Teams</Label>
              <Input
                id="teams_webhook"
                placeholder="https://outlook.office.com/webhook/..."
                defaultValue={isConfigured.teams ? 'https://outlook.office.com/webhook/example' : ''}
                disabled={isConfigured.teams}
              />
              <p className="text-sm text-muted-foreground">URL del webhook del canal de Microsoft Teams</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teams_channel">Nombre del Canal</Label>
              <Input id="teams_channel" placeholder="General" defaultValue={isConfigured.teams ? 'ITIL-Notificaciones' : ''} disabled={isConfigured.teams} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teams_message_template">Plantilla de Mensaje</Label>
              <Textarea
                id="teams_message_template"
                placeholder="Nuevo incidente: {incident.number} - {incident.short_description}"
                defaultValue={isConfigured.teams ? 'Nuevo incidente: {incident.number} - {incident.short_description}\nPrioridad: {incident.priority}\nAsignado a: {incident.assigned_to}' : ''}
                disabled={isConfigured.teams}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">Plantilla para los mensajes enviados a Teams. Usa {'{variable}'} para insertar datos dinámicos.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="teams_notify_incidents">Notificar Incidentes</Label>
                <Switch id="teams_notify_incidents" defaultChecked={isConfigured.teams} />
              </div>
              <p className="text-sm text-muted-foreground">Envía notificaciones cuando se creen o actualicen incidentes</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="teams_notify_changes">Notificar Cambios</Label>
                <Switch id="teams_notify_changes" defaultChecked={isConfigured.teams} />
              </div>
              <p className="text-sm text-muted-foreground">Envía notificaciones cuando se creen o actualicen cambios</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="teams_notify_approvals">Notificar Aprobaciones</Label>
                <Switch id="teams_notify_approvals" defaultChecked={isConfigured.teams} />
              </div>
              <p className="text-sm text-muted-foreground">Envía notificaciones cuando se requieran aprobaciones</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced">
                <AccordionTrigger className="text-sm font-medium">Opciones Avanzadas</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="teams_card_color">Color de Tarjeta</Label>
                      <Input id="teams_card_color" type="color" defaultValue="#0078D7" />
                      <p className="text-sm text-muted-foreground">Color de la barra lateral de las tarjetas adaptativas</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="teams_adaptive_cards">Usar Tarjetas Adaptativas</Label>
                        <Switch id="teams_adaptive_cards" defaultChecked={true} />
                      </div>
                      <p className="text-sm text-muted-foreground">Usa tarjetas adaptativas en lugar de mensajes de texto plano</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="teams_actionable">Mensajes Accionables</Label>
                        <Switch id="teams_actionable" defaultChecked={true} />
                      </div>
                      <p className="text-sm text-muted-foreground">Permite acciones directas desde Teams (aprobar, rechazar, etc.)</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {isConfigured.teams && (
              <div className="space-y-2 p-4 border rounded bg-green-50">
                <h3 className="font-medium">Conexión Exitosa</h3>
                <p className="text-sm">La conexión con Microsoft Teams se ha establecido correctamente. Las notificaciones se enviarán al canal configurado.</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Abrir Teams
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Enviar Mensaje de Prueba
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'slack':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="slack_webhook">URL del Webhook de Slack</Label>
              <Input
                id="slack_webhook"
                placeholder="https://hooks.slack.com/services/..."
                defaultValue={isConfigured.slack ? 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX' : ''}
                disabled={isConfigured.slack}
              />
              <p className="text-sm text-muted-foreground">URL del webhook del canal de Slack</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slack_channel">Canal</Label>
              <Input id="slack_channel" placeholder="#general" defaultValue={isConfigured.slack ? '#itil-alerts' : ''} disabled={isConfigured.slack} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slack_username">Nombre de Usuario del Bot</Label>
              <Input id="slack_username" placeholder="ITIL Bot" defaultValue={isConfigured.slack ? 'ITIL Flow Bot' : ''} disabled={isConfigured.slack} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slack_icon">Emoji del Bot</Label>
              <Input id="slack_icon" placeholder=":robot_face:" defaultValue={isConfigured.slack ? ':gear:' : ''} disabled={isConfigured.slack} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slack_notify_incidents">Notificar Incidentes</Label>
                <Switch id="slack_notify_incidents" defaultChecked={isConfigured.slack} />
              </div>
              <p className="text-sm text-muted-foreground">Envía notificaciones cuando se creen o actualicen incidentes</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slack_notify_sla">Notificar Violaciones de SLA</Label>
                <Switch id="slack_notify_sla" defaultChecked={isConfigured.slack} />
              </div>
              <p className="text-sm text-muted-foreground">Envía alertas cuando un SLA esté en riesgo o se haya violado</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced">
                <AccordionTrigger className="text-sm font-medium">Opciones Avanzadas</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="slack_blocks">Usar Bloques de Slack</Label>
                      <Switch id="slack_blocks" defaultChecked={true} />
                      <p className="text-sm text-muted-foreground">Usa el formato de bloques de Slack para mensajes más ricos</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slack_template">Plantilla JSON de Bloques</Label>
                      <Textarea id="slack_template" placeholder='[{"type": "section", "text": {"type": "mrkdwn", "text": "*Nuevo Incidente:* {number}"}}]' rows={4} />
                      <p className="text-sm text-muted-foreground">Plantilla JSON para los bloques de Slack. Usa {'{variable}'} para datos dinámicos.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="slack_thread">Usar Hilos</Label>
                        <Switch id="slack_thread" defaultChecked={true} />
                      </div>
                      <p className="text-sm text-muted-foreground">Agrupa actualizaciones relacionadas en hilos de conversación</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {isConfigured.slack && (
              <div className="space-y-2 p-4 border rounded bg-green-50">
                <h3 className="font-medium">Conexión Exitosa</h3>
                <p className="text-sm">La conexión con Slack se ha establecido correctamente. Las notificaciones se enviarán al canal configurado.</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Abrir Slack
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Enviar Mensaje de Prueba
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email_server">Servidor SMTP</Label>
              <Input id="email_server" placeholder="smtp.example.com" defaultValue={isConfigured.email ? 'smtp.office365.com' : ''} disabled={isConfigured.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_port">Puerto</Label>
              <Input id="email_port" placeholder="587" defaultValue={isConfigured.email ? '587' : ''} disabled={isConfigured.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_username">Usuario</Label>
              <Input id="email_username" placeholder="user@example.com" defaultValue={isConfigured.email ? 'itil@acme.com' : ''} disabled={isConfigured.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_password">Contraseña</Label>
              <Input id="email_password" type="password" placeholder="••••••••" defaultValue={isConfigured.email ? '••••••••' : ''} disabled={isConfigured.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_from">Remitente</Label>
              <Input id="email_from" placeholder="ITIL System <itil@example.com>" defaultValue={isConfigured.email ? 'ITIL Flow Builder <itil@acme.com>' : ''} disabled={isConfigured.email} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_ssl">Usar SSL/TLS</Label>
                <Switch id="email_ssl" defaultChecked={true} disabled={isConfigured.email} />
              </div>
              <p className="text-sm text-muted-foreground">Habilita la conexión segura con el servidor SMTP</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_template">Plantilla de Email</Label>
              <Textarea
                id="email_template"
                placeholder="<h1>Nuevo Incidente: {incident.number}</h1><p>{incident.description}</p>"
                defaultValue={
                  isConfigured.email
                    ? '<h1>Notificación de ITIL Flow Builder</h1><p>Se ha {action} el incidente <strong>{incident.number}</strong>: {incident.short_description}</p><p>Prioridad: {incident.priority}</p><p>Asignado a: {incident.assigned_to}</p>'
                    : ''
                }
                disabled={isConfigured.email}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">Plantilla HTML para los emails. Usa {'{variable}'} para insertar datos dinámicos.</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced">
                <AccordionTrigger className="text-sm font-medium">Opciones Avanzadas</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="email_cc">CC por Defecto</Label>
                      <Input id="email_cc" placeholder="support@example.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email_bcc">BCC por Defecto</Label>
                      <Input id="email_bcc" placeholder="archive@example.com" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email_attachments">Permitir Adjuntos</Label>
                        <Switch id="email_attachments" defaultChecked={true} />
                      </div>
                      <p className="text-sm text-muted-foreground">Permite adjuntar archivos a los emails</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email_retry">Intentos de Reenvío</Label>
                      <Input id="email_retry" type="number" min="0" max="10" defaultValue="3" />
                      <p className="text-sm text-muted-foreground">Número de intentos si falla el envío</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {isConfigured.email && (
              <div className="space-y-2 p-4 border rounded bg-green-50">
                <h3 className="font-medium">Conexión Exitosa</h3>
                <p className="text-sm">La configuración de email se ha completado correctamente. Los emails se enviarán desde la dirección configurada.</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Mail className="w-3 h-3" />
                    Enviar Email de Prueba
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="w-3 h-3" />
                    Configuración Avanzada
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'rest':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="base_url">URL Base</Label>
              <Input id="base_url" placeholder="https://api.example.com" defaultValue={isConfigured.rest ? 'https://api.acme.com/v1' : ''} disabled={isConfigured.rest} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth_type">Tipo de Autenticación</Label>
              <Select defaultValue={isConfigured.rest ? 'bearer' : 'none'} disabled={isConfigured.rest}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguna</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="apikey">API Key</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth_token">Token de Autenticación</Label>
              <Input id="auth_token" placeholder="Tu token de autenticación" defaultValue={isConfigured.rest ? '••••••••••••••••' : ''} disabled={isConfigured.rest} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headers">Headers (JSON)</Label>
              <Textarea
                id="headers"
                placeholder='{"Content-Type": "application/json"}'
                defaultValue={isConfigured.rest ? '{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}' : ''}
                disabled={isConfigured.rest}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Endpoints</Label>
              <div className="space-y-4">
                <div className="p-3 border rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>GET</Badge>
                    <span className="font-mono text-sm">/tickets</span>
                  </div>
                  <Input placeholder="Descripción del endpoint" defaultValue={isConfigured.rest ? 'Obtener lista de tickets' : ''} disabled={isConfigured.rest} className="mb-2" />
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" disabled={isConfigured.rest}>
                      Probar
                    </Button>
                  </div>
                </div>

                <div className="p-3 border rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>POST</Badge>
                    <span className="font-mono text-sm">/tickets</span>
                  </div>
                  <Input placeholder="Descripción del endpoint" defaultValue={isConfigured.rest ? 'Crear nuevo ticket' : ''} disabled={isConfigured.rest} className="mb-2" />
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" disabled={isConfigured.rest}>
                      Probar
                    </Button>
                  </div>
                </div>

                <div className="p-3 border rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>PUT</Badge>
                    <span className="font-mono text-sm">/tickets/{'{id}'}</span>
                  </div>
                  <Input placeholder="Descripción del endpoint" defaultValue={isConfigured.rest ? 'Actualizar ticket existente' : ''} disabled={isConfigured.rest} className="mb-2" />
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" disabled={isConfigured.rest}>
                      Probar
                    </Button>
                  </div>
                </div>

                {!isConfigured.rest && (
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Endpoint
                  </Button>
                )}
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced">
                <AccordionTrigger className="text-sm font-medium">Opciones Avanzadas</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="timeout">Timeout (ms)</Label>
                      <Input id="timeout" type="number" min="1000" step="1000" defaultValue="30000" />
                      <p className="text-sm text-muted-foreground">Tiempo máximo de espera para las solicitudes</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retry_count">Intentos de Reintento</Label>
                      <Input id="retry_count" type="number" min="0" max="5" defaultValue="3" />
                      <p className="text-sm text-muted-foreground">Número de reintentos si falla la solicitud</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="verify_ssl">Verificar SSL</Label>
                        <Switch id="verify_ssl" defaultChecked={true} />
                      </div>
                      <p className="text-sm text-muted-foreground">Verifica los certificados SSL del servidor</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="log_requests">Registrar Solicitudes</Label>
                        <Switch id="log_requests" defaultChecked={true} />
                      </div>
                      <p className="text-sm text-muted-foreground">Guarda un registro de todas las solicitudes y respuestas</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {isConfigured.rest && (
              <div className="space-y-2 p-4 border rounded bg-green-50">
                <h3 className="font-medium">Configuración Exitosa</h3>
                <p className="text-sm">La configuración de la API REST se ha completado correctamente. Puedes usar estos endpoints en tus flujos de trabajo.</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="w-3 h-3" />
                    Configuración Avanzada
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'custom':
        return (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Crear Conector Personalizado</h3>
            <p className="text-muted-foreground max-w-md mb-6">Crea un conector personalizado para integrar tu Flow Builder con cualquier sistema externo mediante API REST o SDK personalizado.</p>
            <Button>Comenzar</Button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderActiveIntegrations = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Integraciones Activas</h3>
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar Estado
          </Button>
        </div>

        {activeIntegrations.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-gray-50">
            <p className="text-muted-foreground">No hay integraciones configuradas</p>
            <Button variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Añadir Integración
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeIntegrations.map((integration) => (
              <Card key={integration.id} className="overflow-hidden">
                <div className={`h-1 ${integration.status === 'connected' ? 'bg-green-500' : integration.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {integration.icon}
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">{getStatusBadge(integration.status)}</div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{integration.lastSync ? `Última sincronización: ${formatDate(integration.lastSync)}` : 'No sincronizado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleSyncNow(integration.id)}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sincronizar ahora</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Configuración</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Dialog
                              open={showDeleteDialog && selectedIntegration === integration.id}
                              onOpenChange={(open) => {
                                setShowDeleteDialog(open);
                                if (open) setSelectedIntegration(integration.id);
                              }}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Eliminar Integración</DialogTitle>
                                  <DialogDescription>¿Estás seguro de que deseas eliminar la integración &quot;{integration.name}&quot;? Esta acción no se puede deshacer.</DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                    Cancelar
                                  </Button>
                                  <Button variant="destructive" onClick={() => handleDeleteIntegration(integration.id)}>
                                    Eliminar
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSyncHistory = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Historial de Sincronización</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="w-4 h-4 mr-1" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="w-4 h-4 mr-1" />
              Exportar
            </Button>
          </div>
        </div>

        {syncLogs.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-gray-50">
            <p className="text-muted-foreground">No hay registros de sincronización</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Integración</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(log.timestamp)}</TableCell>
                    <TableCell>{log.integration}</TableCell>
                    <TableCell>{getLogStatusBadge(log.status)}</TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Info className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalles de Sincronización</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-1">Integración</h4>
                              <p>{log.integration}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Fecha y Hora</h4>
                              <p>{formatDate(log.timestamp)}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Estado</h4>
                              <p>{getLogStatusBadge(log.status)}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Mensaje</h4>
                              <p>{log.message}</p>
                            </div>
                            {log.details && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">Detalles</h4>
                                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">{log.details}</pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  };

  const renderTemplates = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Plantillas de Integración</h3>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar plantillas..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${selectedTemplate === template.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedTemplate(template.id)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIntegrationIcon(template.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(template.popularity) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="outline">{getIntegrationDefaultName(template.type)}</Badge>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab(template.type);
                        }}>
                        Usar Plantilla
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderDocumentation = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Documentación de Integraciones</h3>
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="w-4 h-4 mr-1" />
            Documentación Completa
          </Button>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="overview">
            <AccordionTrigger>Visión General</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <p>
                  Las integraciones permiten conectar el ITIL Flow Builder con sistemas externos para sincronizar datos, enviar notificaciones y automatizar flujos de trabajo. Cada integración
                  proporciona funcionalidades específicas según el sistema al que se conecta.
                </p>
                <p>
                  Para configurar una integración, selecciona el sistema deseado en el panel izquierdo y completa la información de conexión requerida. Una vez configurada, la integración estará
                  disponible para su uso en los flujos de trabajo.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="servicenow">
            <AccordionTrigger>ServiceNow</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <p>
                  La integración con ServiceNow permite sincronizar incidentes, problemas y cambios entre el Flow Builder y tu instancia de ServiceNow. También puedes crear nuevos registros en
                  ServiceNow desde tus flujos de trabajo.
                </p>
                <h4 className="font-medium mt-4">Requisitos</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>URL de la instancia de ServiceNow</li>
                  <li>Credenciales de usuario con permisos adecuados</li>
                  <li>Roles de web_service_admin y admin para el usuario</li>
                </ul>
                <h4 className="font-medium mt-4">Funcionalidades</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Sincronización bidireccional de incidentes</li>
                  <li>Creación y actualización de problemas</li>
                  <li>Gestión de cambios y aprobaciones</li>
                  <li>Notificaciones en tiempo real mediante webhooks</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="jira">
            <AccordionTrigger>Jira</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <p>
                  La integración con Jira permite sincronizar issues y proyectos entre el Flow Builder y tu instancia de Jira. Puedes crear, actualizar y seguir el estado de los issues directamente
                  desde tus flujos de trabajo.
                </p>
                <h4 className="font-medium mt-4">Requisitos</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>URL de la instancia de Jira</li>
                  <li>Email de usuario</li>
                  <li>Token de API (generado desde tu perfil de Atlassian)</li>
                </ul>
                <h4 className="font-medium mt-4">Funcionalidades</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Creación y actualización de issues</li>
                  <li>Asignación de tareas</li>
                  <li>Seguimiento de estados y transiciones</li>
                  <li>Sincronización de comentarios</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rest">
            <AccordionTrigger>REST API</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <p>
                  La integración con REST API permite conectar el Flow Builder con cualquier sistema que exponga una API REST. Puedes configurar endpoints personalizados para enviar y recibir datos.
                </p>
                <h4 className="font-medium mt-4">Configuración</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>URL base de la API</li>
                  <li>Método de autenticación (None, Basic, Bearer, API Key)</li>
                  <li>Headers personalizados</li>
                  <li>Endpoints para diferentes operaciones</li>
                </ul>
                <h4 className="font-medium mt-4">Ejemplos de Uso</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Integración con sistemas legacy</li>
                  <li>Conexión con APIs de terceros</li>
                  <li>Envío de datos a sistemas de monitoreo</li>
                  <li>Recuperación de información de bases de datos externas</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="messaging">
            <AccordionTrigger>Sistemas de Mensajería</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <p>Las integraciones con sistemas de mensajería como Microsoft Teams, Slack y Email permiten enviar notificaciones y alertas desde tus flujos de trabajo.</p>
                <h4 className="font-medium mt-4">Microsoft Teams</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Requiere un webhook de canal configurado en Teams</li>
                  <li>Soporta tarjetas adaptativas para mensajes interactivos</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  };

  return (
    <>
      <Tabs defaultValue={activeTab} className="w-full space-y-4" onValueChange={(value) => setActiveTab(value as IntegrationType)}>
        <TabsList>
          <TabsTrigger value="servicenow">ServiceNow</TabsTrigger>
          <TabsTrigger value="jira">Jira</TabsTrigger>
          <TabsTrigger value="teams">Microsoft Teams</TabsTrigger>
          <TabsTrigger value="slack">Slack</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="rest">REST API</TabsTrigger>
          <TabsTrigger value="custom">Personalizado</TabsTrigger>
        </TabsList>

        <div className="flex gap-8">
          <Card className="w-1/3">
            <CardHeader>
              <CardTitle>Integraciones</CardTitle>
              <CardDescription>Gestiona las integraciones con tus herramientas y servicios favoritos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TabsContent value={activeTab} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Estado</h4>
                  <Switch id="integration_status" defaultChecked={isConfigured[activeTab]} />
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Activar Integración</h4>
                  <Switch id="integration_enabled" defaultChecked={isConfigured[activeTab]} />
                </div>

                <Button disabled={isConfigured[activeTab]} onClick={() => handleConfigure(activeTab)}>
                  {isConfigured[activeTab] ? 'Configurado' : 'Configurar'}
                </Button>
              </TabsContent>
            </CardContent>
          </Card>

          <Card className="w-2/3">
            <CardHeader>
              <CardTitle>Configuración de {getIntegrationDefaultName(activeTab)}</CardTitle>
              <CardDescription>Configura los detalles de la integración con {getIntegrationDefaultName(activeTab)}.</CardDescription>
            </CardHeader>
            <CardContent>{renderConfigurationForm()}</CardContent>
          </Card>
        </div>
      </Tabs>

      <div className="mt-8">
        <Tabs defaultValue="active" className="w-full space-y-4">
          <TabsList>
            <TabsTrigger value="active">Integraciones Activas</TabsTrigger>
            <TabsTrigger value="history">Historial de Sincronización</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="documentation">Documentación</TabsTrigger>
          </TabsList>

          <TabsContent value="active">{renderActiveIntegrations()}</TabsContent>

          <TabsContent value="history">{renderSyncHistory()}</TabsContent>

          <TabsContent value="templates">{renderTemplates()}</TabsContent>

          <TabsContent value="documentation">{renderDocumentation()}</TabsContent>
        </Tabs>
      </div>
    </>
  );
}
