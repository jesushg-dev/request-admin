import React, { FC } from 'react';
import { MdInfoOutline } from 'react-icons/md';
import { RiCloseCircleFill } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';

interface IAlertProps {
  title: string;
  message: string;
  className?: string;
  isClose?: boolean;
  showClose?: boolean;
  onClickClose?: () => void;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}

const Alert: FC<IAlertProps> = ({ title, message, icon, className, onClickClose, isClose = false, showClose = false }) => {
  const Icon = icon || MdInfoOutline;

  if (isClose) {
    return null;
  }

  return (
    <div role="alert" className={twMerge('relative flex rounded-lg bg-green-100 p-4 text-sm text-green-700 dark:bg-green-200 dark:text-green-800', className)}>
      <Icon className="mr-3 inline h-5 w-5 flex-shrink-0" />
      <span className="sr-only">Info</span>
      <div>
        <span className="font-medium">{title}:</span> {message}.
      </div>
      {showClose && (
        <button type="button" onClick={onClickClose} aria-label="Close Alert" className="absolute right-2 top-2">
          <RiCloseCircleFill className="text-2xl text-green-800" />
        </button>
      )}
    </div>
  );
};

export default Alert;
