import type { Filter, JoinOperator } from '@/types';
import { addDays, endOfDay, startOfDay } from 'date-fns';

type PrismaFilter = Record<string, unknown>;

/**
 * Builds Prisma filter conditions based on provided filters and join operator
 * @param filters - Array of filters to apply
 * @param joinOperator - Logical operator to combine filters ('AND' or 'OR')
 * @returns Prisma filter object or undefined
 */
export function buildPrismaFilters<T extends Record<string, unknown>>(filters: Array<Filter<T>>, joinOperator: JoinOperator): PrismaFilter | undefined {
  const conditions = filters
    .map((filter) => {
      const { id, operator, value, type } = filter;
      const column = id as string;

      // Type guard para valores de fecha
      const getDateValue = (val: unknown): Date | null => {
        if (typeof val === 'string') return new Date(val);
        if (val instanceof Date) return val;
        return null;
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
            if (!dateValue) return undefined;
            return {
              AND: [{ [column]: { gte: startOfDay(dateValue) } }, { [column]: { lte: endOfDay(dateValue) } }],
            };
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
            if (!dateValue) return undefined;
            return {
              OR: [{ [column]: { lt: startOfDay(dateValue) } }, { [column]: { gt: endOfDay(dateValue) } }],
            };
          }
          return { [column]: { not: value } };

        case 'iLike':
          return type === 'text' && typeof value === 'string' ? { [column]: { contains: value, mode: 'insensitive' } } : undefined;

        case 'notILike':
          return type === 'text' && typeof value === 'string' ? { [column]: { not: { contains: value, mode: 'insensitive' } } } : undefined;

        case 'lt':
          if (type === 'number') return { [column]: { lt: value } };
          if (type === 'date') {
            const dateValue = getDateValue(value);
            return dateValue ? { [column]: { lt: endOfDay(dateValue) } } : undefined;
          }
          return undefined;

        case 'lte':
          if (type === 'number') return { [column]: { lte: value } };
          if (type === 'date') {
            const dateValue = getDateValue(value);
            return dateValue ? { [column]: { lte: endOfDay(dateValue) } } : undefined;
          }
          return undefined;

        case 'gt':
          if (type === 'number') return { [column]: { gt: value } };
          if (type === 'date') {
            const dateValue = getDateValue(value);
            return dateValue ? { [column]: { gt: startOfDay(dateValue) } } : undefined;
          }
          return undefined;

        case 'gte':
          if (type === 'number') return { [column]: { gte: value } };
          if (type === 'date') {
            const dateValue = getDateValue(value);
            return dateValue ? { [column]: { gte: startOfDay(dateValue) } } : undefined;
          }
          return undefined;

        case 'isBetween':
          if (type === 'date' && Array.isArray(value)) {
            const [startVal, endVal] = value;
            const startDate = getDateValue(startVal);
            const endDate = getDateValue(endVal);

            const conditions: PrismaFilter[] = [];
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
          // Verifica si es null o cadena vacía según tu modelo
          return { OR: [{ [column]: null }, { [column]: '' }] };

        case 'isNotEmpty':
          // Verifica que no sea null ni cadena vacía
          return { AND: [{ [column]: { not: null } }, { [column]: { not: '' } }] };

        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    })
    .filter((condition): condition is PrismaFilter => condition !== undefined);

  return conditions.length > 0 ? { [joinOperator.toUpperCase()]: conditions } : undefined;
}
