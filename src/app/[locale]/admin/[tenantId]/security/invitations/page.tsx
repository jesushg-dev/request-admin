import { type Metadata } from 'next';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { PermissionActions } from '@/constants/permissions';
import { getAuthContext } from '@/actions/authorization';
import { getTranslations } from 'next-intl/server';
import InvitationsPageClient from '@/components/common/invitation/invitations-page-client';

interface InvitationsPageProps {
	params: Promise<{ locale: Locale; tenantId: string }>;
}

export async function generateMetadata(props: InvitationsPageProps): Promise<Metadata> {
	const { locale } = await props.params;
	const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });

	return {
		title: `${t('pages.invitations.title')} - ${t('brandName')}`,
		description: t('pages.invitations.description'),
	};
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
