import { type FC } from 'react'
import { type Locale } from 'next-intl'
import { redirect } from '@/i18n/routing'
import { PermissionActions } from '@/constants/permissions'
import { getAuthContext } from '@/actions/authorization'
import { getAreasWithRolesAsOptionsByTenantId } from '@/actions/area'
import { getIdentityTypesAsOptions, getRolesAsOptions, getUserFormValuesByUserTenantId } from '@/actions/user'
import UserTenantScopedForm from '@/components/common/user/user-tenant-scoped-form'

interface EditUserPageProps {
	params: Promise<{ locale: Locale; tenantId: string; slug: string }>
}

const EditUserPage: FC<EditUserPageProps> = async ({ params }) => {
	const { locale, tenantId, slug } = await params

	const auth = await getAuthContext(tenantId)
	const canEdit = auth.hasPermissions([PermissionActions.USER_MANAGEMENT.EDIT])
	if (!canEdit) {
		return redirect({ locale, href: { pathname: '/admin/[tenantId]/security/users', params: { tenantId } } })
	}

	const [roles, areas, identificationTypes, defaultValues] = await Promise.all([
		getRolesAsOptions(tenantId),
		getAreasWithRolesAsOptionsByTenantId(tenantId),
		getIdentityTypesAsOptions(tenantId),
		getUserFormValuesByUserTenantId(tenantId, slug),
	])

	return (
		<UserTenantScopedForm
			tenantId={tenantId}
			identificationTypes={identificationTypes}
			roles={roles}
			areas={areas}
			defaultValues={defaultValues}
		/>
	)
}

export default EditUserPage
