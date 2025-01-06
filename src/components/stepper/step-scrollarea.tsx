import { ScrollArea } from '../ui/scroll-area';

interface StepScrollAreaProps {
  children: React.ReactNode;
}

export const StepScrollArea: React.FC<StepScrollAreaProps> = ({ children }) => {
  return (
    <div className="flex flex-1 overflow-y-hidden">
      <ScrollArea className="w-full flex-1 overflow-y-hidden">{children}</ScrollArea>
    </div>
  );
};
