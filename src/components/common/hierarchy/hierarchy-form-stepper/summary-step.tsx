import { useFormContext } from 'react-hook-form';

import { HierarchyFormValues } from '../hierarchy-form-stepper';

export function SummaryStep() {
  const { getValues } = useFormContext<HierarchyFormValues>();
  const values = getValues();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Summary</h3>
      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {values.name}
        </p>
        <p>
          <strong>Description:</strong> {values.description || 'N/A'}
        </p>
        <p>
          <strong>Type:</strong> {values.type}
        </p>
        <div>
          <strong>Levels:</strong>
          <ul className="list-inside list-disc">
            {values.levels.map((level, index) => (
              <li key={index}>{level.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
