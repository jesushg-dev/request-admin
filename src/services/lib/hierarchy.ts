/*import { CreateHierarchyInputs } from '@/connections/user';
import type { AreaUserHierarchy } from '@/server/api/routers/userRouter';

export type Employee = {
  Id: string | number;
  Name: string;
  Designation: string;
  ImageUrl: string;
  IsExpand: string;
  RatingColor: string;
  ReportingPerson?: string | number;
};

export type TreeNode = {
  id: string;
  name: string;
  position?: string;
  image?: string;
  children?: TreeNode[];
  canHaveChildren?: boolean;
  parentId?: string | null;
  depth?: number;
  index?: number;
  isLast?: boolean;
  parent?: TreeNode | null;
};

export const flattenTree = (nodes: TreeNode[], parentId?: string): Employee[] => {
  let result: Employee[] = [];

  nodes.forEach((node) => {
    const { id, name, position, image, children } = node;

    // Convert TreeNode to Employee format
    const employee: Employee = {
      Id: id,
      Name: name,
      Designation: position || '',
      ImageUrl: image || '',
      IsExpand: children && children.length > 0 ? 'true' : 'false', // Example logic
      RatingColor: '#C34444', // Example default value or adjust as necessary
      ReportingPerson: parentId,
    };

    result.push(employee);

    // If this node has children, recursively flatten them and add to the result
    if (children?.length) {
      result = result.concat(flattenTree(children, id));
    }
  });

  return result;
};

export const extractRelations = (nodes: AreaUserHierarchy[]): CreateHierarchyInputs => {
  // Initialize an empty array to hold all the relations
  const relations: CreateHierarchyInputs = [];

  // Function to traverse the AreaUserHierarchy structure
  const traverse = (node: AreaUserHierarchy, parentId: string | null = null) => {
    // Find or create the relation object for the current parentId (coordinator)
    let relation = relations.find((r) => r.coordinatorId === parentId);
    if (!relation) {
      relation = { id: node.id, coordinatorId: parentId, employeesUserIds: [] };
      relations.push(relation);
    }

    // Ensure employeesUserIds is initialized and push the current node's id
    if (node.id !== parentId && parentId !== null) {
      // Avoid adding the root node to employees
      relation.employeesUserIds.push(node.id);
    }

    // Recurse for each child
    node.children?.forEach((child) => traverse(child, node.id));
  };

  // Start the traversal from the root nodes
  nodes.forEach((node) => traverse(node));

  return relations;
};
*/
