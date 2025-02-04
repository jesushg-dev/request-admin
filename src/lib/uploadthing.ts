import { generateReactHelpers } from '@uploadthing/react';

import { OurFileRouter } from '@/app/[locale]/api/uploadthing/core';

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
