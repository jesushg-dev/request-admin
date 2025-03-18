'use client';

import React, { createContext, memo, useCallback, useContext, useMemo, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface CustomActionsProps {
  confirm: () => void;
  cancel: () => void;
  config: ConfirmOptions;
  setConfig: ConfigUpdater;
}

export type ConfigUpdater = (config: ConfirmOptions | ((prev: ConfirmOptions) => ConfirmOptions)) => void;
export type LegacyCustomActions = (onConfirm: () => void, onCancel: () => void) => ReactNode;
export type EnhancedCustomActions = (props: CustomActionsProps) => ReactNode;

export interface ConfirmOptions {
  title?: ReactNode;
  description?: ReactNode;
  contentSlot?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  icon?: ReactNode;
  customActions?: LegacyCustomActions | EnhancedCustomActions;
  confirmButton?: ComponentPropsWithRef<typeof AlertDialogAction>;
  cancelButton?: ComponentPropsWithRef<typeof AlertDialogCancel> | null;
  alertDialogOverlay?: ComponentPropsWithRef<typeof AlertDialogOverlay>;
  alertDialogContent?: ComponentPropsWithRef<typeof AlertDialogContent>;
  alertDialogHeader?: ComponentPropsWithRef<typeof AlertDialogHeader>;
  alertDialogTitle?: ComponentPropsWithRef<typeof AlertDialogTitle>;
  alertDialogDescription?: ComponentPropsWithRef<typeof AlertDialogDescription>;
  alertDialogFooter?: ComponentPropsWithRef<typeof AlertDialogFooter>;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  config: ConfirmOptions;
  resolver: ((value: boolean) => void) | null;
}

export interface ConfirmContextValue {
  confirm: ConfirmFunction;
  updateConfig: ConfigUpdater;
}

export interface ConfirmFunction {
  (options: ConfirmOptions): Promise<boolean>;
  updateConfig?: ConfigUpdater;
}

export const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

const baseDefaultOptions: ConfirmOptions = {
  title: '',
  description: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmButton: {},
  cancelButton: {},
  alertDialogContent: {},
  alertDialogHeader: {},
  alertDialogTitle: {},
  alertDialogDescription: {},
  alertDialogFooter: {},
};

function isLegacyCustomActions(fn: LegacyCustomActions | EnhancedCustomActions): fn is LegacyCustomActions {
  return fn.length === 2;
}

const ConfirmDialogContent: React.FC<{
  isOpen: boolean;
  config: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
  setConfig: ConfigUpdater;
}> = memo(({ isOpen, config, onConfirm, onCancel, setConfig }) => {
  const {
    title,
    description,
    cancelButton,
    confirmButton,
    confirmText,
    cancelText,
    icon,
    contentSlot,
    customActions,
    alertDialogOverlay,
    alertDialogContent,
    alertDialogHeader,
    alertDialogTitle,
    alertDialogDescription,
    alertDialogFooter,
  } = config;

  const renderActions = () => {
    if (!customActions) {
      return (
        <>
          {cancelButton !== null && (
            <AlertDialogCancel onClick={onCancel} {...cancelButton}>
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction onClick={onConfirm} {...confirmButton}>
            {confirmText}
          </AlertDialogAction>
        </>
      );
    }
    if (isLegacyCustomActions(customActions)) {
      return customActions(onConfirm, onCancel);
    }
    return customActions({
      confirm: onConfirm,
      cancel: onCancel,
      config,
      setConfig,
    });
  };

  const renderTitle = () => {
    if (!title && !icon) return null;
    return (
      <AlertDialogTitle {...alertDialogTitle} className="flex items-center gap-2">
        {icon}
        {title}
      </AlertDialogTitle>
    );
  };

  return (
    <AlertDialogPortal forceMount>
      {isOpen && (
        <>
          <AlertDialogOverlay asChild {...alertDialogOverlay}>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-black/80" />
          </AlertDialogOverlay>

          <AlertDialogContent asChild {...alertDialogContent}>
            <motion.div
              key="content"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1],
                scale: { duration: 0.2, ease: 'easeOut' },
              }}
              className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200">
              <AlertDialogHeader {...alertDialogHeader}>
                {renderTitle()}
                {description && <AlertDialogDescription {...alertDialogDescription}>{description}</AlertDialogDescription>}
                {contentSlot}
              </AlertDialogHeader>
              <AlertDialogFooter {...alertDialogFooter}>{renderActions()}</AlertDialogFooter>
            </motion.div>
          </AlertDialogContent>
        </>
      )}
    </AlertDialogPortal>
  );
});

ConfirmDialogContent.displayName = 'ConfirmDialogContent';

const ConfirmDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  config: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
  setConfig: ConfigUpdater;
}> = memo(({ isOpen, onOpenChange, config, onConfirm, onCancel, setConfig }) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <ConfirmDialogContent isOpen={isOpen} config={config} onConfirm={onConfirm} onCancel={onCancel} setConfig={setConfig} />
  </AlertDialog>
));

ConfirmDialog.displayName = 'ConfirmDialog';

export const ConfirmDialogProvider: React.FC<{
  defaultOptions?: ConfirmOptions;
  children: React.ReactNode;
}> = ({ defaultOptions = {}, children }) => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    config: baseDefaultOptions,
    resolver: null,
  });

  const mergedDefaultOptions = useMemo(
    () => ({
      ...baseDefaultOptions,
      ...defaultOptions,
    }),
    [defaultOptions]
  );

  const updateConfig = useCallback((newConfig: ConfirmOptions | ((prev: ConfirmOptions) => ConfirmOptions)) => {
    setDialogState((prev) => ({
      ...prev,
      config: typeof newConfig === 'function' ? newConfig(prev.config) : { ...prev.config, ...newConfig },
    }));
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) => {
      return new Promise<boolean>((resolve) => {
        setDialogState(() => ({
          isOpen: true,
          config: { ...mergedDefaultOptions, ...options },
          resolver: resolve,
        }));
      });
    },
    [mergedDefaultOptions]
  );

  const handleConfirm = useCallback(() => {
    setDialogState((prev) => {
      prev.resolver?.(true);
      return { ...prev, isOpen: false, resolver: null };
    });
  }, []);

  const handleCancel = useCallback(() => {
    setDialogState((prev) => {
      prev.resolver?.(false);
      return { ...prev, isOpen: false, resolver: null };
    });
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) handleCancel();
    },
    [handleCancel]
  );

  const contextValue = useMemo(
    () => ({
      confirm,
      updateConfig,
    }),
    [confirm, updateConfig]
  );

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      <AnimatePresence>
        <ConfirmDialog isOpen={dialogState.isOpen} onOpenChange={handleOpenChange} config={dialogState.config} onConfirm={handleConfirm} onCancel={handleCancel} setConfig={updateConfig} />
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  const { confirm, updateConfig } = context;
  const enhancedConfirm = confirm;
  enhancedConfirm.updateConfig = updateConfig;
  return enhancedConfirm as ConfirmFunction & {
    updateConfig: ConfirmContextValue['updateConfig'];
  };
};
