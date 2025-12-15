'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendEmailVerification, submitLinkAccess, validateLinkEmail, validateLinkPassword, verifyEmailCode } from '@/actions/link-access';
import { defineStepper } from '@stepperize/react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { getInitialStep, getNextStep, type ValidationConfig, type ValidationStep } from '@/lib/link-validation';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { StepNavigationModern } from '@/components/stepper/step-navigation';
import { StepperNavigationButtonsModern } from '@/components/stepper/step-navigation-buttons-modern';

import { LinkAgreementForm } from './link-agreement-form';
import { LinkCustomFieldsForm } from './link-custom-fields-form';
import { LinkEmailForm } from './link-email-form';
import { LinkEmailVerificationForm } from './link-email-verification-form';
import { LinkPasswordForm } from './link-password-form';

interface LinkAccessGuardProps {
  slug: string;
  initialStep: ValidationStep;
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
    enableFeedback: boolean | null;
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
}

interface AccessData {
  password?: string;
  email?: string;
  verificationCode?: string;
  agreementAccepted?: boolean;
  name?: string;
  customFieldResponses?: Record<string, unknown>;
}

// Define stepper with validation steps
const { useStepper } = defineStepper(
  {
    id: 'validation',
    label: 'validation',
    schema: z.object({
      password: z.string().optional(),
      email: z.string().optional(),
      verificationCode: z.string().optional(),
      agreementAccepted: z.boolean().optional(),
      name: z.string().optional(),
      customFieldResponses: z.record(z.string(), z.unknown()).optional(),
    }),
  },
  {
    id: 'complete',
    label: 'complete',
    schema: z.object({}),
  }
);

