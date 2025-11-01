'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useFindManyUserTenant } from '@/services/api/hooks';
import { Prisma } from '@zenstackhq/runtime/models';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserName } from '@/lib/user';

const UserTenantDefaultArgs = Prisma.validator<Prisma.UserTenantDefaultArgs>()({
  select: {
    id: true,
    isActive: true,
    person: {
      select: {
        firstName: true,
        lastName: true,
        image: true,
      },
    },
    user: {
      select: {
        email: true,
        username: true,
      },
    },
    userRoles: {
      select: {
        role: {
          select: {
            name: true,
          },
        },
      },
    },
  },
});

type UserTenantWithRelations = Prisma.UserTenantGetPayload<typeof UserTenantDefaultArgs>;

interface UsersTableProps {
  tenantId: string;
}

export function UsersTable({ tenantId }: UsersTableProps) {
  const t = useTranslations('admin.security.dashboard.table.users');
  const { data, isLoading } = useFindManyUserTenant({
    ...UserTenantDefaultArgs,
    where: {
      tenantId,
    },
    take: 10, // Limit to 10 users for the dashboard
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('email')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  const users = data || [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('name')}</TableHead>
          <TableHead>{t('email')}</TableHead>
          <TableHead>{t('role')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          <TableHead>{t('actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              {t('noUsers')}
            </TableCell>
          </TableRow>
        ) : (
          users
            .filter((userTenant) => userTenant.user) // Filter out users without user data
            .map((userTenant) => {
              // Ensure user exists before accessing properties
              if (!userTenant.user) {
                return null;
              }

              const name = getUserName({
                id: userTenant.id,
                user: {
                  id: userTenant.id, // Use userTenant.id as fallback since user.id is not in select
                  email: userTenant.user.email,
                  username: userTenant.user.username || null,
                },
                person: userTenant.person
                  ? {
                      image: userTenant.person.image || null,
                      firstName: userTenant.person.firstName,
                      lastName: userTenant.person.lastName,
                    }
                  : null,
              });
              const status = userTenant.isActive ? 'Active' : 'Inactive';
              const email = userTenant.user.email;

              return (
                <TableRow key={userTenant.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={userTenant.person?.image || undefined} alt={name} />
                        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {name}
                    </div>
                  </TableCell>
                  <TableCell>{email}</TableCell>
                  <TableCell>
                    {userTenant.userRoles && userTenant.userRoles.length > 0 ? (
                      <div className="flex gap-1">
                        {userTenant.userRoles.slice(0, 2).map((userRole, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {userRole.role.name}
                          </Badge>
                        ))}
                        {userTenant.userRoles.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{userTenant.userRoles.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{t('noRole')}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status === 'Active' ? 'default' : 'secondary'}>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" asChild>
                      <Link href={`/admin/${tenantId}/security/users/${userTenant.id}`}>
                        {t('viewDetails')}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
            .filter((row) => row !== null) // Remove any null entries
        )}
      </TableBody>
    </Table>
  );
}
