import { ComponentProps } from 'react';
import { getCurrentTenantId } from '@/actions/tenant';
import { Link } from '@/i18n/routing';
import { db } from '@/server/db-server';
import { DeleteIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function SecurityDashboardPage() {
  const tenantId = await getCurrentTenantId();
  const t = await getTranslations('admin.security');

  //get user count
  const userCount = await db.user.count();
  const roleCount = await db.role.count();
  const permissionCount = await db.permission.count();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          count={userCount}
          title={t('users.title')}
          viewText={t('users.view')}
          addText={t('users.add')}
          viewLink={{ pathname: '/[tenantId]/admin/security/user', params: { tenantId } }}
          addLink={{ pathname: '/[tenantId]/admin/security/user/new', params: { tenantId } }}
        />
        <StatCard
          count={roleCount}
          title={t('roles.title')}
          viewText={t('roles.view')}
          addText={t('roles.add')}
          viewLink={{ pathname: '/[tenantId]/admin/security/role', params: { tenantId } }}
          addLink={{ pathname: '/[tenantId]/admin/security/role/new', params: { tenantId } }}
        />
        <StatCard
          title={t('permissions.title')}
          count={permissionCount}
          viewText={t('permissions.view')}
          addText={t('permissions.add')}
          viewLink={{ pathname: '/[tenantId]/admin/security/user', params: { tenantId } }}
          addLink={{ pathname: '/[tenantId]/admin/security/user/new', params: { tenantId } }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">{t('recentUsers')}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.email')}</TableHead>
              <TableHead>{t('table.role')}</TableHead>
              <TableHead>{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt="John Doe" style={{ objectFit: 'contain', objectPosition: 'center' }} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('users.softwareEngineer')}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>john.doe@example.com</TableCell>
              <TableCell>
                <Badge variant="outline" className="rounded-full">
                  {t('roles.admin')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href="#" prefetch={false}>
                    <DeleteIcon className="h-4 w-4" />
                  </Link>
                  <Button variant="ghost" size="icon">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt="Jane Smith" style={{ objectFit: 'contain', objectPosition: 'center' }} />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Jane Smith</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('users.productManager')}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>jane.smith@example.com</TableCell>
              <TableCell>
                <Badge variant="outline" className="rounded-full">
                  {t('roles.manager')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href="#" prefetch={false}>
                    <DeleteIcon className="h-4 w-4" />
                  </Link>
                  <Button variant="ghost" size="icon">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  count: number;
  viewText: string;
  addText: string;
  viewLink: ComponentProps<typeof Link>['href'];
  addLink: ComponentProps<typeof Link>['href'];
}

function StatCard({ title, count, viewText, addText, viewLink, addLink }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="text-4xl font-bold">{count}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Link href={viewLink} className="text-sm font-medium underline" prefetch={false}>
            {viewText}
          </Link>
          <Button size="sm">
            <Link href={addLink} className="flex gap-2" prefetch={false}>
              <PlusIcon className="h-4 w-4" />
              {addText}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
