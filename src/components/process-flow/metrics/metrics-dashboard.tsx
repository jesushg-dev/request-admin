'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, BarChart3, CalendarIcon, Clock, Download, PieChart, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for charts
const mockSlaData = [
  { name: 'Verificación de documentación', met: 85, total: 100 },
  { name: 'Validación de identidad', met: 92, total: 100 },
  { name: 'Verificación de crédito', met: 78, total: 100 },
  { name: 'Selección de plan', met: 95, total: 100 },
  { name: 'Configuración de cuenta', met: 88, total: 100 },
  { name: 'Activación de SIM', met: 90, total: 100 },
  { name: 'Configuración de servicios', met: 82, total: 100 },
  { name: 'Verificación final', met: 93, total: 100 },
];

const mockTimeData = [
  { name: 'Verificación de documentación', actual: 12, estimated: 15 },
  { name: 'Validación de identidad', actual: 8, estimated: 10 },
  { name: 'Verificación de crédito', actual: 25, estimated: 20 },
  { name: 'Selección de plan', actual: 18, estimated: 15 },
  { name: 'Configuración de cuenta', actual: 22, estimated: 20 },
  { name: 'Activación de SIM', actual: 9, estimated: 10 },
  { name: 'Configuración de servicios', actual: 14, estimated: 15 },
  { name: 'Verificación final', actual: 12, estimated: 10 },
];

const mockVolumeData = [
  { date: '2023-06-01', count: 42 },
  { date: '2023-06-02', count: 38 },
  { date: '2023-06-03', count: 35 },
  { date: '2023-06-04', count: 30 },
  { date: '2023-06-05', count: 45 },
  { date: '2023-06-06', count: 50 },
  { date: '2023-06-07', count: 48 },
  { date: '2023-06-08', count: 52 },
  { date: '2023-06-09', count: 55 },
  { date: '2023-06-10', count: 60 },
  { date: '2023-06-11', count: 58 },
  { date: '2023-06-12', count: 62 },
  { date: '2023-06-13', count: 65 },
  { date: '2023-06-14', count: 68 },
  { date: '2023-06-15', count: 70 },
];

