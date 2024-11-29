import React, { FC } from 'react';
import { type IEmployee } from '@/utils/types';
import { MdCheck } from 'react-icons/md';

import Card from '@/components/Card';

interface IEmployeeCardProps extends IEmployee {
  isSelected: boolean;
  onClick?: () => void;
  style: React.CSSProperties;
}

const EmployeeCard: FC<IEmployeeCardProps> = ({ style, name, email, position, image, onClick, isSelected }) => {
  const initialName = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : 'N/A';

  return (
    <div style={style} className="w-full cursor-pointer text-sm font-bold text-gray-900" onClick={onClick}>
      <Card className={`my-1 flex flex-col border border-l-8 border-gray-100 lg:flex-row ${isSelected && 'bg-cyan-50'}`}>
        <div className="flex w-full justify-between px-6 py-1">
          <div className="flex items-center">
            {image ? (
              <img src={image} alt={initialName} className="h-12 w-12 rounded-full" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 font-bold uppercase text-white">{initialName}</div>
            )}
            <div className="ml-4">
              <p className="font-bold">{name}</p>
              <p className="text-xs text-gray-700">{position || 'No position'}</p>
            </div>
          </div>
          {isSelected && (
            <div className="flex w-20 flex-col items-center justify-center">
              <MdCheck className="text-primary-500 h-10 font-medium" size="2rem" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmployeeCard;
