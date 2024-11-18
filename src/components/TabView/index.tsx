import React, { createContext, useState, useContext, useEffect, ReactNode, FunctionComponent, SVGProps } from 'react';
import { twMerge } from 'tailwind-merge';
import { triggerError } from '@/utils/tools/message';

interface TabViewProps {
  children?: ReactNode;
  onChange?: (step: number) => void;
  value?: number;
  clickable?: boolean;
  className?: string;
}

interface StepProps {
  label: string;
  index: number;
  Icon?: FunctionComponent<SVGProps<SVGSVGElement>>;
  clickable?: boolean;
  className?: string;
  btnClass?: string;
  btnClassActive?: string;
  btnClassInactive?: string;
  message?: string;
  badge?: string;
}

interface TabContextProps {
  steps: number;
  activeStep: number;
  handleTabClick: (index: number) => void;
  isClickable: boolean;
}

const TabContext = createContext<TabContextProps | undefined>(undefined);

const TabView = ({ children, value, onChange, clickable = false, className }: TabViewProps) => {
  const steps = React.Children.count(children);
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    if (value !== undefined && value !== activeStep) {
      setActiveStep(value);
    }
  }, [value, activeStep]);

  const handleTabClick = (index: number) => {
    setActiveStep(index);
    onChange?.(index);
  };

  return (
    <TabContext.Provider value={{ activeStep, handleTabClick, steps, isClickable: clickable }}>
      <div className={twMerge('mb-2 border-b text-center text-sm font-medium text-gray-500 shadow-md', className)}>
        <ul className={twMerge('-mb-px flex flex-wrap gap-2 text-center text-sm font-medium text-gray-500')}>{React.Children.map(children, (child) => child)}</ul>
      </div>
    </TabContext.Provider>
  );
};

const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabContext must be used within a TabView');
  }
  return context;
};

const Tab = ({ label, index, Icon, clickable = false, className, btnClass, btnClassActive, btnClassInactive, message, badge }: StepProps) => {
  const { activeStep, handleTabClick, isClickable } = useTabContext();
  const isActive = index === activeStep;
  const finalClassName = twMerge(
    `relative flex gap-2 items-center justify-center rounded-t-lg border-b-2 border-transparent p-4 ${
      isActive ? `border-gray-500 text-blue-500 ${btnClassActive}` : `hover:border-gray-300 hover:text-gray-600 ${btnClassInactive}`
    }`,
    btnClass,
    className
  );

  const onClick = async () => {
    if (clickable || isClickable) {
      handleTabClick(index);
    } else if (message) {
      await triggerError(message);
    }
  };

  return (
    <li className="relative">
      <button type="button" title={label} onClick={onClick} className={finalClassName}>
        {Icon && <Icon className={`mr-2 h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />}
        {label}
        {badge && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-red-500 text-xs font-bold leading-none text-white">
            {badge}
          </span>
        )}
      </button>
    </li>
  );
};

export { Tab, useTabContext };
export default TabView;
