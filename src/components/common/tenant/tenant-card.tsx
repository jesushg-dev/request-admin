'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, Building2, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { setActiveTenant } from '@/actions/tenant';
import { ExternalWebsiteLink } from './external-website-link';

interface TenantCardProps {
    tenant: {
        id: string;
        name: string;
        logo: string | null;
        description: string | null;
        websiteUrl: string | null;
    };
}

export function TenantCard({ tenant }: TenantCardProps) {
    const router = useRouter();

    const handleSelectTenant = async () => {
        try {
            await setActiveTenant(tenant.id);
            toast.success('Tenant selected successfully');
            router.push(`/admin/${tenant.id}`);
        } catch (error) {
            console.error('Failed to set active tenant:', error);
            toast.error('Failed to set active organization');
            // Still try to navigate
            router.push(`/admin/${tenant.id}`);
        }
    };

    return (
        <Card
            className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
            onClick={handleSelectTenant}
        >
            <CardContent className="p-0">
                <div className="relative flex w-full flex-col gap-4 p-6 text-left transition-colors hover:bg-muted/30">
                    {/* Header with Avatar and Arrow */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 ring-2 ring-background transition-all duration-300 group-hover:border-primary/30 group-hover:bg-muted/50">
                                <Avatar className="h-12 w-12 ring-2 ring-background">
                                    <AvatarImage src={tenant.logo ?? ''} alt={tenant.name} className="object-contain" />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                        <Building2 className="h-6 w-6" />
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex flex-1 flex-col gap-1 min-w-0">
                                <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                                    {tenant.name}
                                </h3>
                                {tenant.websiteUrl && (
                                    <ExternalWebsiteLink
                                        href={tenant.websiteUrl}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors w-fit"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Visit website
                                    </ExternalWebsiteLink>
                                )}
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>

                    {/* Description */}
                    {tenant.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">{tenant.description}</p>
                    )}

                    {/* Hover gradient effect */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
                </div>
            </CardContent>
        </Card>
    );
}
