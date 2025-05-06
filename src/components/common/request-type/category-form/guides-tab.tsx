'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Edit, FileText, FileUp, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormItem } from '@/components/shared/form-root';

import { RequestCategoryValues } from '.';

export const guideSchema = z.object({
  id: z.string(),
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  fileType: z.enum(['PDF', 'Excel', 'Video', 'DOCX', 'XLSX']),
  fileUrl: z.string().url('Debe ser una URL válida'),
  version: z.string().min(1, 'La versión es requerida'),
  updatedAt: z.string().datetime('Fecha inválida'),
});

type GuideFormValues = z.infer<typeof guideSchema>;

type Guide = GuideFormValues & {
  id: string;
};

export function GuideTab() {
  const t = useTranslations('admin.requestType.create.guidesTab');
  const { control, watch, setValue } = useFormContext<RequestCategoryValues>();
  const { fields, append, update, remove } = useFieldArray({ control, name: 'guides' });

  const [modalOpen, setModalOpen] = useState(false);
  const [currentGuideIndex, setCurrentGuideIndex] = useState<number | null>(null);

  const executionSteps = watch('executionSteps', []);
  const guides = watch('guides', []);

  const handleSaveGuide = (data: GuideFormValues) => {
    if (currentGuideIndex !== null) {
      update(currentGuideIndex, { ...guides[currentGuideIndex], ...data });
      toast.success(t('updateSuccess'));
    } else {
      append({ ...data, id: crypto.randomUUID() });
      toast.success(t('createSuccess'));
    }
    setModalOpen(false);
  };

  const handleDeleteGuide = (index: number) => {
    const guideId = fields[index].id;

    const updatedSteps = executionSteps.map((step) => ({
      ...step,
      linkedGuides: step.linkedGuides?.filter((id: string) => id !== guideId) || [],
    }));

    setValue('executionSteps', updatedSteps);
    remove(index);
    toast.success(t('deleteSuccess'));
  };

  const handleAddGuide = () => {
    setCurrentGuideIndex(null);
    setModalOpen(true);
  };

  return (
    <>
      {fields.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{t('noGuides')}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {field.fileType === 'PDF' && <FileText className="h-5 w-5 text-red-500" />}
                    {field.fileType === 'Excel' && <FileText className="h-5 w-5 text-green-500" />}
                    {field.fileType === 'Video' && <FileText className="h-5 w-5 text-blue-500" />}
                    <CardTitle className="text-base">{field.title}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setCurrentGuideIndex(index);
                        setModalOpen(true);
                      }}
                      aria-label={t('editGuide')}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteGuide(index)} aria-label={t('deleteGuide')}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {field.description && <p className="text-sm text-muted-foreground mb-4">{field.description}</p>}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">{t('fileType')}</span>
                    <span className="font-medium">{field.fileType}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">{t('version')}</span>
                    <span className="font-medium">{field.version}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">{t('lastUpdated')}</span>
                    <span className="font-medium">
                      {new Date(field.updatedAt).toLocaleDateString(t('locale'), {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={field.fileUrl} target="_blank">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {t('view')}
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link href={field.fileUrl} download>
                    <FileUp className="mr-2 h-4 w-4" />
                    {t('download')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Button onClick={handleAddGuide} type="button" variant="dashed" className="w-full" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        {t('addGuide')}
      </Button>

      <GuideModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveGuide} initialData={currentGuideIndex !== null ? guides[currentGuideIndex] : undefined} />
    </>
  );
}

function GuideModal({ open, onClose, onSave, initialData }: { open: boolean; onClose: () => void; onSave: (data: GuideFormValues) => void; initialData?: Guide }) {
  const t = useTranslations('admin.requestType.create.guidesTab');
  const form = useForm<GuideFormValues>({
    resolver: zodResolver(guideSchema),
    defaultValues: {
      title: '',
      description: '',
      fileType: 'PDF',
      fileUrl: '',
      version: '',
      updatedAt: new Date().toISOString(),
    },
  });

  useEffect(() => {
    form.reset(
      initialData ?? {
        title: '',
        description: '',
        fileType: 'PDF',
        fileUrl: '',
        version: '',
        updatedAt: new Date().toISOString(),
      }
    );
  }, [open, initialData, form]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? t('editGuide') : t('newGuide')}</DialogTitle>
          <DialogDescription>{initialData ? t('editGuideDescription') : t('newGuideDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem label={t('title')} description={t('titleDescription')}>
                  <Input {...field} placeholder={t('titlePlaceholder')} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem label={t('description')} description={t('guideDescriptionDescription')}>
                  <Textarea {...field} placeholder={t('descriptionPlaceholder')} rows={3} value={field.value || ''} />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fileType"
                render={({ field }) => (
                  <FormItem label={t('fileType')} description={t('fileTypeDescription')}>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectFileType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Excel">Excel</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem label={t('version')} description={t('versionDescription')}>
                    <Input {...field} placeholder={t('versionPlaceholder')} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem label={t('fileUrl')} description={t('fileUrlDescription')}>
                  <Input {...field} placeholder={t('fileUrlPlaceholder')} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="updatedAt"
              render={({ field }) => (
                <FormItem label={t('lastUpdated')} description={t('lastUpdatedDescription')}>
                  <Input type="datetime-local" {...field} value={new Date(field.value).toISOString().slice(0, 16)} onChange={(e) => field.onChange(new Date(e.target.value).toISOString())} />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button type="submit">{initialData ? t('saveChanges') : t('createGuide')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
