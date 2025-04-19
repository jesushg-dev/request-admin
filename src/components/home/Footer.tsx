import Link from 'next/link';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function Footer() {
  const t = await getTranslations('home.footer');

  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-8 py-8 md:flex-row md:py-12">
        <div className="flex-1 space-y-4">
          <h2 className="font-bold">Request Engine</h2>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-12 sm:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t('solutions.title')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/ticketing" className="text-muted-foreground transition-colors hover:text-primary">
                  {t('solutions.ticketing')}
                </Link>
              </li>
              <li>
                <Link href="/automation" className="text-muted-foreground transition-colors hover:text-primary">
                  {t('solutions.automation')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t('company.title')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">
                  {t('company.about')}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground transition-colors hover:text-primary">
                  {t('company.careers')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t('connect.title')}</h3>
            <div className="flex space-x-4">
              <Link href="https://github.com/amanesoft" className="text-muted-foreground transition-colors hover:text-primary">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="https://twitter.com/amanesoft" className="text-muted-foreground transition-colors hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://linkedin.com/company/amanesoft" className="text-muted-foreground transition-colors hover:text-primary">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container border-t py-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Request Engine, Inc. {t('copyright')}
        </p>
      </div>
    </footer>
  );
}
