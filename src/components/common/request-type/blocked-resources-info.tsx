'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowDown, InfoIcon } from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useTranslations } from 'next-intl';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OptionType } from '@/components/custom-ui/select';

import { BlockedResource, ResourceGroup } from './types';

interface BlockedResourcesInfoProps {
  defaultOpen?: boolean;
  blockedCount: number;
  blockedTitle: string;
  blockedLabel: string;
  inheritedTitle: string;
  blockedGroups: BlockedResource[];
  inheritedGroups: ResourceGroup[];
  onPromoteResource?: (resource: OptionType, groupInfo: ResourceGroup) => void;
}

export function BlockedResourcesInfo({
  blockedCount,
  blockedGroups = [],
  inheritedGroups = [],
  blockedTitle,
  blockedLabel,
  inheritedTitle,
  defaultOpen = false,
  onPromoteResource,
}: BlockedResourcesInfoProps) {
  const t = useTranslations('admin.requestType.create.blockedResourcesInfo');
  const [isBlockedOpen, setIsBlockedOpen] = useState(defaultOpen);
  const [isInheritedOpen, setIsInheritedOpen] = useState(defaultOpen);

  useEffect(() => {
    setIsBlockedOpen(defaultOpen);
    setIsInheritedOpen(defaultOpen);
  }, [defaultOpen]);

  const totalInherited = inheritedGroups.reduce((acc, group) => acc + group.resources.length, 0);

  if (totalInherited === 0 && blockedCount === 0) return null;

  return (
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
      <AnimatePresence>
        {blockedCount > 0 && (
          <motion.div variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
            <Card className="border-amber-200 overflow-hidden">
              <Collapsible open={isBlockedOpen} onOpenChange={setIsBlockedOpen}>
                <CollapsibleTrigger asChild>
                  <motion.div whileHover={{ backgroundColor: 'rgb(254 243 199)' }} transition={{ duration: 0.2 }}>
                    <CardHeader className="cursor-pointer transition-colors pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                          <div>
                            <CardTitle className="text-sm sm:text-base">
                              {t('blockedTitle', { title: blockedTitle })}: ({blockedGroups.length})
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm text-amber-700">{t('blockedDescription')}</CardDescription>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: isBlockedOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-600">
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </CardHeader>
                  </motion.div>
                </CollapsibleTrigger>
                <CollapsibleContent forceMount>
                  <motion.div variants={collapseVariants} animate={isBlockedOpen ? 'open' : 'closed'} style={{ overflow: 'hidden' }}>
                    <CardContent className="pt-0 px-3 sm:px-6">
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Alert className="mb-4 border-amber-200 bg-amber-50 text-xs sm:text-sm">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-800">{t('blockedAlert', { count: blockedGroups.length, label: blockedLabel })}</AlertDescription>
                        </Alert>
                      </motion.div>

                      <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        {blockedGroups.map((item) => (
                          <motion.div key={`resource-${item.resource.value}`} className="mb-4 sm:mb-6" variants={itemVariants} whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                            <div className="mb-2 flex items-center flex-wrap gap-2">
                              <motion.div className="inline-block" variants={badgeVariants}>
                                <Badge variant="outline" className="bg-white border-amber-200 text-amber-700 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm">
                                  {item.resource.label}
                                </Badge>
                              </motion.div>
                              {onPromoteResource && (
                                <motion.div className="inline-block" variants={buttonVariants} whileHover="hover" whileTap="tap">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                                    onClick={() => {
                                      const firstCategory = item.categories[0];
                                      if (firstCategory) {
                                        onPromoteResource(item.resource, {
                                          level: firstCategory.level,
                                          parentLabel: firstCategory.parentLabel,
                                          levelName: firstCategory.level?.name,
                                          resources: [item.resource],
                                          hierarchyLevelId: firstCategory.groupId,
                                        });
                                      }
                                    }}
                                    title={t('promoteTitle')}
                                    aria-label={t('promoteAriaLabel', { label: item.resource.label })}>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round">
                                      <path d="m5 12 7-7 7 7" />
                                      <path d="M12 19V5" />
                                    </svg>
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                            <motion.div className="flex flex-wrap gap-1 sm:gap-2 ml-2 sm:ml-4" variants={containerVariants}>
                              {item.categories.map((category, catIdx) => (
                                <motion.div key={`${category.groupId}-${catIdx}`} variants={badgeVariants}>
                                  <Badge variant="outline" className="flex items-center p-0 border-gray-200 bg-white overflow-hidden text-[10px] sm:text-xs">
                                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 sm:px-2 sm:py-1">{category.level.name}</span>
                                    <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 truncate max-w-[120px] sm:max-w-none">{category.parentLabel}</span>
                                  </Badge>
                                </motion.div>
                              ))}
                            </motion.div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </CardContent>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inherited Resources */}
      <AnimatePresence>
        {totalInherited > 0 && (
          <motion.div variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
            <Card className="border-blue-200 overflow-hidden">
              <Collapsible open={isInheritedOpen} onOpenChange={setIsInheritedOpen}>
                <CollapsibleTrigger asChild>
                  <motion.div whileHover={{ backgroundColor: 'rgb(239 246 255)' }} transition={{ duration: 0.2 }}>
                    <CardHeader className="cursor-pointer transition-colors pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <InfoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                          <div>
                            <CardTitle className="text-sm sm:text-base">
                              {t('inheritedTitle', { title: inheritedTitle })} ({totalInherited})
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm text-blue-700">{t('inheritedDescription')}</CardDescription>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: isInheritedOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600">
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </CardHeader>
                  </motion.div>
                </CollapsibleTrigger>
                <CollapsibleContent forceMount>
                  <motion.div variants={collapseVariants} animate={isInheritedOpen ? 'open' : 'closed'} style={{ overflow: 'hidden' }}>
                    <CardContent className="pt-0 px-3 sm:px-6">
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Alert className="mb-4 border-blue-200 bg-blue-50 text-xs sm:text-sm">
                          <InfoIcon className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">{t('inheritedAlert')}</AlertDescription>
                        </Alert>
                      </motion.div>
                      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                        {inheritedGroups.map((group, idx) => (
                          <motion.div key={`inherited-${idx}-${group.parentLabel}`} className="space-y-2" variants={itemVariants} whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                            <div className="flex items-center gap-2">
                              <motion.div variants={badgeVariants}>
                                <Badge variant="outline" className="flex items-center p-0 border-gray-200 bg-white overflow-hidden text-[10px] sm:text-xs">
                                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 sm:px-2 sm:py-1">{group.levelName}</span>{' '}
                                  <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 truncate max-w-[120px] sm:max-w-none">{group.parentLabel}</span>
                                </Badge>
                              </motion.div>
                            </div>
                            <motion.div className="flex flex-wrap gap-1 sm:gap-2 ml-2 sm:ml-4" variants={containerVariants}>
                              {group.resources.map((resource) => (
                                <motion.div key={resource.value} variants={badgeVariants}>
                                  <Badge variant="outline" className="bg-white border-blue-200 text-blue-700 text-[10px] sm:text-xs">
                                    {resource.label}
                                  </Badge>
                                </motion.div>
                              ))}
                            </motion.div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </CardContent>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Animation variants for the components
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

const buttonVariants: Variants = {
  hover: {
    scale: 1.1,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

const collapseVariants: Variants = {
  open: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};
