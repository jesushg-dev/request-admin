import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExecutionProvider } from '@/components/process-flow/execution/execution-context';
import ExecutionView from '@/components/process-flow/execution/execution-view';
import IntegrationPanel from '@/components/process-flow/integrations/integration-panel';
import MetricsDashboard from '@/components/process-flow/metrics/metrics-dashboard';

export default function Home() {
  return (
    <main className="flex flex-col w-full h-screen">
      <Tabs defaultValue="builder" className="flex-1">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">ITIL Process Flow Builder</h1>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="execution">Ejecución</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          </TabsList>
        </header>
        <TabsContent value="builder" className="h-[calc(100vh-73px)]"></TabsContent>
        <TabsContent value="execution">
          <ExecutionProvider>
            <ExecutionView />
          </ExecutionProvider>
        </TabsContent>
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
