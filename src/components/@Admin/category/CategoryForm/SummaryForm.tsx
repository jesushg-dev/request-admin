import React from 'react';
import type { FC } from 'react';
import type { CreateCategoryInputs, CreateSubcategoryArrayInputs } from '@/connections/category';
import BackAndContinue from '@/components/common/BackAndContinue';
import { ColumnDirective, ColumnsDirective, GridComponent } from '@syncfusion/ej2-react-grids';
import Scrollable from '@/components/Scrollable';

interface ISummaryFormProps {
  category: CreateCategoryInputs;
  subCategories: CreateSubcategoryArrayInputs;
  goBack: () => void;
  onSubmit: (data: CreateCategoryInputs) => void;
}

const SummaryForm: FC<ISummaryFormProps> = ({ goBack, onSubmit, subCategories, category }) => {
  const handleSubmit = () => {
    const data = { ...category, subCategories: subCategories.subCategories };
    onSubmit(data);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 xl:p-9">
      <Scrollable>
        <div className="flex flex-1 flex-col gap-4">
          <div className="border-stroke dark:border-strokedark xsm:grid-cols-2 grid grid-cols-1 border sm:grid-cols-3">
            <div className="border-stroke dark:border-strokedark border-b border-r px-5 py-4 last:border-r-0 sm:border-b-0">
              <h5 className="mb-1.5 font-bold text-black dark:text-white">Category Name :</h5>
              <span className="text-sm font-medium"> {category.name} </span>
            </div>
            <div className="border-stroke dark:border-strokedark border-b px-5 py-4 last:border-r-0 sm:border-b-0 sm:border-r">
              <h5 className="mb-1.5 font-bold text-black dark:text-white">Area Name :</h5>
              <span className="text-sm font-medium">{category.area.name}</span>
            </div>
            <div className="border-stroke dark:border-strokedark xsm:border-b-0 border-b border-r px-5 py-4 last:border-r-0">
              <h5 className="mb-1.5 font-bold text-black dark:text-white">Request Type :</h5>
              <span className="text-sm font-medium">{category.requestType.name}</span>
            </div>
          </div>
          <span className="block">
            <span className="font-medium text-black dark:text-white">Description: </span>
            {category.description || 'No description'}
          </span>
          <div className="border-stroke dark:border-strokedark border">
            <GridComponent dataSource={subCategories.subCategories}>
              <ColumnsDirective>
                <ColumnDirective headerText="Sucategory" field="name" />
                <ColumnDirective headerText="Description" field="description" />
                <ColumnDirective headerText="Formulario" field="form.name" />
              </ColumnsDirective>
            </GridComponent>
          </div>
        </div>
      </Scrollable>
      <BackAndContinue goBack={goBack} goContinue={handleSubmit} />
    </div>
  );
};

export default SummaryForm;
