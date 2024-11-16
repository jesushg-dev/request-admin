import { CheckboxFieldFormElement } from '../fields/CheckboxField';
import { DateFieldFormElement } from '../fields/DateField';
import { NumberFieldFormElement } from '../fields/NumberField';
import { ParagprahFieldFormElement } from '../fields/ParagraphField';
import { SelectFieldFormElement } from '../fields/SelectField';
import { SeparatorFieldFormElement } from '../fields/SeparatorField';
import { SpacerFieldFormElement } from '../fields/SpacerField';
import { SubTitleFieldFormElement } from '../fields/SubTitleField';
import { TextAreaFormElement } from '../fields/TextAreaField';
import { TextFieldFormElement } from '../fields/TextField';
import { TitleFieldFormElement } from '../fields/TitleField';

type StyleElementsType = {
  [key in ElementsType]: React.CSSProperties;
};

export const styleElements = {
  TextField: {
    height: 120,
  },
  NumberField: {
    height: 120,
  },
  TextAreaField: {
    height: 130,
  },
  DateField: {
    height: 120,
  },
  SelectField: {
    height: 120,
  },
  CheckboxField: {
    height: 120,
  },
  TitleField: {
    height: 70,
  },
  SubTitleField: {
    height: 120,
  },
  ParagraphField: {
    height: 120,
  },
  SeparatorField: {
    height: 40,
  },
  SpacerField: {
    height: 80,
  },
} satisfies StyleElementsType;

export type ElementsType =
  | 'TextField'
  | 'TitleField'
  | 'SubTitleField'
  | 'ParagraphField'
  | 'SeparatorField'
  | 'SpacerField'
  | 'NumberField'
  | 'TextAreaField'
  | 'DateField'
  | 'SelectField'
  | 'CheckboxField';

export type SubmitFunction = (key: string, value: string) => void;

export type FormElement = {
  type: ElementsType;

  construct: (id: string) => FormElementInstance;

  designerBtnElement: {
    icon: React.ElementType;
    label: string;
  };

  designerComponent: React.FC<{
    elementInstance: FormElementInstance;
  }>;
  formComponent: React.FC<{
    elementInstance: FormElementInstance;
    submitValue?: SubmitFunction;
    isInvalid?: boolean;
    defaultValue?: string;
  }>;
  propertiesComponent: React.FC<{
    elementInstance: FormElementInstance;
  }>;

  validate: (formElement: FormElementInstance, currentValue: string) => boolean;
};

export type FormElementInstance = {
  id: string;
  type: ElementsType;
  extraAttributes?: Record<string, any>;
};

type FormElementsType = {
  [key in ElementsType]: FormElement;
};
export const FormElements: FormElementsType = {
  TextField: TextFieldFormElement,
  TitleField: TitleFieldFormElement,
  SubTitleField: SubTitleFieldFormElement,
  ParagraphField: ParagprahFieldFormElement,
  SeparatorField: SeparatorFieldFormElement,
  SpacerField: SpacerFieldFormElement,
  NumberField: NumberFieldFormElement,
  TextAreaField: TextAreaFormElement,
  DateField: DateFieldFormElement,
  SelectField: SelectFieldFormElement,
  CheckboxField: CheckboxFieldFormElement,
};
