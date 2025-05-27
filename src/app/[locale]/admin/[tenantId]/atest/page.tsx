import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntegrationPanel from '@/components/process-flow/integrations/integration-panel';
import MetricsDashboard from '@/components/process-flow/metrics/metrics-dashboard';

export default function Home() {
  return (
    <main className="flex flex-col w-full h-screen">
      <Tabs defaultValue="builder" className="flex-1">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">ITIL Process Flow Builder</h1>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          </TabsList>
        </header>
        <TabsContent value="metrics">
          <MetricsDashboard />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationPanel />
        </TabsContent>
      </Tabs>
    </main>
  );
}
