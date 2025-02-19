import React from 'react';
import { GetFormContentByUrl } from '@/actions/form';

import { FormElementInstance } from '@/components/builder-form/form-elements';
import FormSubmitComponent from '@/components/builder-form/form-submit-component';

async function SubmitPage({ params }: { params: Promise<{ tenantId: string; slug: string }> }) {
  const { slug, tenantId } = await params;

  const form = await GetFormContentByUrl(slug, tenantId);

  if (!form) {
    throw new Error('form not found');
  }

  const formContent = JSON.parse(form.content) as FormElementInstance[];

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="bg-background flex w-full max-w-[620px] grow flex-col gap-4 overflow-y-auto rounded border p-8 shadow-xl shadow-blue-700">
        <FormSubmitComponent formId={form.id} content={formContent} tenantId={tenantId} />
      </div>
    </div>
  );
}

export default SubmitPage;
