'use client';

import { useState, type FC } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, CheckSquare, ChevronDown, ChevronUp, Download, FileText, Hash, Link2, LinkIcon, List, ListFilter, MessageSquare, Phone, Plus, Trash2, Type } from 'lucide-react';
import { Control, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import EmptyState from '@/components/shared/empty-state';

import { Security } from './security';

// Field type options with icons
const fieldTypeOptions = [
  { value: 'SHORT_TEXT', label: 'Texto Corto', icon: <Type className="h-4 w-4" /> },
  { value: 'LONG_TEXT', label: 'Texto Largo', icon: <FileText className="h-4 w-4" /> },
  { value: 'NUMBER', label: 'Número', icon: <Hash className="h-4 w-4" /> },
  { value: 'PHONE_NUMBER', label: 'Teléfono', icon: <Phone className="h-4 w-4" /> },
  { value: 'URL', label: 'URL', icon: <Link2 className="h-4 w-4" /> },
  { value: 'CHECKBOX', label: 'Casilla', icon: <CheckSquare className="h-4 w-4" /> },
  { value: 'SELECT', label: 'Selección', icon: <List className="h-4 w-4" /> },
  { value: 'MULTI_SELECT', label: 'Selección Múltiple', icon: <ListFilter className="h-4 w-4" /> },
];

// Define the schema for form validation
const linkFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less').default(''),
    expirationDate: z.date().optional(),
    enablePassword: z.boolean().default(false),
    password: z.string().optional(),
    emailProtected: z.boolean().default(false),
    emailAuthenticated: z.boolean().default(false),
    enableScreenshotProtection: z.boolean().default(false),
    enableWatermark: z.boolean().default(false),
    enableAgreement: z.boolean().default(false),
    agreementId: z.string().optional(),
    allowDownload: z.boolean().default(false),
    enableNotification: z.boolean().default(false),
    enableFeedback: z.boolean().default(false),
    enableQuestion: z.boolean().default(false),
    allowSpecificViewers: z.boolean().default(false),
    allowedViewers: z
      .array(
        z.object({
          value: z.string().min(1, 'El valor no puede estar vacío'),
          type: z.enum(['EMAIL', 'DOMAIN']),
        })
      )
      .default([]),
    blockSpecificViewers: z.boolean().default(false),
    blockedViewers: z
      .array(
        z.object({
          value: z.string().min(1, 'El valor no puede estar vacío'),
          type: z.enum(['EMAIL', 'DOMAIN']),
        })
      )
      .default([]),
    customFields: z
      .array(
        z.object({
          id: z.string(),
          type: z.string(),
          label: z.string().min(1, 'La etiqueta es obligatoria'),
          placeholder: z.string().optional(),
          description: z.string().optional(),
          required: z.boolean().default(false),
          disabled: z.boolean().default(false),
        })
      )
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (data.enablePassword && !data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Contraseña es requerida cuando habilitas la protección por contraseña',
        path: ['password'],
      });
    }
  });

export type LinkFormValues = z.infer<typeof linkFormSchema>;

const getDefaultLinkValues = (): LinkFormValues => {
  return {
    name: '',
    expirationDate: undefined,
    enablePassword: false,
    password: '',
    emailProtected: false,
    emailAuthenticated: false,
    enableScreenshotProtection: false,
    enableWatermark: false,
    enableAgreement: false,
    agreementId: undefined,
    allowDownload: false,
    enableNotification: false,
    enableFeedback: false,
    enableQuestion: false,
    allowSpecificViewers: false,
    allowedViewers: [],
    blockSpecificViewers: false,
    blockedViewers: [],
    customFields: [],
  };
};

