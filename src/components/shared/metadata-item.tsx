'use client';

import type React from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';

export interface MetadataItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export function MetadataItem({ icon, label, value }: MetadataItemProps) {
  return (
    <div className="flex w-full items-center gap-3">
      <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg min-w-[2rem] min-h-[2rem]">{icon}</div>
      <div className="flex flex-col">
        <p className="text-muted-foreground text-sm">{label}</p>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

interface ExpandableMetadataProps {
  items: MetadataItemProps[];
  hierarchical?: boolean;
}

export function ExpandableMetadata({ items, hierarchical = false }: ExpandableMetadataProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const containerVariants = {
    hidden: { opacity: 1, height: 'auto' },
    visible: { opacity: 1, height: 'auto', transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };
  const visibleItems = isExpanded ? items : [items[items.length - 1]];

  return (
    <div className="w-full space-y-2 relative pr-8">
      {
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative">
          {visibleItems.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`
              overflow-hidden 
              ${hierarchical ? `ml-${index * 4} pl-4 ${index !== 0 ? 'border-l-2 border-dashed border-primary/30' : ''}` : ''}
              ${index !== 0 ? 'mt-2' : ''}
            `}>
              <MetadataItem {...item} />
            </motion.div>
          ))}
        </motion.div>
      }
      <button onClick={toggleExpand} className="absolute right-0 top-1 p-2 text-muted-foreground hover:text-foreground">
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
    </div>
  );
}
