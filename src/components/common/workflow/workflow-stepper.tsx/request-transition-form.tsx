'use client';

import { useState } from 'react';
import { BookCheckIcon, BookPlusIcon, BookUp2Icon, Edit3Icon, OctagonAlert, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertBanner } from '@/components/custom-ui/alert-banner';
import { WorkflowEditor } from '@/components/flow-diagram-editor';
import { Hint } from '@/components/hint';
import EmptyState from '@/components/shared/empty-state';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { StateModal, stateSchema, StateValues } from '../state-modal';
import { TransitionModal, transitionSchema, TransitionValues } from '../transition-modal';

const colorMap: { [key: string]: string } = {
  gray: '#f3f4f6',
  blue: '#dbeafe',
  indigo: '#bfdbfe',
  green: '#d1fae5',
  red: '#fee2e2',
  default: '#fef3c7',
};

const getStateColor = (state?: { color?: string }) => {
  return colorMap[state?.color as keyof typeof colorMap] || colorMap.default;
};

export const workflowTransitionStateSchema = z.object({
  transitions: z.array(transitionSchema),
  states: z.array(stateSchema),
});

export type WorkflowTransitionStateValues = z.infer<typeof workflowTransitionStateSchema>;

export default function RequestTransitionForm({ onBack }: { onBack: () => void }) {
  const t = useTranslations('admin.workflow.form');

  // modal states
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [editingState, setEditingState] = useState<StateValues | null>(null);
  const [editingTransition, setEditingTransition] = useState<TransitionValues | null>(null);

  // flow validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const { control } = useFormContext<WorkflowTransitionStateValues>();
  const { fields: states, append: appendState, update: updateState, remove: removeState } = useFieldArray({ control, name: 'states' });
  const { fields: transitions, append: appendTransition, update: updateTransition, remove: removeTransition } = useFieldArray({ control, name: 'transitions' });

  // Handlers for states
  const handleAddState = () => {
    setEditingState(null);
    setIsStateModalOpen(true);
  };

  const handleEditState = (state: StateValues) => {
    setEditingState(state);
    setIsStateModalOpen(true);
  };

  const handleSaveState = (state: StateValues) => {
    if (editingState) {
      const index = states.findIndex((s) => s.id === state.id);
      if (index !== -1) updateState(index, state);
      toast.success(t('state.updatedTitle'), {
        description: t('state.updatedMessage', { stateName: state.name }),
      });
    } else {
      appendState(state);
      toast.success(t('state.addedTitle'), {
        description: t('state.addedMessage', { stateName: state.name }),
      });
    }
    setIsStateModalOpen(false);
    setShowValidationErrors(false);
  };

  const handleDeleteState = (index: number) => {
    removeState(index);
    toast.success(t('state.deletedTitle'), { description: t('state.deletedMessage') });
    setShowValidationErrors(false);
  };

  // Handlers for transitions
  const handleAddTransition = () => {
    setEditingTransition(null);
    setIsTransitionModalOpen(true);
  };

  const handleEditTransition = (transition: TransitionValues) => {
    setEditingTransition(transition);
    setIsTransitionModalOpen(true);
  };

  const handleSaveTransition = (transition: TransitionValues) => {
    if (editingTransition) {
      const index = transitions.findIndex((t) => t.id === transition.id);
      if (index !== -1) updateTransition(index, transition);
      toast.success(t('transition.updatedTitle'), {
        description: t('transition.updatedMessage', { transitionName: transition.name }),
      });
    } else {
      // Add a new transition
      appendTransition(transition);
      toast.success(t('transition.addedTitle'), {
        description: t('transition.addedMessage', { transitionName: transition.name }),
      });
    }
    setIsTransitionModalOpen(false);
    setShowValidationErrors(false);
  };

  const handleDeleteTransition = (index: number) => {
    removeTransition(index);
    toast(t('transition.deletedTitle'), {
      description: t('transition.deletedMessage'),
    });

    setShowValidationErrors(false);
  };

  const validateWorkflow = () => {
    const errors: string[] = [];

    // Verify that there is at least one initial state
    const hasInitialState = states.some((state) => state.isInitial);
    if (!hasInitialState) {
      errors.push(t('errors.initialState'));
    }

    // Verify that there is at least one final state
    const hasFinalState = states.some((state) => state.isFinal);
    if (!hasFinalState) {
      errors.push(t('errors.finalState'));
    }

    // Verify that all states are connected
    const connectedStates = new Set<string>();

    // Add initial states
    states.forEach((state) => {
      if (state.isInitial) {
        connectedStates.add(state.id);
      }
    });

    // Propagate connections through transitions
    let changed = true;
    while (changed) {
      changed = false;
      transitions.forEach((transition) => {
        if (connectedStates.has(transition.sourceId) && !connectedStates.has(transition.targetId)) {
          connectedStates.add(transition.targetId);
          changed = true;
        }
      });
    }

    // Verify if there are disconnected states
    const disconnectedStates = states.filter((state) => !connectedStates.has(state.id));
    if (disconnectedStates.length > 0) {
      errors.push(
        t('errors.disconnectedStates', {
          states: disconnectedStates.map((s) => s.name).join(', '),
        })
      );
    }

    // Verify that it is possible to reach a final state from any state
    const statesWithPathToFinal = new Set<string>();

    // Add final states
    states.forEach((state) => {
      if (state.isFinal) {
        statesWithPathToFinal.add(state.id);
      }
    });

    // Propagate connections backwards
    changed = true;
    while (changed) {
      changed = false;
      transitions.forEach((transition) => {
        if (statesWithPathToFinal.has(transition.targetId) && !statesWithPathToFinal.has(transition.sourceId)) {
          statesWithPathToFinal.add(transition.sourceId);
          changed = true;
        }
      });
    }

    // Verify if there are states without a path to a final state
    const statesWithoutPathToFinal = states.filter((state) => !state.isFinal && !statesWithPathToFinal.has(state.id));
    if (statesWithoutPathToFinal.length > 0) {
      errors.push(
        t('errors.statesWithoutPathToFinal', {
          states: statesWithoutPathToFinal.map((s) => s.name).join(', '),
        })
      );
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const onSubmit = () => {
    // Validate the workflow
    const isValid = validateWorkflow();

    if (!isValid) {
      setShowValidationErrors(true);
      toast.error(t('validationErrorsTitle'), { description: t('validationErrorsMessage') });
      return;
    }

    // The logic to save the workflow in the server would go here

    toast.success(t('savedTitle'), { description: t('savedMessage') });
  };

  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"></div>

        {showValidationErrors && validationErrors.length > 0 && (
          <AlertBanner
            title={t('validationErrors')}
            description={
              <ul className="list-disc pl-5 mt-2">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            }
            variant="error"
            icon={<OctagonAlert className="h-6 w-6 text-red-500" />}
          />
        )}

        <WorkflowEditor />
      </div>
      <div className="flex w-full justify-between">
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {states.length} {t('states')}
          </Badge>
          <Badge variant="outline">
            {transitions.length} {t('transitions')}
          </Badge>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">{t('statesTab')}</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit profile</SheetTitle>
                  <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
                </SheetHeader>
                <Hint label={t('newState')}>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddState}>
                    <BookPlusIcon className="h-4 w-4" />
                  </Button>
                </Hint>
                <ScrollArea className="w-full flex-1 overflow-hidden flex gap-4">
                  <div className="space-y-4 w-full">
                    {states.map((state, idx) => (
                      <div key={state.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getStateColor(state) }}></div>
                              <span className="font-medium">{state?.name}</span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{state.description}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {state.isInitial && <Badge variant="outline">{t('initialState')}</Badge>}
                            {state.isFinal && <Badge variant="outline">{t('finalState')}</Badge>}
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleEditState(state)}>
                              <Edit3Icon className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={handleDeleteState.bind(null, idx)}>
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {states.length === 0 && (
                      <EmptyState
                        title={t('noStates')}
                        description={t('noStatesDescription')}
                        icons={[BookUp2Icon]}
                        actions={[{ label: t('newState'), onClick: handleAddState, variant: 'outline', icon: BookUp2Icon }]}
                      />
                    )}
                  </div>
                </ScrollArea>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button type="submit">Save changes</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">{t('transitionsTab')}</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit profile</SheetTitle>
                  <SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
                </SheetHeader>
                <Hint label={t('newTransition')}>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTransition}>
                    <BookUp2Icon className="h-4 w-4" />
                  </Button>
                </Hint>
                <ScrollArea className="w-full flex-1 overflow-hidden">
                  <div className="space-y-4 w-full">
                    {transitions.map((transition, idx) => {
                      const sourceState = states.find((s) => s.id === transition.sourceId);
                      const targetState = states.find((s) => s.id === transition.targetId);

                      return (
                        <div key={transition.id} className="rounded-md border p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getStateColor(sourceState) }}></div>
                                <span className="font-medium">{sourceState?.name}</span>
                                <span className="text-muted-foreground">→</span>
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getStateColor(targetState) }}></div>
                                <span className="font-medium">{targetState?.name}</span>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{transition.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {transition.requiresJustification && <Badge variant="outline">{t('requiresJustification')}</Badge>}
                              {transition.requiresApproval && <Badge variant="outline">{t('requiresApproval')}</Badge>}
                              <Button type="button" variant="ghost" size="sm" onClick={() => handleEditTransition(transition)}>
                                <Edit3Icon className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="destructive" size="sm" onClick={handleDeleteTransition.bind(null, idx)}>
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {transitions.length === 0 && (
                      <EmptyState
                        title={t('noTransitions')}
                        description={t('noTransitionsDescription')}
                        icons={[BookUp2Icon]}
                        actions={[{ label: t('newTransition'), onClick: handleAddTransition, variant: 'outline', icon: BookUp2Icon }]}
                      />
                    )}
                  </div>
                </ScrollArea>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button type="submit">Save changes</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <StepperNavigationButtons isFirstStep={false} isLastStep={false} onPrev={onBack} onNext={onSubmit} />
      </div>

      <TransitionModal states={states} isOpen={isTransitionModalOpen} onClose={() => setIsTransitionModalOpen(false)} defaultValues={editingTransition} onSave={handleSaveTransition} />
      <StateModal isOpen={isStateModalOpen} onClose={() => setIsStateModalOpen(false)} defaultValues={editingState} onSave={handleSaveState} />
    </>
  );
}
