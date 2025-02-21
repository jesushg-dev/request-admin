import { type FC } from 'react';
import { Blend, Briefcase, CreditCard, Phone, Shield, User, Users } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { UserTenantScopedFormValues } from '.';

const UserSummary: FC = () => {
  const { user, roles = [], areaRoles = [] } = useWatch<UserTenantScopedFormValues>() as UserTenantScopedFormValues;

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">User data not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="w-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl">
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <p>{user.phone}</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Identification Type
              </Label>
              <p>{user.identificationTypeId.label}</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Identification Number
              </Label>
              <p>{user.identificationNumber}</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Two-Factor Authentication
              </Label>
              <Badge variant={user.isTwoFactorRequired ? 'default' : 'secondary'}>{user.isTwoFactorRequired ? 'Required' : 'Not Required'}</Badge>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Blend className="h-4 w-4" />
                Is Active
              </Label>
              <Badge variant={user.isActive ? 'default' : 'secondary'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Global Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              System-wide Roles
            </Label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <Badge key={role.id} variant={role.isActive ? 'default' : 'secondary'}>
                  {role.roleId.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Area Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areaRoles.map((areaRole) => (
                <TableRow key={areaRole.id}>
                  <TableCell>{areaRole.areaId.label}</TableCell>
                  <TableCell>
                    <Badge>{areaRole.roleId.label}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSummary;
