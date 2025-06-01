'use client';

import dynamic from 'next/dynamic';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntegrationPanel from '@/components/process-flow/integrations/integration-panel';
import MetricsDashboard from '@/components/process-flow/metrics/metrics-dashboard';

const AuthenticationClient = dynamic(() => import('./_components/authentication-client'), { ssr: false });
const PresenceClient = dynamic(() => import('./_components/presence-client'), { ssr: false });

export default function ATestExperiments() {
  return (
    <Tabs defaultValue="auth" className="flex-1 flex flex-col overflow-hidden">
      <main className="flex flex-col flex-1 overflow-hidden">
        <header className="flex flex-col gap-2 p-6 border-b bg-background">
          <h1 className="text-2xl font-bold">ATest Experiments Suite</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            This page contains a series of isolated experiments for ATest features. Each tab demonstrates a different capability or integration. Use these experiments to validate, debug, or showcase.
          </p>
          <TabsList className="">
            <TabsTrigger value="auth">Auth</TabsTrigger>
            <TabsTrigger value="presence">Presence</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
        </header>

        <TabsContent value="auth" className="flex-1 overflow-y-auto">
          <AuthenticationClient />
        </TabsContent>

        <TabsContent value="presence" className="flex-1 overflow-y-auto">
          <PresenceClient />
        </TabsContent>

        <TabsContent value="metrics" className="flex-1 overflow-y-auto">
          <MetricsDashboard />
        </TabsContent>

        <TabsContent value="integrations" className="flex-1 overflow-y-auto">
          <IntegrationPanel />
        </TabsContent>
      </main>
    </Tabs>
  );
}
