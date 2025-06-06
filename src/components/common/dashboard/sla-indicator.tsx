'use client';

import type React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SLAIndicatorProps {
  slaHours: number;
  elapsedHours: number;
  status: 'on-time' | 'warning' | 'overdue' | 'completed';
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export function SLAIndicator({ slaHours, elapsedHours, status, size = 'md', showProgress = true }: SLAIndicatorProps) {
  const percentage = Math.min((elapsedHours / slaHours) * 100, 100);
  const remainingHours = Math.max(slaHours - elapsedHours, 0);

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          label: 'Completado',
          variant: 'success' as const,
        };
      case 'on-time':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: Clock,
          label: 'A tiempo',
          variant: 'default' as const,
        };
      case 'warning':
        return {
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: Clock,
          label: 'Próximo a vencer',
          variant: 'secondary' as const,
        };
      case 'overdue':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle,
          label: 'Vencido',
          variant: 'destructive' as const,
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Clock,
          label: 'Sin definir',
          variant: 'outline' as const,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4',
  };

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} ${sizeClasses[size]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.color}`} />
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
        </div>
        <div className={`text-xs font-medium ${config.color}`}>
          {status === 'completed' ? `${elapsedHours}h total` : status === 'overdue' ? `+${elapsedHours - slaHours}h` : `${remainingHours}h restantes`}
        </div>
      </div>

      {showProgress && status !== 'completed' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progreso SLA</span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
          <Progress
            value={percentage}
            className="h-2"
            // Cambiar color según el estado
            style={
              {
                '--progress-background': status === 'overdue' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#3b82f6',
              } as React.CSSProperties
            }
          />
          <div className="text-xs text-muted-foreground">
            SLA: {slaHours}h | Transcurrido: {elapsedHours}h
          </div>
        </div>
      )}
    </div>
  );
}
