import React from 'react';
import type { FC } from 'react';
import BackAndContinue from '@/components/common/back-and-continue';
import { UploaderComponent } from '@syncfusion/ej2-react-inputs';

interface IDocumentFormProps {
  goBack: () => void;
  handleSubmit: () => void;
}

const DocumentForm: FC<IDocumentFormProps> = ({ goBack, handleSubmit }) => {
  return (
    <div className="flex flex-1 flex-col justify-between gap-4 p-6">
      <UploaderComponent id="uploader" />
      <BackAndContinue goBack={goBack} type="button" goContinue={handleSubmit} />
    </div>
  );
};

export default DocumentForm;
