import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Glow } from '@/components/ui/glow';
import { Mockup } from '@/components/ui/mockup';

interface HeroWithMockupProps {
  title: string;
  description: string;
  primaryCta?: React.ReactNode;
  secondaryCta?: React.ReactNode;
  mockupImage: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  className?: string;
}

export function HeroWithMockup({ title, description, primaryCta, secondaryCta, mockupImage, className }: HeroWithMockupProps) {
  return (
    <section className={cn('relative bg-background text-foreground', 'py-12 px-4 md:py-24 lg:py-32', 'overflow-hidden', className)}>
      <div className="relative mx-auto max-w-[1280px] flex flex-col gap-12 lg:gap-24">
        <div className="relative z-10 flex flex-col items-center gap-6 pt-8 md:pt-16 text-center lg:gap-12">
          {/* Heading */}
          <h1
            className={cn(
              'inline-block animate-appear',
              'bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground',
              'bg-clip-text text-transparent',
              'text-4xl/18 font-bold tracking-tight sm:text-5xl/18 md:text-6xl/18 lg:text-7xl/18 xl:text-8xl/18',
              'drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]'
            )}>
            {title}
          </h1>

          {/* Description */}
          <p className={cn('max-w-[550px] animate-appear opacity-0 [animation-delay:150ms]', 'text-base sm:text-lg md:text-xl', 'text-muted-foreground', 'font-medium')}>{description}</p>

          {/* CTAs */}
          <div
            className="relative z-10 flex flex-wrap justify-center gap-4 
            animate-appear opacity-0 [animation-delay:300ms]">
            {/* Primary CTA */}
            {primaryCta}
            {/* Secondary CTA */}
            {secondaryCta}
          </div>

          {/* Mockup */}
          <div className="relative w-full pt-12 px-4 sm:px-6 lg:px-8">
            <Mockup
              className={cn(
                'animate-appear opacity-0 [animation-delay:700ms]',
                'shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]',
                'border-brand/10 dark:border-brand/5'
              )}>
              <Image {...mockupImage} className="w-full h-auto object-cover" loading="lazy" decoding="async" alt={mockupImage.alt} />
            </Mockup>
          </div>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Glow variant="above" className="animate-appear-zoom opacity-0 [animation-delay:1000ms]" />
      </div>
    </section>
  );
}
