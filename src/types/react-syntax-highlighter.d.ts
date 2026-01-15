declare module 'react-syntax-highlighter' {
  import { Component } from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children?: string;
    [key: string]: any;
  }
  
  export class Prism extends Component<SyntaxHighlighterProps> {}
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneDark: any;
  export const oneLight: any;
}



