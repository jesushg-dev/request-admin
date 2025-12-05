import { useDraggable } from '@dnd-kit/core';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { ElementsType, FormElement } from './form-elements';

function SidebarBtnElement({ formElement }: { formElement: FormElement }) {
  const t = useTranslations('component.form.builderFields.types');
  const { icon: Icon } = formElement.designerBtnElement;

  // Map element type to translation key
  const getTranslationKey = (type: ElementsType): string => {
    const mapping: Record<ElementsType, string> = {
      TextField: 'textField',
      TextAreaField: 'textareaField',
      NumberField: 'numberField',
      DateField: 'dateField',
      SelectField: 'selectField',
      CheckboxField: 'checkboxField',
      TitleField: 'titleField',
      SubTitleField: 'subtitleField',
      ParagraphField: 'paragraphField',
      SeparatorField: 'separatorField',
      SpacerField: 'spacerField',
    };
    return mapping[type];
  };

  const label = t(getTranslationKey(formElement.type) as any);

  const draggable = useDraggable({
    id: `designer-btn-${formElement.type}`,
    data: {
      type: formElement.type,
      isDesignerBtnElement: true,
    },
  });

  return (
    <Button
      ref={draggable.setNodeRef}
      variant={'outline'}
      className={cn('flex h-8 w-full cursor-grab items-center justify-between gap-2', draggable.isDragging && 'ring-primary ring-2')}
      {...draggable.listeners}
      {...draggable.attributes}>
      <Icon className="text-primary h-5 w-5 cursor-grab" />
      <p className="text-xs">{label}</p>
    </Button>
  );
}

export function SidebarBtnElementDragOverlay({ formElement }: { formElement: FormElement }) {
  const t = useTranslations('component.form.builderFields.types');
  const { icon: Icon } = formElement.designerBtnElement;

  // Map element type to translation key
  const getTranslationKey = (type: ElementsType): string => {
    const mapping: Record<ElementsType, string> = {
      TextField: 'textField',
      TextAreaField: 'textareaField',
      NumberField: 'numberField',
      DateField: 'dateField',
      SelectField: 'selectField',
      CheckboxField: 'checkboxField',
      TitleField: 'titleField',
      SubTitleField: 'subtitleField',
      ParagraphField: 'paragraphField',
      SeparatorField: 'separatorField',
      SpacerField: 'spacerField',
    };
    return mapping[type];
  };

  const label = t(getTranslationKey(formElement.type) as any);

  return (
    <Button variant={'outline'} className="flex h-[120px] w-[120px] cursor-grab flex-col gap-2">
      <Icon className="text-primary h-8 w-8 cursor-grab" />
      <p className="text-xs">{label}</p>
    </Button>
  );
}

export default SidebarBtnElement;
