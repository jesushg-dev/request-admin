import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs/server';

// Parsers for dashboard search params
export const dashboardSearchParamsParsers = {
  // Workflow tab: selected workflow ID (nullable)
  workflow: parseAsString,

  // SLA filters
  slaStatus: parseAsString.withDefault('all'),
  slaPercentage: parseAsArrayOf(parseAsInteger, ',').withDefault([0, 100]),
  slaTimeRange: parseAsString.withDefault('all'),
  slaWorkflowType: parseAsString.withDefault('all'),
};

// Create search params cache for server-side usage
export const dashboardSearchParamsCache = createSearchParamsCache(dashboardSearchParamsParsers);

