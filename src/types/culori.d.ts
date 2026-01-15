declare module "culori" {
  export interface Hsl {
    h?: number;
    s: number;
    l: number;
    alpha?: number;
  }

  export function parse(color: string): any;
  export function converter(format: string): (color: any) => any;
  export function formatRgb(color: any): string;
  export function formatHex(color: any): string;
  export function formatHsl(color: any): string;
}

