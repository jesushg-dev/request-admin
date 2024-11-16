import { readFileSync, existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const appDir = "src/app/admin";
const schemaPath = 'prisma/schema.prisma';
const schema = /** @type {string} */ (readFileSync(schemaPath, 'utf8'));

// Utility Functions
const convertToCamelCase = (/** @type {string} */ str) => str.charAt(0).toLowerCase() + str.slice(1);
const convertToKebabCase = (/** @type {string} */ str) => str.replace(/(.)([A-Z])/g, '$1-$2').toLowerCase();

const writeFileSafely = (/** @type {string} */ filePath, /** @type {string | NodeJS.ArrayBufferView} */ content) => {
  const directory = dirname(filePath);
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
  if (existsSync(filePath)) unlinkSync(filePath);
  writeFileSync(filePath, content);
};

// Component Generators with Enhanced Internationalization
const createMainPageWithTableComponent = (/** @type {string} */ modelName, /** @type {string} */ camelCaseName, /** @type {string} */ kebabCaseName) => `
"use client";

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { api } from '@/trpc/react';
import { FabComponent } from '@syncfusion/ej2-react-buttons';
import {
    ColumnDirective, ColumnsDirective, GridComponent,
    Inject, Page, Sort, Filter, Group, CommandColumn,
} from '@syncfusion/ej2-react-grids';
import { CommandModel } from '@syncfusion/ej2-grids/src/grid/base/interface';
import type { RouterOutputType } from '@/connections/generic_types';
import useFormSubmit from '@/hooks/useFormSubmit';
import { triggerConfirm } from '@/utils/tools/message';

type InferredOutput = RouterOutputType["${camelCaseName}"]["getWithFilter"]["data"][0];

const pageSettings = { pageSize: 11 };
const filterSettings = { type: 'Excel' };
const editOptions = { allowEditing: true, allowAdding: true, allowDeleting: true, showConfirmDialog: false, mode: 'Dialog' };
const commands: CommandModel[] = [
    { type: 'Edit', buttonOption: { cssClass: 'e-flat', iconCss: 'e-edit e-icons' } },
    { type: 'Delete', buttonOption: { cssClass: 'e-flat', iconCss: 'e-delete e-icons' } }
];

const ${modelName}MainPage: React.FC = () => {
    const router = useRouter();
    const t = useTranslations('admin.${camelCaseName}.main');
    const deleteMutation = api.${camelCaseName}.delete.useMutation();
    const { data } = api.${camelCaseName}.getAll.useQuery();

    const submitDeleteForm = useFormSubmit({
        mutator: deleteMutation,
        successMessage: t('deleteSuccess'),
    });

    const handleClick = () => router.push(\`/admin/${kebabCaseName}/new\`);

    const commandClick = async (args: CommandClickEventArgs) => {
        if (!args.rowData || !args.commandColumn) return;
        const rowData = args.rowData as InferredOutput;

        if (args.commandColumn.type === 'Edit') {
            router.push(\`/admin/${kebabCaseName}/\${rowData.${camelCaseName}Id}\`);
        } else if (args.commandColumn.type === 'Delete') {
            const confirm = await triggerConfirm(t('confirmDelete'));
            if (confirm) await submitDeleteForm({ ${camelCaseName}Id: rowData.${camelCaseName}Id });
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-10">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    {t('title')}
                </h3>
            </div>
            <GridComponent
                id='${camelCaseName}-grid'
                dataSource={data}
                allowGrouping
                allowSorting
                allowFiltering
                allowPaging
                pageSettings={pageSettings}
                filterSettings={filterSettings}
                height="100%"
                editSettings={editOptions}
                commandClick={commandClick}
            >
                <ColumnsDirective>
                    <ColumnDirective headerText={t('actions')} width='120' commands={commands} />
                </ColumnsDirective>
                <Inject services={[Page, Sort, Filter, Group, CommandColumn]} />
            </GridComponent>
            <FabComponent
                id="fab"
                title={t('addNew')}
                cssClass="-translate-y-12 -translate-x-4"
                iconCss="fab-icons fab-icon-add"
                target="#${camelCaseName}-grid"
                onClick={handleClick}
            />
        </div>
    );
};

export default memo(${modelName}MainPage);
`.trim();

const createNewPageWithFormComponent = (/** @type {string} */ modelName, /** @type {string} */ camelCaseName, /** @type {string} */ kebabCaseName) => `
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { api } from '@/trpc/react';
import useFormSubmit from '@/hooks/useFormSubmit';
import { Create${modelName}Schema } from '@/connections/schemas';
import { Input } from '@/components/Form';
import ErrorList from '@/components/Form/ErrorList';

const New${modelName}Page: React.FC = () => {
    const t = useTranslations('admin.${camelCaseName}.create');
    const { mutateAsync: mutate${modelName}Async } = api.${camelCaseName}.create.useMutation();

    const { register, handleSubmit, formState } = useForm({
        resolver: zodResolver(Create${modelName}Schema),
    });

    const submitForm = useFormSubmit(mutate${modelName}Async, {
        redirectUrl: '/admin/${kebabCaseName}',
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    {t('createTitle')}
                </h3>
            </div>
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <form onSubmit={handleSubmit(submitForm)} className="grid grid-cols-2 gap-4 p-6">
                    <Input {...register("fieldName")} placeholder={t('fieldNamePlaceholder')} />
                    <ErrorList formState={formState} />
                    <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
                        {t('createButton')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default New${modelName}Page;
`.trim();

const createUpdatePageWithFormComponent = (/** @type {string} */ modelName, /** @type {string} */ camelCaseName, /** @type {string} */ kebabCaseName) => `
"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/Form';
import ErrorList from '@/components/Form/ErrorList';
import { api } from '@/trpc/react';
import useFormSubmit from '@/hooks/useFormSubmit';
import { Update${modelName}Schema } from '@/connections/schemas';

const Update${modelName}Page: React.FC = () => {
    const t = useTranslations('admin.${camelCaseName}.update');
    const params = useParams<{ slug: string }>();
    const { data } = api.${camelCaseName}.getById.useQuery({ ${camelCaseName}Id: params.slug });

    const update${modelName}Mutation = api.${camelCaseName}.update.useMutation();
    const submitForm = useFormSubmit(update${modelName}Mutation.mutateAsync, {
        redirectUrl: '/admin/${kebabCaseName}',
    });

    const { register, handleSubmit, formState } = useForm({
        defaultValues: data,
        resolver: zodResolver(Update${modelName}Schema),
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    {t('updateTitle')}
                </h3>
            </div>
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <form onSubmit={handleSubmit(submitForm)} className="grid grid-cols-2 gap-4 p-6">
                    <Input {...register("fieldName")} placeholder={t('fieldNamePlaceholder')} />
                    <ErrorList formState={formState} />
                    <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
                        {t('updateButton')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Update${modelName}Page;
`.trim();

// Main function to generate files for each model
const createFilesForModel = (/** @type {string} */ modelName) => {
  const camelCaseName = convertToCamelCase(modelName);
  const kebabCaseName = convertToKebabCase(modelName);

  writeFileSafely(`${appDir}/${kebabCaseName}/page.tsx`, createMainPageWithTableComponent(modelName, camelCaseName, kebabCaseName));
  writeFileSafely(`${appDir}/${kebabCaseName}/new/page.tsx`, createNewPageWithFormComponent(modelName, camelCaseName, kebabCaseName));
  writeFileSafely(`${appDir}/${kebabCaseName}/[slug]/page.tsx`, createUpdatePageWithFormComponent(modelName, camelCaseName, kebabCaseName));
};

// Extract model names from schema or command-line arguments
const tablesFromParam = /** @type {string[]} */ (process.argv.slice(2));
const modelNames = tablesFromParam.length > 0 
  ? tablesFromParam 
  : /** @type {string[]} */ (schema.match(/model (\w+)/g)?.map(line => line.split(' ')[1]) || []);

// Generate files for each model
modelNames.forEach(createFilesForModel);
