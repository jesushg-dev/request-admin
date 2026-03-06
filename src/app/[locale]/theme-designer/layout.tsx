
import { AuthDialogWrapper } from '@/features/theme-designer/components/auth-dialog-wrapper';
import { DynamicFontLoader } from '@/features/theme-designer/components/dynamic-font-loader';
import { GetProDialogWrapper } from '@/features/theme-designer/components/get-pro-dialog-wrapper';
import { PostHogInit } from '@/features/theme-designer/components/posthog-init';
import { ThemeDesignerHeadAssets } from '@/features/theme-designer/components/theme-designer-head-assets';
import { ThemeProvider } from '@/features/theme-designer/components/theme-provider';
import { ThemeScript } from '@/features/theme-designer/components/theme-script';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChatProvider } from '@/features/theme-designer/hooks/use-chat-context';
import { QueryProvider } from '@/features/theme-designer/utils/query-client';
import { Suspense } from 'react';

export default function ThemeDesignerRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex h-screen w-full flex-1 flex-col overflow-hidden">
            <ThemeScript />
            <DynamicFontLoader />
            <ThemeDesignerHeadAssets />
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <Suspense>
                    <QueryProvider>
                        <ThemeProvider defaultTheme="light">
                            <TooltipProvider>
                                <AuthDialogWrapper />
                                <GetProDialogWrapper />
                                <Toaster />
                                <ChatProvider>{children}</ChatProvider>
                            </TooltipProvider>
                        </ThemeProvider>
                    </QueryProvider>
                </Suspense>
            </div>
            <PostHogInit />
        </main>
    );
}
