import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const roles = [
  { id: 1, name: 'Admin', permissions: ['Read', 'Write', 'Delete'], userCount: 5 },
  { id: 2, name: 'Manager', permissions: ['Read', 'Write'], userCount: 10 },
  { id: 3, name: 'User', permissions: ['Read'], userCount: 100 },
  { id: 4, name: 'Guest', permissions: ['Read'], userCount: 50 },
  { id: 5, name: 'Support', permissions: ['Read', 'Write'], userCount: 15 },
];

export function RolesTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Role Name</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>User Count</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="font-medium">{role.name}</TableCell>
            <TableCell>
              {role.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="mr-1">
                  {permission}
                </Badge>
              ))}
            </TableCell>
            <TableCell>{role.userCount}</TableCell>
            <TableCell>
              <Button variant="link" asChild>
                <Link href={`/roles/${role.id}`}>View Details</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
