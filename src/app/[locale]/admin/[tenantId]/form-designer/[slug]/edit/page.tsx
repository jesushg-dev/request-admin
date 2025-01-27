import React from 'react';
import { GetFormById } from '@/actions/form';

import FormBuilder from '@/components/builder-form/form-builder';

async function BuilderPage({ params }: { params: Promise<{ slug: string; tenantId: string }> }) {
  const { tenantId, slug } = await params;
  const form = await GetFormById(slug, tenantId);
  if (!form) {
    throw new Error('form not found');
  }
  return <FormBuilder form={form} />;
}

export default BuilderPage;
