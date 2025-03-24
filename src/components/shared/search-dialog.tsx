'use client';

import * as React from 'react';
import { useState } from 'react';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type SearchResult = {
  id: string;
  title: string;
  category: string;
};

interface SearchDialogProps {
  results?: SearchResult[];
  onSearch?: (term: string) => void;
  onResultSelect?: (result: SearchResult) => void;
}

export function SearchDialog({ results = [], onSearch, onResultSelect }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Search className="h-4 w-4" />
          <span className="sr-only">Buscar</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buscar</DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Buscar..." value={searchTerm} onValueChange={handleSearch} />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              {results.map((result) => (
                <CommandItem key={result.id} onSelect={() => handleResultSelect(result)}>
                  <div>
                    <span>{result.title}</span>
                    <span className="text-sm text-muted-foreground"> - {result.category}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
