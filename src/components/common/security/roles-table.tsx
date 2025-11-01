'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useFindManyRole } from '@/services/api/hooks';
import { Prisma } from '@zenstackhq/runtime/models';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const RoleDefaultArgs = Prisma.validator<Prisma.RoleDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    roleFeature: {
      select: {
        feature: {
          select: {
            name: true,
          },
        },
      },
      where: {
        isActive: true,
      },
    },
    _count: {
      select: {
        userRole: {
          where: {
            isActive: true,
          },
        },
        roleFeature: {
          where: {
            isActive: true,
          },
        },
      },
    },
  },
});

type RoleWithRelations = Prisma.RoleGetPayload<typeof RoleDefaultArgs>;

interface RolesTableProps {
  tenantId: string;
}

export function RolesTable({ tenantId }: RolesTableProps) {
  const t = useTranslations('admin.security.dashboard.table.roles');
  const { data, isLoading } = useFindManyRole({
    ...RoleDefaultArgs,
    where: {
      tenantId,
    },
    take: 10, // Limit to 10 roles for the dashboard
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('roleName')}</TableHead>
            <TableHead>{t('permissions')}</TableHead>
            <TableHead>{t('userCount')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  const roles = data || [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('roleName')}</TableHead>
          <TableHead>{t('permissions')}</TableHead>
          <TableHead>{t('userCount')}</TableHead>
          <TableHead>{t('actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              {t('noRoles')}
            </TableCell>
          </TableRow>
        ) : (
          roles.map((role) => {
            const features = role.roleFeature.map((rf) => rf.feature.name);
            const userCount = role._count.userRole;

            return (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  {features.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{features.length - 3}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">{t('noPermissions')}</span>
                  )}
                </TableCell>
                <TableCell>{userCount}</TableCell>
                <TableCell>
                  <Button variant="link" asChild>
                    <Link href={`/admin/${tenantId}/security/roles/${role.id}`}>
                      {t('viewDetails')}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
