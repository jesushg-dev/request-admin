'use client';

import { useState } from 'react';
import { CheckCircle, FileText, FolderTree, LayoutList, Network, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Hint } from '@/components/hint';

import { HierarchyFormStepperValues } from '.';

export function SummaryStep() {
  const t = useTranslations('admin.hierarchy.summaryStep');
  const { watch } = useFormContext<HierarchyFormStepperValues>();
  const values = watch();
  const [showHierarchy, setShowHierarchy] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const toggleHierarchyView = () => {
    setShowHierarchy(!showHierarchy);
  };

  // Base indentation value in pixels
  const baseIndent = 24;

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        <ScrollArea className="w-full flex-1 overflow-y-auto">
          <motion.div className="flex flex-col gap-4 rounded-lg w-full" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <FolderTree className="w-4 h-4 mr-1" />
                  <h3 className="text-xl font-semibold">{t('summaryTitle')}</h3>
                </div>
                <Badge variant={values.isActive ? 'default' : 'secondary'} className="text-sm">
                  {values.isActive ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" /> {t('active')}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" /> {t('inactive')}
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex items-center mb-4">
                <FileText className="w-4 h-4 mr-1" />
                <p className="text-muted-foreground">{values.description || t('noDescription')}</p>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center mb-4 justify-between">
                <h4 className="text-lg font-semibold mb-3">{t('levelsTitle')}</h4>
                <Hint label={showHierarchy ? t('viewFlat') : t('viewHierarchy')}>
                  <Button type="button" variant="outline" size="icon" onClick={toggleHierarchyView}>
                    {showHierarchy ? <LayoutList className="h-4 w-4" /> : <Network className="h-4 w-4" />}
                  </Button>
                </Hint>
              </div>
              <motion.ul className="space-y-3 mt-4">
                {values.levels.map((level, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    className="p-3 rounded-md border bg-card hover:bg-accent/10 transition-colors relative"
                    style={{
                      marginLeft: showHierarchy ? `${index * baseIndent}px` : 0,
                      borderLeft: '2px dashed',
                      borderLeftColor: 'var(--border)',
                      paddingLeft: '16px',
                    }}>
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-medium text-sm mr-3">{index + 1}</div>
                      <div>
                        <h5 className="font-medium">{level.name}</h5>
                        <p className="text-sm text-muted-foreground">{level.description || t('noDescription')}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
