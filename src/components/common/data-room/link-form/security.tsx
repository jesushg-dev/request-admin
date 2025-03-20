'use client';

import { useState } from 'react';
import { useFindManyAgreement } from '@/services/api/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, ImageIcon, Key, Lock, Mail, Shield, Trash2, UserPlus, UserX } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { LinkFormValues, Section } from '.';

export function Security({ tenantId }: { tenantId: string }) {
  const { data: agreements = [] } = useFindManyAgreement({
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
    where: { tenantId },
  });

  const form = useFormContext<LinkFormValues>();
  const { fields: allowedViewersFields, append: appendAllowedViewer, remove: removeAllowedViewer } = useFieldArray({ control: form.control, name: 'allowedViewers' });
  const { fields: blockedViewersFields, append: appendBlockedViewer, remove: removeBlockedViewer } = useFieldArray({ control: form.control, name: 'blockedViewers' });

  const [newAllowedViewer, setNewAllowedViewer] = useState<{ value: string; type: 'EMAIL' | 'DOMAIN' }>({ value: '', type: 'EMAIL' });
  const [newBlockedViewer, setNewBlockedViewer] = useState<{ value: string; type: 'EMAIL' | 'DOMAIN' }>({ value: '', type: 'EMAIL' });

  const addAllowedViewer = () => {
    if (newAllowedViewer.value.trim() === '') {
      toast.error('Por favor ingresa un email o dominio válido');
      return;
    }

    appendAllowedViewer(newAllowedViewer);
    setNewAllowedViewer({ value: '', type: 'EMAIL' });
  };

  const addBlockedViewer = () => {
    if (newBlockedViewer.value.trim() === '') {
      toast.error('Por favor ingresa un email o dominio válido');
      return;
    }

    appendBlockedViewer(newBlockedViewer);
    setNewBlockedViewer({ value: '', type: 'EMAIL' });
  };

  return (
    <Section title="Opciones de Seguridad" icon={<Shield className="h-5 w-5 text-primary" />} defaultOpen={true}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="enablePassword"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-primary" />
                  Protección con Contraseña
                </FormLabel>
                <FormDescription>Requerir contraseña para acceder al documento</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <AnimatePresence>
          {form.watch('enablePassword') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="ml-6">
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ingresa contraseña" {...field} />
                    </FormControl>
                    <FormDescription>Los usuarios necesitarán esta contraseña para acceder al documento</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <FormField
          control={form.control}
          name="emailProtected"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary" />
                  Protección por Email
                </FormLabel>
                <FormDescription>Requerir que los usuarios ingresen su email antes de ver</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <AnimatePresence>
          {form.watch('emailProtected') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <FormField
                control={form.control}
                name="emailAuthenticated"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 ml-6">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center">
                        <Key className="h-4 w-4 mr-2 text-primary" />
                        Verificación de Email
                      </FormLabel>
                      <FormDescription>Verificar email del usuario con un código de validación</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <FormField
          control={form.control}
          name="allowSpecificViewers"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <UserPlus className="h-4 w-4 mr-2 text-primary" />
                  Permitir Visualizadores Específicos
                </FormLabel>
                <FormDescription>Restringir acceso solo a emails o dominios específicos</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <AnimatePresence>
          {form.watch('allowSpecificViewers') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="ml-6 space-y-4 p-4 border rounded-lg">
                <div className="flex flex-col gap-2">
                  <Label>Añadir Visualizador Permitido</Label>
                  <div className="flex gap-2">
                    <Select value={newAllowedViewer.type} onValueChange={(value: 'EMAIL' | 'DOMAIN') => setNewAllowedViewer({ ...newAllowedViewer, type: value })}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="DOMAIN">Dominio</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={newAllowedViewer.type === 'EMAIL' ? 'usuario@ejemplo.com' : 'ejemplo.com'}
                      value={newAllowedViewer.value}
                      onChange={(e) => setNewAllowedViewer({ ...newAllowedViewer, value: e.target.value })}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addAllowedViewer}>
                      Añadir
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Visualizadores Permitidos</Label>
                  {allowedViewersFields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay visualizadores permitidos añadidos</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {allowedViewersFields.map((field, index) => (
                        <Badge key={field.id} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                          <span>
                            {field.type === 'EMAIL' ? 'Email:' : 'Dominio:'} {field.value}
                          </span>
                          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => removeAllowedViewer(index)}>
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FormField
          control={form.control}
          name="blockSpecificViewers"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <UserX className="h-4 w-4 mr-2 text-primary" />
                  Bloquear Visualizadores Específicos
                </FormLabel>
                <FormDescription>Impedir acceso a emails o dominios específicos</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <AnimatePresence>
          {form.watch('blockSpecificViewers') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="ml-6 space-y-4 p-4 border rounded-lg">
                <div className="flex flex-col gap-2">
                  <Label>Añadir Visualizador Bloqueado</Label>
                  <div className="flex gap-2">
                    <Select value={newBlockedViewer.type} onValueChange={(value: 'EMAIL' | 'DOMAIN') => setNewBlockedViewer({ ...newBlockedViewer, type: value })}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="DOMAIN">Dominio</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={newBlockedViewer.type === 'EMAIL' ? 'usuario@ejemplo.com' : 'ejemplo.com'}
                      value={newBlockedViewer.value}
                      onChange={(e) => setNewBlockedViewer({ ...newBlockedViewer, value: e.target.value })}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addBlockedViewer}>
                      Añadir
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Visualizadores Bloqueados</Label>
                  {blockedViewersFields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay visualizadores bloqueados añadidos</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {blockedViewersFields.map((field, index) => (
                        <Badge key={field.id} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                          <span>
                            {field.type === 'EMAIL' ? 'Email:' : 'Dominio:'} {field.value}
                          </span>
                          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => removeBlockedViewer(index)}>
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FormField
          control={form.control}
          name="enableScreenshotProtection"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-primary" />
                  Protección contra Capturas
                </FormLabel>
                <FormDescription>Prevenir capturas de pantalla y grabaciones</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enableWatermark"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2 text-primary" />
                  Marca de Agua
                </FormLabel>
                <FormDescription>Aplicar una marca de agua con el email del usuario en todas las páginas</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enableAgreement"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Requerir Acuerdo
                </FormLabel>
                <FormDescription>Los usuarios deben aceptar un acuerdo antes de acceder</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <AnimatePresence>
          {form.watch('enableAgreement') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <FormField
                control={form.control}
                name="agreementId"
                render={({ field }) => (
                  <FormItem className="ml-6">
                    <FormLabel>Seleccionar Acuerdo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un acuerdo" />
                      </SelectTrigger>
                      <SelectContent>
                        {agreements.map((agreement) => (
                          <SelectItem key={agreement.id} value={agreement.id}>
                            {agreement.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
