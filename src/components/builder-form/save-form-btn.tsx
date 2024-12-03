import React, { useTransition } from 'react';
import { UpdateFormContent } from '@/actions/form';
import { FaSpinner } from 'react-icons/fa';
import { HiSaveAs } from 'react-icons/hi';

import useDesigner from '@/hooks/use-designer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

function SaveFormBtn({ id }: { id: string }) {
  const { elements } = useDesigner();
  const [loading, startTransition] = useTransition();

  const updateFormContent = async () => {
    try {
      const jsonElements = JSON.stringify(elements);
      await UpdateFormContent(id, jsonElements);
      toast({
        title: 'Success',
        description: 'Your form has been saved',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };
  return (
    <Button
      variant={'outline'}
      className="gap-2"
      disabled={loading}
      onClick={() => {
        startTransition(updateFormContent);
      }}>
      <HiSaveAs className="h-4 w-4" />
      Save
      {loading && <FaSpinner className="animate-spin" />}
    </Button>
  );
}

export default SaveFormBtn;
