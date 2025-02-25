'use client';

import { ReactElement, useEffect, useState } from 'react';

import { components } from './components/custom';
import { createProcessor } from './utils/processor';

interface TiptapRendererProps {
  children: string;
}

const TiptapRenderer = ({ children }: TiptapRendererProps) => {
  const [Content, setContent] = useState<ReactElement | null>(null);

  useEffect(
    function () {
      (async function () {
        const processor = createProcessor({ components });
        const output = await processor.process(children);

        setContent(output.result as ReactElement<{ children?: React.ReactNode }>);
      })();
    },
    [children]
  );

  return Content || null;
};

export default TiptapRenderer;