export function LinkAccessGuard({ slug, link }: LinkAccessGuardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const hasSubmitted = useRef(false);

  // Create validation config from link props
  const validationConfig: ValidationConfig = useMemo(
    () => ({
      hasPassword: link.enablePassword,
      hasEmailProtection: link.emailProtected,
      hasEmailAuthentication: link.emailAuthenticated,
      hasAgreement: link.enableAgreement,
      hasCustomFields: link.customFields.length > 0,
    }),
    [link]
  );

  const stepper = useStepper();

  // Create display steps based on what's enabled
  const displaySteps = useMemo(() => {
    const steps: Array<{ id: ValidationStep; label: string }> = [];
    if (validationConfig.hasPassword) steps.push({ id: 'password', label: 'Password' });
    if (validationConfig.hasEmailProtection) {
      steps.push({ id: 'email', label: 'Email' });
      // Add verification step if email authentication is required
      if (validationConfig.hasEmailAuthentication) {
        steps.push({ id: 'emailVerification', label: 'Verify Email' });
      }
    }
    if (validationConfig.hasAgreement) steps.push({ id: 'agreement', label: 'Agreement' });
    if (validationConfig.hasCustomFields) steps.push({ id: 'customFields', label: 'Custom Fields' });
    return steps;
  }, [validationConfig]);

  // Track current validation step index and email for verification
  const [currentValidationIndex, setCurrentValidationIndex] = useState(0);
  const [emailForVerification, setEmailForVerification] = useState<string>('');
  const currentValidationStep = displaySteps[currentValidationIndex]?.id || 'password';

  // React Hook Form
  const form = useForm<AccessData>({
    mode: 'onTouched',
    defaultValues: {
      password: undefined,
      email: undefined,
      verificationCode: undefined,
      agreementAccepted: undefined,
      name: undefined,
      customFieldResponses: undefined,
    },
  });

  const onSubmit = async (values: AccessData) => {
    console.log('values', values);

    // Validate current step
    if (currentValidationStep === 'password') {
      if (!values.password) {
        toast.error('Password is required');
        return;
      }
      // Validate password with server
      const result = await validateLinkPassword(slug, values.password);
      if (!result.success) {
        toast.error(result.error || 'Invalid password');
        return;
      }
      // Password is valid, keep the actual password for final submission
      // Don't overwrite with 'verified'
    }

    if (currentValidationStep === 'email') {
      if (!values.email) {
        toast.error('Email is required');
        return;
      }
      // Validate email with server
      const validation = await validateLinkEmail(slug, values.email);
      if (!validation.success) {
        toast.error(validation.error || 'Email not allowed');
        return;
      }
      // Store email for verification step
      setEmailForVerification(values.email);
      // If verification is required, send OTP
      if (link.emailAuthenticated) {
        const sendResult = await sendEmailVerification(slug, values.email);
        if (!sendResult.success) {
          toast.error(sendResult.error || 'Failed to send verification code');
          return;
        }
        toast.success('Verification code sent to your email');
      }
      // Store email for verification step
      setEmailForVerification(values.email);
    }

    if (currentValidationStep === 'emailVerification') {
      // Validate verification code
      if (!values.verificationCode || values.verificationCode.length !== 6) {
        toast.error('Please enter the 6-digit verification code');
        return;
      }

      // Verify code with server
      const verifyResult = await verifyEmailCode(slug, emailForVerification, values.verificationCode);
      if (!verifyResult.success) {
        toast.error(verifyResult.error || 'Invalid verification code');
        return;
      }

      toast.success('Email verified successfully');
    }

    if (currentValidationStep === 'agreement') {
      if (!values.agreementAccepted) {
        toast.error('You must accept the agreement');
        return;
      }
      if (link.agreementRequireName && (!values.name || !values.name.trim())) {
        toast.error('Name is required');
        return;
      }
    }

    if (currentValidationStep === 'customFields') {
      const requiredFields = link.customFields.filter((field) => field.required && !field.disabled);
      if (requiredFields.length > 0 && values.customFieldResponses) {
        for (const field of requiredFields) {
          const value = values.customFieldResponses[field.id];
          if (!value || (typeof value === 'string' && !value.trim())) {
            toast.error(`Field "${field.label}" is required`);
            return;
          }
        }
      }
    }

    // If not last validation step, move to next
    if (currentValidationIndex < displaySteps.length - 1) {
      setCurrentValidationIndex(currentValidationIndex + 1);
      return;
    }

    // If last step, submit all data
    handleComplete(values);
  };

  const handleComplete = (data: AccessData) => {
    // Prevent multiple submissions
    if (hasSubmitted.current || isPending) {
      return;
    }

    hasSubmitted.current = true;

    startTransition(async () => {
      try {
        const result = await submitLinkAccess(slug, data);
        if (result.success && result.viewId) {
          // Redirect to view page after successful validation
          router.push(`/l/${slug}/view`);
        } else {
          toast.error(result.error || 'Failed to access document');
          hasSubmitted.current = false; // Allow retry on error
        }
      } catch (error) {
        toast.error('An error occurred while accessing the document');
        hasSubmitted.current = false; // Allow retry on error
      }
    });
  };

  // Show loading state while submitting
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Validating access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render Request Engine-style layout with header and stepper
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Simple Header - Only Logo */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Request Engine</span>
          </Link>
        </div>
      </header>

      {/* Main Content - Container for Large Screens */}
      <main className="flex-1 flex flex-col">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
            <div className="flex-1 p-4">
              <div className="max-w-3xl mx-auto w-full h-full flex flex-col">
                {/* Title - Centered */}
                {link.name && (
                  <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">{link.name}</h1>
                  </div>
                )}

                {/* Stepper Navigation */}
                {displaySteps.length > 0 && (
                  <div className="mb-4">
                    <StepNavigationModern
                      steps={displaySteps}
                      currentId={currentValidationStep}
                      getIndex={(id) => displaySteps.findIndex((s) => s.id === id)}
                      onStepClick={(stepId) => {
                        const targetIndex = displaySteps.findIndex((s) => s.id === stepId);
                        if (targetIndex !== -1 && targetIndex <= currentValidationIndex) {
                          setCurrentValidationIndex(targetIndex);
                        }
                      }}
                      isNavigationEnabled={false}
                    />
                  </div>
                )}

                {/* Form Container - Single Card */}
                <Card className="flex-1 flex flex-col overflow-hidden rounded-lg border shadow-sm">
                  <CardContent className="flex-1 overflow-y-auto p-8">
                    {currentValidationStep === 'password' && <LinkPasswordForm />}
                    {currentValidationStep === 'email' && <LinkEmailForm />}
                    {currentValidationStep === 'emailVerification' && <LinkEmailVerificationForm slug={slug} email={emailForVerification} />}
                    {currentValidationStep === 'agreement' && <LinkAgreementForm agreementContent={link.agreementContent || ''} requireName={link.agreementRequireName ?? false} />}
                    {currentValidationStep === 'customFields' && <LinkCustomFieldsForm fields={link.customFields} />}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Navigation Buttons - Full Width Border */}
            <StepperNavigationButtonsModern
              isFirstStep={currentValidationIndex === 0}
              isLastStep={currentValidationIndex === displaySteps.length - 1}
              currentStep={currentValidationIndex + 1}
              totalSteps={displaySteps.length}
              onPrev={() => {
                if (currentValidationIndex > 0) {
                  setCurrentValidationIndex(currentValidationIndex - 1);
                }
              }}
              isPending={isPending}
              submitText="Complete"
            />
          </form>
        </Form>
      </main>
    </div>
  );
}
