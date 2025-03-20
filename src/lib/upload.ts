import { createLoader, parseAsString } from 'nuqs/server';

export const relationsSearchParams = {
  folderId: parseAsString,
  dataroomId: parseAsString,
  dataroomName: parseAsString,
  callbackUrl: parseAsString,
};

export const loadSearchParams = createLoader(relationsSearchParams);

export const folderReferencesParams = {
  dataroomId: parseAsString.withDefault(''),
  dataroomName: parseAsString.withDefault(''),
  currentFolderId: parseAsString.withDefault(''),
};

export const folderReferencesLoader = createLoader(folderReferencesParams);
