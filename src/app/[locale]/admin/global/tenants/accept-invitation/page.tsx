'use client';

import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { processInvitationAcceptance } from '@/actions/user';
import { useRouter } from '@/i18n/routing';
import { authClient } from '@/server/auth-client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { CardWrapper } from '@/components/auth/card-wrapper';

const AcceptInvitationPage = () => {
  const t = useTranslations('auth.acceptInvitationForm');
  const searchParams = useSearchParams();
  const invitationId = searchParams.get('id');
  const { push } = useRouter();

  const [isCancelling, startCancel] = useTransition();
  const [isPending, startTransition] = useTransition();

  const onAccept = () => {
    if (!invitationId) {
      toast.error(t('invitationIdNoFound'));
      return;
    }

    startTransition(async () => {
      const promise = processInvitationAcceptance(invitationId);
      toast.promise(promise, {
        loading: t('loading'),
        success: ({ tenantId }) => {
          push({ pathname: '/admin/[tenantId]', params: { tenantId } });
          return t('success');
        },
        error: (error) => `${t('error')}: ${error.message}`,
      });
    });
  };

  const onCancel = () => {
    if (!invitationId) {
      toast.error(t('invitationIdNoFound'));
      return;
    }

    startCancel(async () => {
      const toastId = toast('cancel-invitation');
      await authClient.organization.cancelInvitation(
        { invitationId },
        {
          onRequest: () => {
            toast.loading(t('cancelling'), { id: toastId });
          },
          onSuccess: () => {
            toast.success(t('cancelSuccess'), { id: toastId });
            push({
              pathname: '/admin/[tenantId]',
              params: { tenantId: 'global' },
            });
          },
          onError: (ctx) => {
            toast.error(`${t('cancelError')}: ${ctx.error.message}`, { id: toastId });
          },
        }
      );
    });
  };

  return (
    <div className="flex items-center justify-center flex-1">
      <CardWrapper headerTitle={t('headerTitle')} headerLabel={t('headerLabel')} backButtonLabel={t('readTermAndConditions')} backButtonHref="/auth/login">
        <div className="space-y-6">
          <div className="flex gap-2">
            <Button disabled={isCancelling || isPending} type="button" variant="ghost" className="w-full" onClick={onCancel}>
              {t('actions.cancelInvitation')}
            </Button>
            <Button disabled={isCancelling || isPending} type="button" className="w-full" onClick={onAccept}>
              {t('actions.acceptInvitation')}
            </Button>
          </div>
        </div>
      </CardWrapper>
    </div>
  );
};

export default AcceptInvitationPage;
