import { type Locale } from 'next-intl'
import { redirect } from '@/i18n/routing'
import { PermissionActions } from '@/constants/permissions'
import { getAuthContext } from '@/actions/authorization'
import InvitationsPageClient from '@/components/common/invitation/invitations-page-client'

interface InvitationsPageProps {
	params: Promise<{ locale: Locale; tenantId: string }>
}

export default async function InvitationsPage({ params }: InvitationsPageProps) {
	const { locale, tenantId } = await params
	const auth = await getAuthContext(tenantId)
	const canCreateUser = auth.hasPermissions([PermissionActions.USER_MANAGEMENT.CREATE])
	if (!canCreateUser) {
		return redirect({ locale, href: { pathname: '/admin/[tenantId]', params: { tenantId } } })
	}



	return <InvitationsPageClient canCreateUser={canCreateUser} />
}