// Section component with collapsible functionality
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Section = ({ title, icon, children, defaultOpen = true }: SectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors">
        <div className="flex items-center text-lg font-medium">
          {icon}
          <span className="ml-2">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Custom field row component
interface CustomFieldRowProps {
  field: { id: string };
  index: number;
  control: Control<LinkFormValues>;
  remove: (index: number) => void;
}

const CustomFieldRow = ({ field, index, control, remove }: CustomFieldRowProps) => {
  return (
    <div className="p-3 border rounded-md bg-muted/10 hover:bg-muted/20 transition-colors flex flex-col gap-2">
      <div className="flex items-center gap-2 ">
        <FormField control={control} name={`customFields.${index}.label`} render={({ field: labelField }) => <Input {...labelField} placeholder="Etiqueta" className="flex-1" />} />

        <div className="flex items-center gap-3 ml-auto">
          <FormField
            control={control}
            name={`customFields.${index}.required`}
            render={({ field: requiredField }) => (
              <div className="flex items-center gap-1">
                <Switch checked={requiredField.value} onCheckedChange={requiredField.onChange} id={`field-${field.id}-required`} />
                <Label htmlFor={`field-${field.id}-required`} className="text-xs">
                  Requerido
                </Label>
              </div>
            )}
          />

          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FormField
            control={control}
            name={`customFields.${index}.type`}
            render={({ field: typeField }) => (
              <Select value={typeField.value} onValueChange={typeField.onChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <div className="flex items-center">
                      {fieldTypeOptions.find((option) => option.value === typeField.value)?.icon}
                      <span className="ml-2">{fieldTypeOptions.find((option) => option.value === typeField.value)?.label || 'Tipo'}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {fieldTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        {option.icon}
                        <span className="ml-2">{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FormField
            control={control}
            name={`customFields.${index}.placeholder`}
            render={({ field: placeholderField }) => <Input {...placeholderField} placeholder="Placeholder" className="flex-1" />}
          />
        </div>

        <FormField
          control={control}
          name={`customFields.${index}.description`}
          render={({ field: descriptionField }) => <Input {...descriptionField} placeholder="Descripción" className="flex-1" />}
        />
      </div>
    </div>
  );
};

interface LinkFormProps {
  tenantId: string;
  linkType: 'DOCUMENT_LINK' | 'DATAROOM_LINK';
  defaultValues?: LinkFormValues;
}

export const LinkForm: FC<LinkFormProps> = ({ tenantId, defaultValues, linkType }) => {
  // Use mock data instead of hooks

  const form = useForm<LinkFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(linkFormSchema),
    defaultValues: defaultValues ?? getDefaultLinkValues(),
  });

  // Use field array for custom fields
  const { fields: customFieldsFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({ control: form.control, name: 'customFields' });

  const handleCopyLink = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success('Link copiado al portapapeles'))
      .catch(() => toast.error('Error al copiar el link'));
  };

  const onSubmit = (data: LinkFormValues) => {
    console.log(data);
    toast.success('Configuración de enlace guardada correctamente');
  };

  const addCustomField = () => {
    appendCustomField({
      id: Date.now().toString(),
      type: 'SHORT_TEXT',
      label: '',
      placeholder: '',
      description: '',
      required: false,
      disabled: false,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="flex flex-1 flex-col justify-between overflow-hidden px-1 gap-4">
            {/* Basic Information Section */}
            <Section title="Información Básica" icon={<LinkIcon className="h-5 w-5 text-primary" />} defaultOpen={true}>
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Enlace</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa un nombre para este enlace" {...field} />
                      </FormControl>
                      <FormDescription>Solo para tu referencia</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Expiración</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={`w-full justify-start text-left font-normal ${!field.value && 'text-muted-foreground'}`}>
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={(date) => date < new Date()} />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>El enlace dejará de funcionar después de esta fecha</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            {/* Security Section */}
            <Security tenantId={tenantId} />

            {/* Features Section */}
            <Section title="Características Adicionales" icon={<FileText className="h-5 w-5 text-primary" />} defaultOpen={true}>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="allowDownload"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center">
                          <Download className="h-4 w-4 mr-2 text-primary" />
                          Permitir Descarga
                        </FormLabel>
                        <FormDescription>Permitir a los usuarios descargar el documento</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableNotification"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center">
                          <Bell className="h-4 w-4 mr-2 text-primary" />
                          Habilitar Notificaciones
                        </FormLabel>
                        <FormDescription>Recibir notificaciones cuando el documento sea visto</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableFeedback"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                          Habilitar Feedback
                        </FormLabel>
                        <FormDescription>Permitir a los usuarios proporcionar feedback</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableQuestion"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                          Habilitar Preguntas
                        </FormLabel>
                        <FormDescription>Permitir a los usuarios hacer preguntas sobre el documento</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            {/* Custom Fields Section */}
            <Section title="Campos Personalizados" icon={<FileText className="h-5 w-5 text-primary" />} defaultOpen={true}>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Estos campos se presentarán a los usuarios cuando accedan a tu enlace compartido. Úsalos para recopilar información de los usuarios.</p>

                <div className="space-y-3">
                  {customFieldsFields.map((field, index) => (
                    <CustomFieldRow key={field.id} field={field} index={index} control={form.control} remove={removeCustomField} />
                  ))}
                </div>

                {customFieldsFields.length === 0 && (
                  <EmptyState icons={[Plus]} title="Sin Campos Personalizados" description="No hay campos personalizados añadidos aún. Añade campos para recopilar información de los usuarios." />
                )}

                <div className="flex justify-center mt-4">
                  <Button type="button" variant="outline" onClick={addCustomField} className="w-full border border-dashed">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Campo Personalizado
                  </Button>
                </div>
              </div>
            </Section>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" size="lg">
            Guardar Configuración
          </Button>
        </div>
      </form>
    </Form>
  );
};
