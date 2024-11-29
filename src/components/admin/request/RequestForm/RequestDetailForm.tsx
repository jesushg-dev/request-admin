import React, { FC } from 'react';
import { MdSubject } from 'react-icons/md';

import { createElement } from '@syncfusion/ej2-base';
import { FileManager } from '@syncfusion/ej2-react-richtexteditor';
import { addClass, removeClass, Browser } from '@syncfusion/ej2-base';
import { RichTextEditorComponent, Toolbar, Inject, Image, Link, HtmlEditor, Count, QuickToolbar, Table, EmojiPicker, Video, Audio, FormatPainter, PasteCleanup } from '@syncfusion/ej2-react-richtexteditor';

import { Input, ErrorList } from '@/components/form';
import Scrollable from '@/components/Scrollable';
import { FormElementInstance } from '@/components/@BuilderForm/FormElements';
import FormSubmitComponent from '@/components/@BuilderForm/FormSubmitComponent';
import { useCreateRequestForm, type CreateRequestInputs } from '@/connections/request';
import { api } from '@/components/hoc/tanstack-query-provider';

import BackAndContinue from '../../common/BackAndContinue';

interface RequestFormProps {
  goBack?: () => void;
  onSubmit: (data: CreateRequestInputs) => void;
  defaultValues?: CreateRequestInputs | null;
  subCategoryId?: string | null;
}

const RequestForm: FC<RequestFormProps> = ({ goBack, onSubmit, subCategoryId }) => {
  const { register, handleSubmit, formState } = useCreateRequestForm();
  const { data: form } = api.form.getBySubCategoryId.useQuery({ subCategoryId: subCategoryId! }, { enabled: subCategoryId !== undefined });
  const formContent = form ? (JSON.parse(form.content) as FormElementInstance[]) : [];

  let rteObj;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between gap-4 p-6">
      <Scrollable>
        <div className="flex flex-col gap-4 p-0.5">
          <Input name="issueSubject" type="text" register={register} formState={formState} label="Issue Subject" placeholder="Enter Issue Subject" Icon={MdSubject} />
          <div className="control-pane overflow-hidden rounded-sm">
            <div className="control-section" id="rteTools">
              <div className="rte-control-section">
                <div className="rte-control-section">
                  <RichTextEditorComponent
                    id="toolsRTE"
                    ref={(richtexteditor) => {
                      rteObj = richtexteditor;
                    }}
                    showCharCount={true}
                    toolbarSettings={toolbarSettings}
                    quickToolbarSettings={quickToolbarSettings}
                    enableTabKey={true}>
                    <Inject services={[Toolbar, Image, Link, HtmlEditor, Count, QuickToolbar, Table, EmojiPicker, Video, Audio, FormatPainter, PasteCleanup]} />
                  </RichTextEditorComponent>
                </div>
              </div>
            </div>
          </div>

          {form && formContent && <FormSubmitComponent formUrl={form.shareURL} content={formContent} />}
        </div>
      </Scrollable>
      <ErrorList formState={formState} />
      <BackAndContinue type="submit" goBack={goBack} />
    </form>
  );
};

const items = [
  'Bold',
  'Italic',
  'Underline',
  'StrikeThrough',
  'SuperScript',
  'SubScript',
  '|',
  'FontName',
  'FontSize',
  'FontColor',
  'BackgroundColor',
  '|',
  'LowerCase',
  'UpperCase',
  '|',
  'Formats',
  'Alignments',
  '|',
  'NumberFormatList',
  'BulletFormatList',
  '|',
  'Outdent',
  'Indent',
  '|',
  'CreateLink',
  'Image',
  'Video',
  'Audio',
  'CreateTable',
  '|',
  'FormatPainter',
  'ClearFormat',
  '|',
  'EmojiPicker',
  'Print',
  '|',
  'SourceCode',
  'FullScreen',
  '|',
  'Undo',
  'Redo',
];

const toolbarSettings = {
  items: items,
};

const quickToolbarSettings = {
  table: ['TableHeader', 'TableRows', 'TableColumns', 'TableCell', '-', 'BackgroundColor', 'TableRemove', 'TableCellVerticalAlign', 'Styles'],
  showOnRightClick: true,
};

export default RequestForm;
