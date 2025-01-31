'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, CircleAlertIcon, HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useWatch } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { RoleFormStepperType } from './role-form-stepper';

export default function RoleFormReview() {
  const { roles, userRoles } = useWatch<RoleFormStepperType>();
  const [hiddenRoles, setHiddenRoles] = useState<{ [key: string]: boolean }>({});

  const groupedRoles = useMemo(() => {
    if (!roles) return [];
    return roles.map((role) => {
      const moduleFeatures: Record<string, Set<string>> = {};

      //filter inactive features
      const filteredFeatures = role.features?.filter((feature) => feature.isActive);

      filteredFeatures?.forEach((feature) => {
        if (!moduleFeatures[String(feature.moduleName)]) {
          moduleFeatures[String(feature.moduleName)] = new Set();
        }
        moduleFeatures[String(feature.moduleName)].add(String(feature.featureName));
      });

      return { ...role, moduleFeatures };
    });
  }, [roles]);

  const toggleRole = (roleName: string) => {
    setHiddenRoles((prev) => ({ ...prev, [roleName]: !prev[roleName] }));
  };

  return (
    <div className="flex flex-col flex-1 gap-4">
      <Alert variant="warning">
        <CircleAlertIcon className="h-4 w-4" />
        <AlertTitle>Review and Confirm</AlertTitle>
        <AlertDescription>Please review the role and user assignments before confirming.</AlertDescription>
      </Alert>

      <div className="space-y-6">
        {groupedRoles.map((role) => (
          <motion.div key={role.name + 'groupedRoles'} layout transition={{ duration: 0.2 }}>
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleRole(role.name ?? '')}>
                <CardTitle className="text-xl flex items-center justify-between">
                  {role.name}
                  <motion.div animate={{ rotate: hiddenRoles[String(role.name)] ? 0 : 180 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>

              <AnimatePresence>
                {role.name && !hiddenRoles[role.name] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}>
                    <CardContent>
                      <p className="mb-4 text-sm text-muted-foreground">Users with the role {role.name} will have access to the following features:</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Module</TableHead>
                            <TableHead>Features</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(role.moduleFeatures).map(([moduleName, features]) => (
                            <motion.tr key={moduleName + 'moduleFeatures'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {moduleName}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Features available for {moduleName}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                              <TableCell>
                                <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.05 }}>
                                  {Array.from(features).map((feature) => (
                                    <motion.div key={feature + 'features'} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
                                      <Badge variant="secondary">{feature}</Badge>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle>Assigned Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles?.map((userRole, index) => (
                  <motion.tr key={userRole.userId?.value} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                    <TableCell>{userRole.userId?.label}</TableCell>
                    <TableCell>{userRole.roleId?.label}</TableCell>
                    <TableCell>
                      <Badge variant={userRole.isActive ? 'success' : 'secondary'}>{userRole.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
