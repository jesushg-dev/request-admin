import React, { type FC } from 'react';
import { ChevronDown, ChevronRight, FolderTree } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { AreaFormStepperType } from '../area/area-form-stepper';

type Categories = AreaFormStepperType['categories'];
type Category = Categories[0];

const AssignmentCategoriesReview: FC = ({}) => {
  const { name, description, isActive, categories } = useWatch<AreaFormStepperType>();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-semibold">{name}</CardTitle>
          <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            <CardTitle className="text-xl">Categories</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CategoryTreeGrid categories={categories as Categories} />
        </CardContent>
      </Card>
    </>
  );
};

interface TreeGridItem extends Category {
  level: number;
  isExpanded: boolean;
}

const CategoryTreeGrid: React.FC<{ categories: Categories }> = ({ categories }) => {
  const [treeData, setTreeData] = React.useState<TreeGridItem[]>(flattenCategories(categories));

  function flattenCategories(categories: Category[], level = 0): TreeGridItem[] {
    return categories.reduce((acc: TreeGridItem[], category) => {
      const treeItem: TreeGridItem = { ...category, level, isExpanded: false };
      acc.push(treeItem);
      if (category.subcategories.length > 0) {
        acc.push(...flattenCategories(category.subcategories, level + 1));
      }
      return acc;
    }, []);
  }

  const toggleExpand = (id: string) => {
    setTreeData((prevData) => prevData.map((item) => (item.id === id ? { ...item, isExpanded: !item.isExpanded } : item)));
  };

  const visibleRows = treeData.filter((item, index) => {
    if (item.level === 0) return true;
    const parentIndex = treeData.findIndex((parent) => parent.subcategories.some((sub: Category) => sub.id === item.id));
    return treeData.slice(0, index).every((ancestor, i) => (i === parentIndex ? ancestor.isExpanded : true));
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Name</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleRows.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                <span style={{ marginLeft: `${item.level * 20}px` }} className="mr-2">
                  {item.subcategories.length > 0 && (
                    <button type="button" onClick={() => toggleExpand(item.id)} className="p-1">
                      {item.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  )}
                </span>
                {item.name}
              </div>
            </TableCell>
            <TableCell>{item.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AssignmentCategoriesReview;
