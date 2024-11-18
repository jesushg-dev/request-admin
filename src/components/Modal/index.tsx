import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RiCloseCircleFill } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';

interface IModalProps {
  children?: React.ReactNode;
  className?: string;
  onClickBackdrop?: () => void;
}

const Modal: React.FC<IModalProps> = ({ children, onClickBackdrop, className }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[500000] flex max-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-80" onClick={onClickBackdrop} />
      <div className={twMerge('relative z-50 mx-2 w-full overflow-hidden rounded-2xl bg-white shadow-lg md:mx-0 md:w-3/5 lg:w-2/5', className)}>{children}</div>
    </div>,
    document.body
  );
};

interface ICloseModalProps {
  onClick?: () => void;
  className?: string;
}

const CloseModal: React.FC<ICloseModalProps> = ({ onClick, className }) => {
  return (
    <button onClick={onClick} aria-label="Close Modal" className={twMerge('absolute right-3 top-3 p-2', className)}>
      <RiCloseCircleFill className="h-7 w-7 text-gray-500" />
    </button>
  );
};

export { CloseModal };
export default Modal;
