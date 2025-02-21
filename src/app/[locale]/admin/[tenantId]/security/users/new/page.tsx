import { type FC } from 'react';
import { getAreasWithRolesAsOptionsByTenantId } from '@/actions/area';
import { getIdentityTypesAsOptions, getRolesAsOptions } from '@/actions/user';

import UserTenantScopedForm from '@/components/common/user/user-tenant-scoped-form';

interface NewPageProps {
  params: Promise<{ locale: string; tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { tenantId } = await params;
  const roles = await getRolesAsOptions(tenantId);
  const areas = await getAreasWithRolesAsOptionsByTenantId(tenantId);
  const identificationTypes = await getIdentityTypesAsOptions(tenantId);
  return <UserTenantScopedForm tenantId={tenantId} identificationTypes={identificationTypes} roles={roles} areas={areas} />;
};

export default NewPage;
