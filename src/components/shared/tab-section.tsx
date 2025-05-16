// Componente TabSection.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { FormActions } from '@/components/shared/form-root';

interface TabSectionProps {
  value: string;
  title: string;
  description: string;
  children: React.ReactNode;
  formTitle: string;
  isPending: boolean;
  footerChildren?: React.ReactNode;
}

export function TabSection({ value, title, description, children, formTitle, isPending, footerChildren }: TabSectionProps) {
  return (
    <TabsContent value={value} className="mt-0 flex-1 flex flex-col overflow-hidden">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">{children}</CardContent>
        <CardFooter>
          <FormActions className="mt-0" isPending={isPending} title={formTitle}>
            {footerChildren}
          </FormActions>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
