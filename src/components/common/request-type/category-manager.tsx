'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, PlusCircle, Trash2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CategoryForm } from '@/components/category-form';

// Mock data - in a real app, this would come from an API
const MOCK_CATEGORIES = [
  {
    id: 'c1',
    name: 'Hardware Issues',
    description: 'Problems related to physical devices',
    isActive: true,
    hierarchyLevelId: 'h1',
    isEligibleForNewClients: true,
    isSubCategoryVisible: true,
    requirements: [
      { value: 'r1', label: 'Device Serial Number' },
      { value: 'r2', label: 'Purchase Date' },
    ],
    forms: [{ value: 'f1', label: 'Hardware Request Form' }],
    sla: {
      id: 's1',
      resolutionTime: 24,
      escalationTime: 4,
    },
    subcategories: [
      {
        id: 'sc1',
        name: 'Laptop Issues',
        description: 'Problems with laptops',
        isActive: true,
        hierarchyLevelId: 'h1',
        requirements: [{ value: 'r3', label: 'Laptop Model' }],
        forms: [{ value: 'f2', label: 'Laptop Repair Form' }],
        sla: {
          id: 's2',
          resolutionTime: 12,
          escalationTime: 2,
        },
        subcategories: [],
      },
      {
        id: 'sc2',
        name: 'Desktop Issues',
        description: 'Problems with desktop computers',
        isActive: true,
        hierarchyLevelId: 'h1',
        requirements: [{ value: 'r4', label: 'Desktop Model' }],
        forms: [{ value: 'f3', label: 'Desktop Repair Form' }],
        sla: {
          id: 's3',
          resolutionTime: 12,
          escalationTime: 2,
        },
        subcategories: [],
      },
    ],
  },
  {
    id: 'c2',
    name: 'Software Issues',
    description: 'Problems related to software applications',
    isActive: true,
    hierarchyLevelId: 'h1',
    isEligibleForNewClients: true,
    isSubCategoryVisible: true,
    requirements: [
      { value: 'r5', label: 'Software Name' },
      { value: 'r6', label: 'Version' },
    ],
    forms: [{ value: 'f4', label: 'Software Issue Form' }],
    sla: {
      id: 's4',
      resolutionTime: 16,
      escalationTime: 4,
    },
    subcategories: [],
  },
];

interface CategoryManagerProps {
  hierarchyId: string;
}

export function CategoryManager({ hierarchyId }: CategoryManagerProps) {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    setIsAddingCategory(true);
    setEditingCategory(null);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setIsAddingCategory(false);
  };

  const handleCancelForm = () => {
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = (category: any) => {
    if (editingCategory) {
      // Update existing category
      setCategories(categories.map((c) => (c.id === category.id ? category : c)));
    } else {
      // Add new category
      setCategories([...categories, { ...category, id: `new-${Date.now()}` }]);
    }
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // In a real app, you would confirm deletion
    setCategories(categories.filter((c) => c.id !== categoryId));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Categories</h3>
          <Button onClick={handleAddCategory} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {categories.length === 0 ? (
          <Alert>
            <AlertDescription>No categories found for this hierarchy. Click the "Add Category" button to create one.</AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[600px] rounded-md border">
            <div className="p-4 space-y-4">
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  isExpanded={expandedCategories.has(category.id)}
                  onToggleExpand={() => toggleExpand(category.id)}
                  onEdit={() => handleEditCategory(category)}
                  onDelete={() => handleDeleteCategory(category.id)}
                  onEditSubcategory={handleEditCategory}
                  onDeleteSubcategory={handleDeleteCategory}
                  expandedCategories={expandedCategories}
                  toggleExpand={toggleExpand}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <div>
        {(isAddingCategory || editingCategory) && (
          <Card>
            <CardContent className="pt-6">
              <CategoryForm initialData={editingCategory} hierarchyId={hierarchyId} onSave={handleSaveCategory} onCancel={handleCancelForm} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface CategoryItemProps {
  category: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditSubcategory: (subcategory: any) => void;
  onDeleteSubcategory: (subcategoryId: string) => void;
  expandedCategories: Set<string>;
  toggleExpand: (id: string) => void;
}

function CategoryItem({ category, isExpanded, onToggleExpand, onEdit, onDelete, onEditSubcategory, onDeleteSubcategory, expandedCategories, toggleExpand }: CategoryItemProps) {
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;

  return (
    <div className="border rounded-md overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        <div className="flex items-center justify-between p-3 bg-muted/30">
          <div className="flex items-center gap-2">
            {hasSubcategories ? (
              <CollapsibleTrigger className="h-5 w-5 inline-flex items-center justify-center rounded-sm hover:bg-muted">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CollapsibleTrigger>
            ) : (
              <div className="w-5" />
            )}
            <div>
              <div className="font-medium">{category.name}</div>
              {category.description && <div className="text-sm text-muted-foreground">{category.description}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {category.isActive ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Inactive
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {hasSubcategories && (
          <CollapsibleContent>
            <div className="pl-6 pr-3 py-2 border-t">
              <div className="space-y-2">
                {category.subcategories.map((subcategory: any) => (
                  <CategoryItem
                    key={subcategory.id}
                    category={subcategory}
                    isExpanded={expandedCategories.has(subcategory.id)}
                    onToggleExpand={() => toggleExpand(subcategory.id)}
                    onEdit={() => onEditSubcategory(subcategory)}
                    onDelete={() => onDeleteSubcategory(subcategory.id)}
                    onEditSubcategory={onEditSubcategory}
                    onDeleteSubcategory={onDeleteSubcategory}
                    expandedCategories={expandedCategories}
                    toggleExpand={toggleExpand}
                  />
                ))}
              </div>
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}
