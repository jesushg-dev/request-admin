'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface HierarchyFormStepperValues {
  name: string;
  description: string;
  isActive: boolean;
  levels: { name: string; description: string }[];
}

// Mock data
const mockValues: HierarchyFormStepperValues = {
  name: 'Gestión de solicitudes',
  description: 'Jerarquía de gestión de los tipos, categorías y subcategorías de solicitudes',
  isActive: true,
  levels: [
    { name: 'Tipo de Solicitud', description: 'Clasificación principal de la solicitud' },
    { name: 'Categoria', description: 'Subclasificación dentro del tipo de solicitud' },
    { name: 'Subcategoria', description: 'Detalle específico de la categoría' },
  ],
};

export function SummaryStep() {
  const values = mockValues;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <ScrollArea className="w-full flex-1 overflow-y-hidden">
      <motion.div className="flex flex-col gap-4 rounded-lg shadow-lg w-full" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-4">Resumen de la Jerarquía</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{values.name}</h3>
                <Badge variant={values.isActive ? 'default' : 'secondary'} className="text-sm">
                  {values.isActive ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" /> Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" /> Inactivo
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{values.description}</p>
              <Separator className="my-4" />
              <h4 className="text-lg font-semibold mb-3">Niveles de la Jerarquía</h4>
              <ul className="space-y-3">
                {values.levels.map((level, index) => (
                  <motion.li key={index} variants={itemVariants} className="p-3 rounded-md">
                    <h5 className="font-medium">{level.name}</h5>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ScrollArea>
  );
}
