import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NavbarProps extends React.HTMLAttributes<HTMLElement> {}
export function Navbar({ children, className, ...props }: NavbarProps) {
  return (
    <nav className={cn('bg-background border-b', className)} {...props}>
      <div className="container mx-auto flex h-16 items-center px-4">{children}</div>
    </nav>
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NavbarBrandProps extends React.HTMLAttributes<HTMLDivElement> {}
export function NavbarBrand({ children, className, ...props }: NavbarBrandProps) {
  return (
    <div className={cn('text-lg font-bold', className)} {...props}>
      {children}
    </div>
  );
}

interface NavbarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
}
export function NavbarContent({ children, align = 'start', className, ...props }: NavbarContentProps) {
  const alignmentClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };
  return (
    <div className={cn('flex flex-1 items-center', alignmentClass[align], className)} {...props}>
      {children}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NavbarItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}
export function NavbarItem({ children, className, ...props }: NavbarItemProps) {
  return (
    <a className={cn('text-sm hover:underline', className)} {...props}>
      {children}
    </a>
  );
}
