'use client';

import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, HardDrive } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DataroomFolderWithRelations } from '@/types/zenstackhq/document';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FolderTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  children: FolderTreeNode[];
  data: DataroomFolderWithRelations;
}

interface DataroomFolderTreeProps {
  folders: DataroomFolderWithRelations[];
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

export function DataroomFolderTree({ folders, currentFolderId, onFolderSelect }: DataroomFolderTreeProps) {
  const t = useTranslations('admin.dataroom.view');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Build tree structure from flat folder list
  const tree = useMemo(() => {
    const folderMap = new Map<string, FolderTreeNode>();
    const rootNodes: FolderTreeNode[] = [];

    // First pass: create all nodes
    folders.forEach((folder) => {
      folderMap.set(folder.id, {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        children: [],
        data: folder,
      });
    });

    // Second pass: build tree structure
    folders.forEach((folder) => {
      const node = folderMap.get(folder.id)!;
      if (folder.parentId === null) {
        rootNodes.push(node);
      } else {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Orphan node, add to root
          rootNodes.push(node);
        }
      }
    });

    // Sort children alphabetically
    const sortChildren = (nodes: FolderTreeNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach((node) => sortChildren(node.children));
    };
    sortChildren(rootNodes);

    return rootNodes;
  }, [folders]);

  // Auto-expand path to current folder
  useMemo(() => {
    if (currentFolderId === null) return;

    const path: string[] = [];
    let currentId: string | null = currentFolderId;
    const folderMap = new Map(folders.map((f) => [f.id, f]));

    while (currentId) {
      path.unshift(currentId);
      const folder = folderMap.get(currentId);
      currentId = folder?.parentId ?? null;
    }

    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      path.forEach((id) => newSet.add(id));
      return newSet;
    });
  }, [currentFolderId, folders]);

  const toggleExpand = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const renderTreeNode = (node: FolderTreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = currentFolderId === node.id;
    const hasChildren = node.children.length > 0;
    const indentLevel = level * 20;

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn('flex items-center gap-1 py-1.5 rounded-md cursor-pointer text-sm transition-colors', 'hover:bg-accent/50', isSelected && 'bg-accent text-accent-foreground font-medium')}
          style={{ paddingLeft: `${8 + indentLevel}px` }}
          onClick={() => onFolderSelect(node.id)}>
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="flex items-center justify-center w-4 h-4 hover:bg-accent rounded flex-shrink-0">
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          ) : (
            <div className="w-4 flex-shrink-0" />
          )}
          <FolderOpen className={cn('h-4 w-4 flex-shrink-0', isSelected ? 'text-[#4285F4]' : 'text-muted-foreground')} />
          <span className="truncate flex-1">{node.name}</span>
        </div>
        {hasChildren && isExpanded && <div>{node.children.map((child) => renderTreeNode(child, level + 1))}</div>}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col border-r bg-background/50">
      <div className="px-3 py-2 border-b">
        <h3 className="text-sm font-semibold">{t('breadcrumbs.root')}</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-2">
          {/* Root item */}
          <div
            className={cn(
              'flex items-center gap-1 py-1.5 rounded-md cursor-pointer text-sm transition-colors',
              'hover:bg-accent/50',
              currentFolderId === null && 'bg-accent text-accent-foreground font-medium'
            )}
            style={{ paddingLeft: '8px' }}
            onClick={() => onFolderSelect(null)}>
            <div className="w-4 flex-shrink-0" />
            <HardDrive className={cn('h-4 w-4 flex-shrink-0', currentFolderId === null ? 'text-[#4285F4]' : 'text-muted-foreground')} />
            <span className="truncate flex-1">{t('breadcrumbs.root')}</span>
          </div>

          {/* Tree nodes - level 1 (direct children of root, so they need indent) */}
          {tree.map((node) => renderTreeNode(node, 1))}
        </div>
      </ScrollArea>
    </div>
  );
}
