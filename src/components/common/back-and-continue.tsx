import React, { type FC } from 'react';
import Button from '@/components/form/nutton';

interface IBackAndContinueProps {
  goBack?: () => void;
  goContinue?: () => void;
  continueText?: string;
  type?: 'button' | 'submit' | 'reset';
}

const BackAndContinue: FC<IBackAndContinueProps> = ({ goBack, goContinue, type = 'button', continueText }) => {
  return (
    <div className="flex w-full items-center justify-between">
      {goBack ? (
        <Button type="button" onClick={goBack} className="rounded bg-white px-4 py-2 font-bold text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
          Back
        </Button>
      ) : (
        <div />
      )}
      {goContinue || type === 'submit' ? (
        <Button type={type} onClick={goContinue} disabled={goContinue === undefined && type !== 'submit'} className="disabled:opacity-50">
          {continueText || 'Continue'}
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
};

export default BackAndContinue;
