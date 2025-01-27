import React from 'react';
import { GetFormContentById } from '@/actions/form';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormElementInstance } from '@/components/builder-form/form-elements';
import FormSubmitComponent from '@/components/builder-form/form-submit-component';

async function SubmitPage({ params }: { params: { tenantId: string; slug: string } }) {
  const { slug, tenantId } = await params;

  const form = await GetFormContentById(slug, tenantId);

  if (!form) {
    throw new Error('form not found');
  }

  const formContent = JSON.parse(form.content) as FormElementInstance[];

  return (
    <div className="flex flex-1 h-full w-full p-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>{form.name}</CardTitle>
          <CardDescription>{form.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <FormSubmitComponent formId={form.id} content={formContent} />
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}

export default SubmitPage;
