// Componente TabSection.tsx
import { cn } from '@/lib/utils';
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
  className?: string;
  footerChildren?: React.ReactNode;
}

export function TabSection({ value, title, description, className, children, formTitle, isPending, footerChildren }: TabSectionProps) {
  return (
    <TabsContent value={value} className="mt-0 flex-1 flex flex-col overflow-hidden">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className={cn('flex-1 flex flex-col overflow-hidden', className)}>{children}</CardContent>
        <CardFooter>
          <FormActions className="mt-0" isPending={isPending} title={formTitle}>
            {footerChildren}
          </FormActions>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
