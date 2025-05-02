import { JsonData, JsonEditor } from 'json-edit-react';

import { Card } from '../ui/card';

export const JsonInput = ({ value, onChange }: { value: JsonData; onChange: (value: JsonData) => void }) => {
  return (
    <Card className="p-4">
      <JsonEditor
        className="w-full"
        data={value}
        onChange={(data) => {
          onChange(data);
          return data.newValue;
        }}
        theme={{
          displayName: 'Shadcn Completo',
          fragments: {
            edit: 'hsl(var(--success))',
          },
          styles: {
            container: {
              backgroundColor: 'hsl(var(--background))',
              fontFamily: 'var(--font-mono)',
              borderRadius: 'calc(var(--radius) - 2px)',
              padding: '1rem',
            },
            collection: {
              margin: '0.5rem 0',
            },
            collectionInner: {
              marginLeft: '1rem',
              paddingLeft: '1rem',
              borderLeft: '2px solid hsl(var(--border))',
            },
            collectionElement: {
              padding: '0.25rem 0.5rem',
              transition: 'background-color 0.2s',
            },
            dropZone: {
              border: '2px dashed hsl(var(--border))',
              borderRadius: 'var(--radius)',
              padding: '0.5rem',
              margin: '0.5rem 0',
            },
            property: {
              color: 'hsl(var(--foreground))',
            },
            bracket: {
              color: 'hsl(var(--primary))',
              fontWeight: 'bold',
            },
            itemCount: {
              color: 'hsl(var(--muted-foreground))',
              fontStyle: 'italic',
            },
            string: {
              color: 'hsl(var(--destructive))',
            },
            number: {
              color: 'hsl(var(--primary))',
            },
            boolean: {
              color: 'hsl(var(--success))',
            },
            null: {
              color: 'hsl(var(--destructive))',
              fontVariant: 'small-caps',
              fontWeight: 'bold',
            },
            input: {
              color: 'hsl(var(--foreground))',
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
            },
            inputHighlight: {
              backgroundColor: 'hsl(var(--accent)/0.3)',
            },
            error: {
              fontSize: '0.875rem',
              color: 'hsl(var(--destructive))',
              fontWeight: 'bold',
            },
            iconCollection: {
              color: 'hsl(var(--primary))',
            },
            iconEdit: {
              color: 'hsl(var(--success))',
            },
            iconDelete: {
              color: 'hsl(var(--destructive))',
            },
            iconAdd: {
              color: 'hsl(var(--success))',
            },
            iconCopy: {
              color: 'hsl(var(--primary))',
            },
            iconOk: {
              color: 'hsl(var(--success))',
            },
            iconCancel: {
              color: 'hsl(var(--destructive))',
            },
          },
        }}
      />
    </Card>
  );
};
