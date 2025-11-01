import type { Filter, JoinOperator } from '@/types';
import { addDays, endOfDay, startOfDay } from 'date-fns';

type PrismaCondition = { [key: string]: unknown } | { AND: PrismaCondition[] } | { OR: PrismaCondition[] } | { NOT: PrismaCondition };

/**
 * Builds Prisma filter conditions with strict type checking
 */
export function buildPrismaFilters<T extends Record<string, unknown>>(filters: Array<Filter<T>>, joinOperator: JoinOperator): PrismaCondition | undefined {
  const conditions: PrismaCondition[] = filters
    .map((filter) => {
      const { id, operator, value, type } = filter;
      const column = id as string;

      const getDateValue = (val: unknown): Date | null => {
        try {
          return val ? new Date(val as string) : null;
        } catch {
          return null;
        }
      };

      // Handler for date comparisons
      const dateComparison = (operator: 'lt' | 'lte' | 'gt' | 'gte', value: unknown, modifier: (d: Date) => Date): PrismaCondition | undefined => {
        const dateValue = getDateValue(value);
        return dateValue ? { [column]: { [operator]: modifier(dateValue) } } : undefined;
      };

      switch (operator) {
        case 'eq':
          if (Array.isArray(value)) {
            return { [column]: { in: value } };
          }
          if (type === 'boolean') {
            return { [column]: value === 'true' };
          }
          if (type === 'date') {
            const dateValue = getDateValue(value);
            return dateValue
              ? {
                  AND: [{ [column]: { gte: startOfDay(dateValue) } }, { [column]: { lte: endOfDay(dateValue) } }],
                }
              : undefined;
          }
          return { [column]: value };

        case 'ne':
          if (Array.isArray(value)) {
            return { [column]: { notIn: value } };
          }
          if (type === 'boolean') {
            return { [column]: { not: value === 'true' } };
          }
          if (type === 'date') {
            const dateValue = getDateValue(value);
            return dateValue
              ? {
                  OR: [{ [column]: { lt: startOfDay(dateValue) } }, { [column]: { gt: endOfDay(dateValue) } }],
                }
              : undefined;
          }
          return { [column]: { not: value } };

        case 'iLike':
          return type === 'text' && typeof value === 'string' ? { [column]: { contains: value,  } } : undefined;

        case 'notILike':
          return type === 'text' && typeof value === 'string' ? { [column]: { not: { contains: value,  } } } : undefined;

        case 'lt':
          if (type === 'number') return { [column]: { lt: value } };
          return dateComparison('lt', value, endOfDay);

        case 'lte':
          if (type === 'number') return { [column]: { lte: value } };
          return dateComparison('lte', value, endOfDay);

        case 'gt':
          if (type === 'number') return { [column]: { gt: value } };
          return dateComparison('gt', value, startOfDay);

        case 'gte':
          if (type === 'number') return { [column]: { gte: value } };
          return dateComparison('gte', value, startOfDay);

        case 'isBetween':
          if (type === 'date' && Array.isArray(value)) {
            const [startVal, endVal] = value;
            const startDate = getDateValue(startVal);
            const endDate = getDateValue(endVal);

            const conditions: PrismaCondition[] = [];
            if (startDate) conditions.push({ [column]: { gte: startOfDay(startDate) } });
            if (endDate) conditions.push({ [column]: { lte: endOfDay(endDate) } });

            return conditions.length > 0 ? { AND: conditions } : undefined;
          }
          return undefined;

        case 'isRelativeToToday': {
          if (type === 'date' && typeof value === 'string') {
            const today = new Date();
            const [amount, unit] = value.split(' ');
            const numericAmount = parseInt(amount, 10);

            if (isNaN(numericAmount) || !unit) return undefined;

            let startDate: Date;
            let endDate: Date;

            switch (unit.toLowerCase()) {
              case 'days':
                startDate = startOfDay(addDays(today, numericAmount));
                endDate = endOfDay(startDate);
                break;
              case 'weeks':
                startDate = startOfDay(addDays(today, numericAmount * 7));
                endDate = endOfDay(addDays(startDate, 6));
                break;
              case 'months':
                startDate = startOfDay(addDays(today, numericAmount * 30));
                endDate = endOfDay(addDays(startDate, 29));
                break;
              default:
                return undefined;
            }

            return {
              AND: [{ [column]: { gte: startDate } }, { [column]: { lte: endDate } }],
            };
          }
          return undefined;
        }

        case 'isEmpty':
          return {
            OR: [{ [column]: null }, { [column]: '' }],
          };

        case 'isNotEmpty':
          return {
            AND: [{ [column]: { not: null } }, { [column]: { not: '' } }],
          };

        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    })
    .filter((condition): condition is PrismaCondition => condition !== undefined);

  return conditions.length > 0 ? { [joinOperator.toUpperCase() === 'AND' ? 'AND' : 'OR']: conditions } : undefined;
}
