import type { JSX } from 'react';
import * as prod from 'react/jsx-runtime';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { codeToHast } from 'shiki/bundle/full';

export async function highlight(code: string, lang: string) {
  const out = await codeToHast(code, {
    lang,
    themes: {
      light: 'github-light-default',
      dark: 'one-dark-pro',
    },
    //  structure: "inline",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return toJsxRuntime(out as any, {
    Fragment: prod.Fragment,
    jsx: prod.jsx,
    jsxs: prod.jsxs,
    components: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pre: ({ children }) => children as any,
    },
  }) as JSX.Element;
}
