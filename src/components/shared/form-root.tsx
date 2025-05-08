import { FormHTMLAttributes, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircleIcon } from 'lucide-react';
import { AnimatePresence, AnimationProps, motion } from 'motion/react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormLabel, FormMessage, FormItem as ShadcnFormItem } from '@/components/ui/form';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';

import { Hint } from '../hint';

type FormRootProps = {
  children: ReactNode;
  className?: string;
} & FormHTMLAttributes<HTMLFormElement>;

export const FormRoot = ({ children, className, ...props }: FormRootProps) => (
  <form {...props} className={cn('flex-1 flex flex-col overflow-hidden', className)}>
    {children}
  </form>
);

type FormContentProps = {
  children: ReactNode;
  className?: string;
  error?: unknown;
};

export const FormContent = ({ children, className, error }: FormContentProps) => (
  <div className="flex-1 overflow-auto">
    <div className={cn('flex flex-1 flex-col justify-between overflow-hidden px-1 gap-4', className)}>
      <FormError error={error} />
      {children}
    </div>
  </div>
);

type FormErrorProps = {
  error?: unknown;
};

export const FormError = ({ error }: FormErrorProps) => {
  if (!error || typeof error !== 'object') return null;
  return <PrismaErrorAlert error={error} />;
};

type FormSectionProps = {
  children: ReactNode;
  title?: string;
  className?: string;
};

export const FormSection = ({ children, title, className }: FormSectionProps) => (
  <fieldset className={cn('space-y-6', className)}>
    {title && <legend className="text-lg font-semibold">{title}</legend>}
    <div className="space-y-4">{children}</div>
  </fieldset>
);

export const FormValidationStatus = ({ isValid, validText, invalidText }: { isValid: boolean; validText: string; invalidText: string }) => (
  <div className={`flex items-center space-x-2 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
    {isValid ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
    <span>{isValid ? validText : invalidText}</span>
  </div>
);

type AnimatedVisibilityProps = {
  isVisible: boolean;
  children: ReactNode;
  className?: string;
  animation?: AnimationProps;
  mode?: 'sync' | 'wait';
};

export const AnimatedVisibility = ({
  isVisible,
  children,
  className,
  animation = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.2 },
  },
  mode = 'sync',
}: AnimatedVisibilityProps) => (
  <AnimatePresence initial={false} mode={mode}>
    {isVisible && (
      <motion.div
        initial={animation.initial}
        animate={animation.animate}
        exit={animation.exit}
        transition={animation.transition}
        className={className}
        aria-live="polite"
        style={{ overflow: 'hidden' }}>
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

type FormItemProps = {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export const FormItem = ({ label, description, children, className }: FormItemProps) => (
  <ShadcnFormItem className={className}>
    <FormLabel>{label}</FormLabel>
    <FormControl>{children}</FormControl>
    {description && <FormDescription>{description}</FormDescription>}
    <FormMessage />
  </ShadcnFormItem>
);

type FormCheckboxItemProps = {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export const FormCheckboxItem = ({ label, description, children, className }: FormCheckboxItemProps) => (
  <ShadcnFormItem className={cn('flex flex-row items-start space-x-3 rounded-md border p-4', className)}>
    <FormControl>{children}</FormControl>
    <div className="leading-none space-y-1">
      <FormLabel>{label}</FormLabel>
      {description && <FormDescription>{description}</FormDescription>}
    </div>
    <FormMessage />
  </ShadcnFormItem>
);

type FormSwitchItemProps = {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  tooltip?: string;
};

export const FormSwitchItem = ({ label, description, tooltip, icon, children, className }: FormSwitchItemProps) => (
  <ShadcnFormItem className={cn('flex items-center justify-between', className)}>
    <div className="space-y-0.5">
      <FormLabel className="flex items-center gap-1.5">
        {icon && <span className="text-primary">{icon}</span>}
        {label}
        {tooltip && (
          <Hint label={tooltip}>
            <span className="text-muted-foreground cursor-help rounded-full border h-4 w-4 flex items-center justify-center text-xs">?</span>
          </Hint>
        )}
      </FormLabel>
      {description && <FormDescription>{description}</FormDescription>}
    </div>
    <FormControl>{children}</FormControl>
    <FormMessage />
  </ShadcnFormItem>
);

type FormActionsProps = {
  isPending?: boolean;
  title?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
};

export const FormActions = ({ isPending, title = 'Submit', onClick, className, children }: FormActionsProps) => (
  <div className={cn('mt-4 flex justify-end gap-2', className)}>
    {children}
    <Button type={onClick ? 'button' : 'submit'} onClick={onClick} className="w-full sm:w-auto" size="lg" disabled={isPending}>
      {title}
      {isPending && <LoaderCircleIcon className="animate-spin ml-2" />}
    </Button>
  </div>
);
