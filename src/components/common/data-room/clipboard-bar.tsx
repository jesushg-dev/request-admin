'use client';

import { ChevronDown, ChevronUp, Clipboard, File, Folder, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useClipboard } from '@/components/hoc/clipboard-context';

export function ClipboardBar() {
  const { clipboard, isClipboardExpanded: isExpanded, toggleClipboardExpanded: toggleExpanded, clearClipboard, removeFromClipboard } = useClipboard();

  if (clipboard.length === 0) return null;

  return (
    <div className={cn(' bottom-0 left-0 right-0 bg-background border-t shadow-md z-50', 'transition-transform transform', isExpanded ? 'fixed' : 'block')}>
      <Collapsible open={isExpanded} onOpenChange={toggleExpanded}>
        <div className="p-2 flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Clipboard className="h-4 w-4 mr-2" />
            <span>
              {clipboard.length} item{clipboard.length !== 1 ? 's' : ''} in clipboard
            </span>
          </div>
          <div className="flex gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </Button>
            </CollapsibleTrigger>

            <Button size="sm" variant="outline" onClick={clearClipboard}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 max-h-48 overflow-y-auto">
            <div className="text-sm font-medium mb-2">Clipboard Contents</div>
            <div className="space-y-1">
              {clipboard.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    {item.isFolder ? <Folder className="h-4 w-4 text-blue-500 mr-2" /> : <File className="h-4 w-4 text-gray-500 mr-2" />}
                    <span className="ml-2">{item.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant={item.action === 'cut' ? 'destructive' : 'secondary'}>{item.action}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => removeFromClipboard(item.id, item.isFolder)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
