import { CheckboxFieldFormElement } from './fields/checkbox-field';
import { DateFieldFormElement } from './fields/date-field';
import { NumberFieldFormElement } from './fields/number-field';
import { ParagraphFieldFormElement } from './fields/paragraph-field';
import { SelectFieldFormElement } from './fields/select-field';
import { SeparatorFieldFormElement } from './fields/separator-field';
import { SpacerFieldFormElement } from './fields/spacer-field';
import { SubTitleFieldFormElement } from './fields/subtitle-field';
import { TextFieldFormElement } from './fields/text-field';
import { TextAreaFormElement } from './fields/textarea-field';
import { TitleFieldFormElement } from './fields/title-field';

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
  ParagraphField: ParagraphFieldFormElement,
  SeparatorField: SeparatorFieldFormElement,
  SpacerField: SpacerFieldFormElement,
  NumberField: NumberFieldFormElement,
  TextAreaField: TextAreaFormElement,
  DateField: DateFieldFormElement,
  SelectField: SelectFieldFormElement,
  CheckboxField: CheckboxFieldFormElement,
};
