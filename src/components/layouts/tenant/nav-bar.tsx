import Link from 'next/link';
import { logout } from '@/actions/logout';
import { redirect } from '@/i18n/routing';
import { currentSession } from '@/server/auth-server';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@radix-ui/react-accordion';
import { Book, Menu, Sunset, Trees, UserCircleIcon, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

function getUserDisplayName(user: { name: string }): string {
  return user.name;
  //const fullName = `${user.firstName} ${user.lastName}`.trim();
  //return fullName ? fullName : user.email || 'No name';
}

const Navbar = async () => {
  const user = await currentSession();
  if (!user) return redirect({ href: '/', locale: 'en' });

  const t = await getTranslations('tenants.navbar');

  const subMenuItemsTwo = [
    { title: t('resources.helpCenter.title'), description: t('resources.helpCenter.description'), icon: <Zap className="size-5 shrink-0" /> },
    { title: t('resources.contactUs.title'), description: t('resources.contactUs.description'), icon: <Sunset className="size-5 shrink-0" /> },
    { title: t('resources.status.title'), description: t('resources.status.description'), icon: <Trees className="size-5 shrink-0" /> },
    { title: t('resources.termsOfService.title'), description: t('resources.termsOfService.description'), icon: <Book className="size-5 shrink-0" /> },
    { title: t('resources.support.title'), description: t('resources.support.description'), icon: <Zap className="size-5 shrink-0" /> },
  ];

  return (
    <section className="py-4">
      <div className="container">
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold">RE</span>
              </div>
              <span className="text-xl font-bold">{t('brandName')}</span>
            </div>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem className="text-muted-foreground">
                    <NavigationMenuTrigger>{t('resources.title')}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="w-80 p-3">
                        {subMenuItemsTwo.map((item, idx) => (
                          <li key={idx}>
                            <a
                              className={cn(
                                'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex gap-4 rounded-md p-3 leading-none transition-colors select-none'
                              )}
                              href="#">
                              {item.icon}
                              <div>
                                <div className="text-sm font-semibold">{item.title}</div>
                                <p className="text-muted-foreground text-sm leading-snug">{item.description}</p>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              <a className={cn('text-muted-foreground', navigationMenuTriggerStyle, buttonVariants({ variant: 'ghost' }))} href="#">
                {t('pricing')}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{t('greeting', { name: getUserDisplayName(user.user) })}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {user.user.image ? (
                    <img src={user.user.image} width="32" height="32" className="rounded-full" alt="Avatar" style={{ aspectRatio: '32/32', objectFit: 'cover' }} />
                  ) : (
                    <UserCircleIcon className="size-4" />
                  )}
                  <span className="sr-only">{t('userMenuToggle')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{getUserDisplayName(user.user)}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">{t('profile')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">{t('settings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <form action={logout}>
                    <button type="submit">{t('signOut')}</button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-xl font-bold">RE</span>
              </div>
              <span className="text-xl font-bold">{t('brandName')}</span>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                        <span className="text-sm font-bold">RE</span>
                      </div>
                      <span className="text-xl font-bold">{t('brandName')}</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 mb-8 flex flex-col gap-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="resources" className="border-b-0">
                      <AccordionTrigger className="py-0 font-semibold hover:no-underline">{t('resources.title')}</AccordionTrigger>
                      <AccordionContent className="mt-2">
                        {subMenuItemsTwo.map((item, idx) => (
                          <a
                            key={idx}
                            className={cn(
                              'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex gap-4 rounded-md p-3 leading-none outline-hidden transition-colors select-none'
                            )}
                            href="#">
                            {item.icon}
                            <div>
                              <div className="text-sm font-semibold">{item.title}</div>
                              <p className="text-muted-foreground text-sm leading-snug">{item.description}</p>
                            </div>
                          </a>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <a href="#" className="font-semibold">
                    {t('pricing')}
                  </a>
                </div>
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 justify-start">
                    <a className={cn(buttonVariants({ variant: 'ghost' }), 'text-muted-foreground justify-start')} href="#">
                      {t('footer.press')}
                    </a>
                    <a className={cn(buttonVariants({ variant: 'ghost' }), 'text-muted-foreground justify-start')} href="#">
                      {t('footer.contact')}
                    </a>
                    <a className={cn(buttonVariants({ variant: 'ghost' }), 'text-muted-foreground justify-start')} href="#">
                      {t('footer.imprint')}
                    </a>
                    <a className={cn(buttonVariants({ variant: 'ghost' }), 'text-muted-foreground justify-start')} href="#">
                      {t('footer.sitemap')}
                    </a>
                    <a className={cn(buttonVariants({ variant: 'ghost' }), 'text-muted-foreground justify-start')} href="#">
                      {t('footer.legal')}
                    </a>
                    <a className={cn(buttonVariants({ variant: 'ghost' }), 'text-muted-foreground justify-start')} href="#">
                      {t('footer.cookieSettings')}
                    </a>
                  </div>
                  <div className="mt-2 flex flex-col gap-3">
                    <span className="text-sm">{t('greeting', { name: getUserDisplayName(user.user) })}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          {user.user.image ? (
                            <img src={user.user.image} width="32" height="32" className="rounded-full" alt="Avatar" style={{ aspectRatio: '32/32', objectFit: 'cover' }} />
                          ) : (
                            <UserCircleIcon className="size-4" />
                          )}
                          <span className="sr-only">{t('userMenuToggle')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{getUserDisplayName(user.user)}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile">{t('profile')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings">{t('settings')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>{t('signOut')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Navbar;
