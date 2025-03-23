import { createLoader, parseAsString, parseAsStringEnum } from 'nuqs/server';

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

export const documentReferencesParams = {
  dataroomId: parseAsString.withDefault(''),
  dataroomName: parseAsString.withDefault(''),
  documentId: parseAsString.withDefault(''),
  documentName: parseAsString.withDefault(''),
  callbackUrl: parseAsString,
  linkType: parseAsStringEnum(['DOCUMENT_LINK', 'DATAROOM_LINK']).withDefault('DOCUMENT_LINK'),
};

export const documentReferencesLoader = createLoader(documentReferencesParams);
