import { RequestLevelType } from '@/types/zenstackhq/hierarchy';
import { OptionType } from '@/components/custom-ui/select';

export interface ResourceGroup {
  level: RequestLevelType;
  resources: OptionType[];
  // Additional fields for compatibility with BlockedResourcesInfo
  levelName?: string;
  parentLabel?: string;
  hierarchyLevelId?: string;
}

export interface BlockedResourceCategory {
  groupId: string;
  level: RequestLevelType;
  parentLabel: string;
}

export interface BlockedResource {
  resource: OptionType;
  categories: BlockedResourceCategory[];
}