export default function MetricsDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [processFilter, setProcessFilter] = useState('all');

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Métricas y Análisis</h1>
          <p className="text-muted-foreground">Análisis de rendimiento de procesos ITIL</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Proceso:</span>
            <Select value={processFilter} onValueChange={setProcessFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar proceso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los procesos</SelectItem>
                <SelectItem value="mobile">Activación de servicio móvil</SelectItem>
                <SelectItem value="internet">Instalación de internet</SelectItem>
                <SelectItem value="support">Soporte técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Fecha:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={'outline'} className="w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} autoFocus />
              </PopoverContent>
            </Popover>
          </div>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Cumplimiento de SLA</CardTitle>
            <CardDescription>Promedio general</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-24">
              <div className="text-5xl font-bold text-green-600">88%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tiempo Promedio</CardTitle>
            <CardDescription>Por proceso completo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-24">
              <div className="text-5xl font-bold">2.4h</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Procesos Completados</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-24">
              <div className="text-5xl font-bold">1,248</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sla" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sla" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Cumplimiento de SLA</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Tiempos de Ejecución</span>
          </TabsTrigger>
          <TabsTrigger value="volume" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Volumen de Procesos</span>
          </TabsTrigger>
          <TabsTrigger value="bottlenecks" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Cuellos de Botella</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Rendimiento por Usuario</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sla">
          <Card>
            <CardHeader>
              <CardTitle>Cumplimiento de SLA por Paso</CardTitle>
              <CardDescription>Porcentaje de cumplimiento de SLA para cada paso del proceso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {/* This would be a real chart in a production app */}
                <div className="space-y-4">
                  {mockSlaData.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.met}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${item.met >= 90 ? 'bg-green-500' : item.met >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${item.met}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Tiempos de Ejecución por Paso</CardTitle>
              <CardDescription>Comparación entre tiempos estimados y reales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {/* This would be a real chart in a production app */}
                <div className="space-y-4">
                  {mockTimeData.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium">
                          {item.actual} min / {item.estimated} min
                        </span>
                      </div>
                      <div className="relative w-full h-6 bg-gray-100 rounded">
                        <div className="absolute h-6 bg-blue-200 rounded" style={{ width: `${(item.estimated / 30) * 100}%` }}></div>
                        <div className={`absolute h-6 rounded ${item.actual <= item.estimated ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${(item.actual / 30) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume">
          <Card>
            <CardHeader>
              <CardTitle>Volumen de Procesos</CardTitle>
              <CardDescription>Número de procesos completados por día</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {/* This would be a real chart in a production app */}
                <div className="grid grid-cols-15 gap-1 h-[300px] items-end">
                  {mockVolumeData.map((item) => (
                    <div key={item.date} className="flex flex-col items-center">
                      <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(item.count / 70) * 100}%` }}></div>
                      <span className="text-xs mt-1 rotate-90 origin-left translate-y-6">{item.date.split('-')[2]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks">
          <Card>
            <CardHeader>
              <CardTitle>Cuellos de Botella</CardTitle>
              <CardDescription>Pasos que más retrasan el proceso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Top 3 Cuellos de Botella</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Verificación de crédito</h4>
                          <p className="text-sm text-muted-foreground">Retraso promedio: 5 minutos</p>
                        </div>
                        <div className="text-red-500 font-bold">+25%</div>
                      </div>
                    </div>
                    <div className="p-4 border rounded bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Configuración de cuenta</h4>
                          <p className="text-sm text-muted-foreground">Retraso promedio: 2 minutos</p>
                        </div>
                        <div className="text-yellow-500 font-bold">+10%</div>
                      </div>
                    </div>
                    <div className="p-4 border rounded bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Selección de plan</h4>
                          <p className="text-sm text-muted-foreground">Retraso promedio: 3 minutos</p>
                        </div>
                        <div className="text-yellow-500 font-bold">+20%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Recomendaciones</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Optimizar el proceso de verificación de crédito automatizando consultas</li>
                    <li>Simplificar el formulario de configuración de cuenta</li>
                    <li>Proporcionar más información sobre planes para agilizar la selección</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Usuario</CardTitle>
              <CardDescription>Métricas de rendimiento por agente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Mejor Rendimiento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="font-bold">CM</span>
                        </div>
                        <div>
                          <div className="font-medium">Carlos Mendoza</div>
                          <div className="text-sm text-muted-foreground">95% SLA, 1.8h promedio</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Mayor Volumen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="font-bold">AG</span>
                        </div>
                        <div>
                          <div className="font-medium">Ana Gómez</div>
                          <div className="text-sm text-muted-foreground">124 procesos, 88% SLA</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Necesita Mejora</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="font-bold">JR</span>
                        </div>
                        <div>
                          <div className="font-medium">Juan Rodríguez</div>
                          <div className="text-sm text-muted-foreground">72% SLA, 3.2h promedio</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Rendimiento Detallado</h3>
                  <div className="border rounded overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agente</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procesos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo Promedio</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfacción</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">Carlos Mendoza</td>
                          <td className="px-6 py-4 whitespace-nowrap">98</td>
                          <td className="px-6 py-4 whitespace-nowrap">95%</td>
                          <td className="px-6 py-4 whitespace-nowrap">1.8h</td>
                          <td className="px-6 py-4 whitespace-nowrap">4.8/5</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">Ana Gómez</td>
                          <td className="px-6 py-4 whitespace-nowrap">124</td>
                          <td className="px-6 py-4 whitespace-nowrap">88%</td>
                          <td className="px-6 py-4 whitespace-nowrap">2.1h</td>
                          <td className="px-6 py-4 whitespace-nowrap">4.5/5</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">María López</td>
                          <td className="px-6 py-4 whitespace-nowrap">87</td>
                          <td className="px-6 py-4 whitespace-nowrap">90%</td>
                          <td className="px-6 py-4 whitespace-nowrap">2.3h</td>
                          <td className="px-6 py-4 whitespace-nowrap">4.6/5</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">Juan Rodríguez</td>
                          <td className="px-6 py-4 whitespace-nowrap">65</td>
                          <td className="px-6 py-4 whitespace-nowrap">72%</td>
                          <td className="px-6 py-4 whitespace-nowrap">3.2h</td>
                          <td className="px-6 py-4 whitespace-nowrap">3.7/5</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">Laura Sánchez</td>
                          <td className="px-6 py-4 whitespace-nowrap">92</td>
                          <td className="px-6 py-4 whitespace-nowrap">85%</td>
                          <td className="px-6 py-4 whitespace-nowrap">2.5h</td>
                          <td className="px-6 py-4 whitespace-nowrap">4.2/5</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
