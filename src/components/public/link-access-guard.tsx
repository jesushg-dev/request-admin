'use client';

import { useState, useEffect } from 'react';
import { submitLinkAccess } from '@/actions/link-access';
import { LinkPasswordForm } from './link-password-form';
import { LinkEmailForm } from './link-email-form';
import { LinkAgreementForm } from './link-agreement-form';
import { LinkCustomFieldsForm } from './link-custom-fields-form';
import { PublicDocumentViewer } from './public-document-viewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LinkAccessGuardProps {
  slug: string;
  link: {
    id: string;
    name: string | null;
    documentId: string | null;
    dataroomId: string | null;
    linkType: string;
    enablePassword: boolean;
    emailProtected: boolean;
    emailAuthenticated: boolean;
    enableAgreement: boolean;
    agreementId: string | null;
    agreementContent?: string | null;
    agreementRequireName?: boolean;
    allowDownload: boolean | null;
    enableScreenshotProtection: boolean | null;
    enableWatermark: boolean | null;
    customFields: Array<{
      id: string;
      type: string;
      label: string;
      placeholder: string | null;
      required: boolean;
      disabled: boolean;
      orderIndex: number;
    }>;
  };
  document?: {
    id: string;
    file: string;
    contentType: string | null;
    name: string;
  };
}

type ValidationStep = 'password' | 'email' | 'agreement' | 'customFields' | 'complete';

interface AccessData {
  email?: string;
  name?: string;
  password?: string;
  agreementAccepted?: boolean;
  agreementName?: string;
  customFieldResponses?: Record<string, unknown>;
}

export function LinkAccessGuard({ slug, link, document }: LinkAccessGuardProps) {
  const [step, setStep] = useState<ValidationStep>('password');
  const [accessData, setAccessData] = useState<AccessData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine initial step
  useEffect(() => {
    if (!link.enablePassword) {
      if (link.emailProtected) {
        setStep('email');
      } else if (link.enableAgreement) {
        setStep('agreement');
      } else if (link.customFields.length > 0) {
        setStep('customFields');
      } else {
        // No validations needed, submit immediately
        handleComplete({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link]);


  const handlePasswordSuccess = () => {
    setAccessData((prev) => ({ ...prev, password: 'verified' }));
    if (link.emailProtected) {
      setStep('email');
    } else if (link.enableAgreement) {
      setStep('agreement');
    } else if (link.customFields.length > 0) {
      setStep('customFields');
    } else {
      handleComplete();
    }
  };

  const handleEmailSuccess = (email: string) => {
    const updatedData = { ...accessData, email };
    setAccessData(updatedData);
    if (link.enableAgreement) {
      setStep('agreement');
    } else if (link.customFields.length > 0) {
      setStep('customFields');
    } else {
      handleComplete(updatedData);
    }
  };

  const handleAgreementSuccess = (name?: string) => {
    const updatedData = { ...accessData, agreementAccepted: true, name };
    setAccessData(updatedData);
    if (link.customFields.length > 0) {
      setStep('customFields');
    } else {
      handleComplete(updatedData);
    }
  };

  const handleCustomFieldsSuccess = (responses: Record<string, unknown>) => {
    const finalData = { ...accessData, customFieldResponses: responses };
    setAccessData(finalData);
    handleComplete(finalData);
  };

  const handleComplete = async (finalData?: AccessData) => {
    setIsSubmitting(true);
    try {
      const dataToSubmit = finalData || accessData;
      const result = await submitLinkAccess(slug, dataToSubmit);
      if (result.success) {
        setStep('complete');
      } else {
        toast.error(result.error || 'Failed to access document');
      }
    } catch (error) {
      toast.error('An error occurred while accessing the document');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while submitting
  if (isSubmitting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show document if all validations passed
  if (step === 'complete' && document) {
    return (
      <PublicDocumentViewer
        fileUrl={document.file}
        contentType={document.contentType}
        title={document.name}
        allowDownload={link.allowDownload ?? false}
        enableScreenshotProtection={link.enableScreenshotProtection ?? false}
        enableWatermark={link.enableWatermark ?? false}
      />
    );
  }

  // Render appropriate validation form
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        {link.name && (
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">{link.name}</h1>
          </div>
        )}

        {step === 'password' && link.enablePassword && <LinkPasswordForm slug={slug} onSuccess={handlePasswordSuccess} />}

        {step === 'email' && link.emailProtected && (
          <LinkEmailForm slug={slug} requiresVerification={link.emailAuthenticated} onSuccess={handleEmailSuccess} />
        )}

        {step === 'agreement' && link.enableAgreement && link.agreementContent && (
          <LinkAgreementForm
            agreementContent={link.agreementContent}
            requireName={link.agreementRequireName ?? false}
            onSuccess={handleAgreementSuccess}
          />
        )}

        {step === 'customFields' && link.customFields.length > 0 && (
          <LinkCustomFieldsForm fields={link.customFields} onSuccess={handleCustomFieldsSuccess} />
        )}
      </div>
    </div>
  );
}

