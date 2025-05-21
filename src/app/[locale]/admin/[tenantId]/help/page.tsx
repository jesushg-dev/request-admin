'use client';

import type React from 'react';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { BookOpen, FileText, HelpCircle, MessageSquare, Search, Video } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('guides');
  const [, startTransition] = useTransition();
  const language = 'es'; // This should be dynamically set based on the user's locale
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  const handleTabChange = (value: string) => {
    startTransition(() => {
      setActiveTab(value);
    });
  };

  const texts = {
    title: language === 'es' ? 'Centro de Ayuda' : 'Help Center',
    subtitle: language === 'es' ? 'Encuentra respuestas a tus preguntas y guías de uso del sistema' : 'Find answers to your questions and system usage guides',
    search: language === 'es' ? 'Buscar guías y preguntas frecuentes...' : 'Search guides and FAQs...',
    guides: language === 'es' ? 'Guías' : 'Guides',
    videos: language === 'es' ? 'Videos' : 'Videos',
    faqs: language === 'es' ? 'Preguntas frecuentes' : 'FAQs',
    contact: language === 'es' ? 'Contacto' : 'Contact',
    viewAll: language === 'es' ? 'Ver todas las guías' : 'View all guides',
    viewVideo: language === 'es' ? 'Ver video' : 'Watch video',
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{texts.title}</h1>
          <p className="text-muted-foreground">{texts.subtitle}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={texts.search} className="pl-10" value={searchQuery} onChange={handleSearch} />
        </div>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="guides" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="guides">
              <BookOpen className="mr-2 h-4 w-4" />
              {texts.guides}
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="mr-2 h-4 w-4" />
              {texts.videos}
            </TabsTrigger>
            <TabsTrigger value="faqs">
              <HelpCircle className="mr-2 h-4 w-4" />
              {texts.faqs}
            </TabsTrigger>
            <TabsTrigger value="contact">
              <MessageSquare className="mr-2 h-4 w-4" />
              {texts.contact}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guides">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Primeros pasos</CardTitle>
                  </div>
                  <CardDescription>Aprende lo básico para comenzar a usar el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Introducción al sistema
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Crear tu primera solicitud
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Navegación por el dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Configuración de tu perfil
                      </Link>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="#">Ver todas las guías básicas</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle>Gestión de solicitudes</CardTitle>
                  </div>
                  <CardDescription>Aprende a gestionar solicitudes de manera eficiente</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Estados de las solicitudes
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Asignación de solicitudes
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Cambio de prioridades
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Comentarios y seguimiento
                      </Link>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="#">Ver todas las guías de gestión</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle>Comunicación</CardTitle>
                  </div>
                  <CardDescription>Aprende a comunicarte efectivamente en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Sistema de mensajería
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Notificaciones y alertas
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Menciones y etiquetas
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Compartir archivos
                      </Link>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="#">Ver todas las guías de comunicación</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Reportes y análisis</CardTitle>
                  </div>
                  <CardDescription>Aprende a utilizar las herramientas de análisis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Generación de reportes
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Análisis de métricas
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Exportación de datos
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Dashboards personalizados
                      </Link>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="#">Ver todas las guías de reportes</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Administración</CardTitle>
                  </div>
                  <CardDescription>Guías para administradores del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Gestión de usuarios
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Configuración de flujos de trabajo
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Personalización del sistema
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Seguridad y permisos
                      </Link>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="#">Ver todas las guías de administración</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Flujos de trabajo</CardTitle>
                  </div>
                  <CardDescription>Aprende a configurar y utilizar flujos de trabajo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Creación de flujos personalizados
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Reglas de transición de estados
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Automatización de procesos
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">
                        Plantillas de flujos de trabajo
                      </Link>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="#">Ver todas las guías de flujos</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <CardTitle>Introducción al sistema</CardTitle>
                  </div>
                  <CardDescription>Visión general de las funcionalidades principales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <Badge>5:32</Badge>
                    <p className="mt-2 text-sm text-muted-foreground">Este video te muestra una visión general del sistema y sus principales funcionalidades.</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" className="w-full">
                    Ver video
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <CardTitle>Creación de solicitudes</CardTitle>
                  </div>
                  <CardDescription>Aprende a crear y gestionar solicitudes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <Badge>4:15</Badge>
                    <p className="mt-2 text-sm text-muted-foreground">Este tutorial te muestra paso a paso cómo crear y gestionar solicitudes en el sistema.</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" className="w-full">
                    Ver video
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <CardTitle>Flujos de trabajo</CardTitle>
                  </div>
                  <CardDescription>Configuración de flujos de trabajo personalizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <Badge>7:48</Badge>
                    <p className="mt-2 text-sm text-muted-foreground">Aprende a configurar flujos de trabajo personalizados para diferentes tipos de solicitudes.</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" className="w-full">
                    Ver video
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <CardTitle>Reportes y análisis</CardTitle>
                  </div>
                  <CardDescription>Generación de reportes personalizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <Badge>6:22</Badge>
                    <p className="mt-2 text-sm text-muted-foreground">Este tutorial te muestra cómo generar reportes personalizados y analizar datos en el sistema.</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" className="w-full">
                    Ver video
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <CardTitle>Administración de usuarios</CardTitle>
                  </div>
                  <CardDescription>Gestión de usuarios y permisos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <Badge>5:55</Badge>
                    <p className="mt-2 text-sm text-muted-foreground">Aprende a gestionar usuarios, roles y permisos en el sistema.</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" className="w-full">
                    Ver video
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <CardTitle>Notificaciones y alertas</CardTitle>
                  </div>
                  <CardDescription>Configuración de notificaciones personalizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <Badge>3:47</Badge>
                    <p className="mt-2 text-sm text-muted-foreground">Este tutorial te muestra cómo configurar notificaciones personalizadas en el sistema.</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" className="w-full">
                    Ver video
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contacto de soporte</CardTitle>
                  <CardDescription>Ponte en contacto con nuestro equipo de soporte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Correo electrónico</h3>
                      <p className="text-sm text-muted-foreground">soporte@claro.com.ni</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Teléfono</h3>
                      <p className="text-sm text-muted-foreground">+505 2222-3333</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Horario de atención</h3>
                      <p className="text-sm text-muted-foreground">Lunes a viernes de 8:00 AM a 5:00 PM</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Enviar mensaje al soporte</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Solicitar capacitación</CardTitle>
                  <CardDescription>Solicita una sesión de capacitación para tu equipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Ofrecemos sesiones de capacitación personalizadas para equipos de todos los tamaños. Nuestros expertos pueden ayudarte a sacar el máximo provecho del sistema.
                    </p>
                    <div>
                      <h3 className="text-sm font-medium">Tipos de capacitación</h3>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>• Capacitación básica para nuevos usuarios</li>
                        <li>• Capacitación avanzada para administradores</li>
                        <li>• Capacitación específica por módulos</li>
                        <li>• Capacitación para la generación de reportes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Solicitar capacitación</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faqs">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <Card className="cursor-pointer transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">¿Cómo puedo cambiar mi contraseña?</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">¿Qué hago si mi solicitud está atascada en un estado?</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">¿Puedo cancelar una solicitud ya enviada?</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">¿Cómo puedo ver todas mis solicitudes pendientes?</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">¿Cómo funcionan los flujos de trabajo?</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="hidden md:block">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Selecciona una pregunta</CardTitle>
                    <CardDescription>Haz clic en una pregunta de la lista para ver su respuesta aquí</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-40 border rounded-md">
                      <p className="text-muted-foreground">Selecciona una pregunta para ver su respuesta</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
