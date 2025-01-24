import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginButton } from '@/components/auth/login-button';

const plans = [
  {
    name: 'Free Plan',
    description: 'Perfect for getting started',
    price: '$0',
    features: ['Boost engagement with target responses', 'Automate comment replies to enhance audience interaction', 'Turn followers into customers with targeted messaging'],
    cta: 'Get Started',
  },
  {
    name: 'Smart AI Plan',
    description: 'Advanced features for power users',
    price: '$99',
    features: ['All features from Free Plan', 'AI-powered response generation', 'Advanced analytics and insights', 'Priority customer support', 'Custom branding options'],
    cta: 'Upgrade Now',
  },
];

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <main>
      <section className="to-bg relative bg-gradient-to-b from-slate-900 via-blue-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="relative">
          <div className="container px-4 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-lg font-bold">RE</span>
                </div>
                <span className="text-xl font-semibold text-white">{t('brandName')}</span>
              </div>
              <nav className="hidden space-x-6 text-sm text-blue-200 md:block">
                <Link href="#features">Features</Link>
                <Link href="#pricing">Pricing</Link>
                <Link href="#about">About</Link>
              </nav>
              <LoginButton asChild>
                <Button variant="secondary" size="lg">
                  {t('signInButton')}
                </Button>
              </LoginButton>
            </div>

            <div className="mx-auto mt-16 max-w-3xl text-center">
              <h1 className="text-4xl leading-tight font-bold tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl">{t('title')}</h1>
              <p className="mt-6 text-lg text-blue-200">{t('subHeading')}</p>

              <div className="mt-8 flex justify-center gap-4">
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="border-blue-400 hover:bg-blue-900/50">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative mt-10 h-40 w-full md:h-80">
              <Image src="/Ig-creators.png" alt="Community member" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-background container w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Choose Your Plan</h2>
            <p className="text-muted-foreground max-w-[900px]">Select the perfect plan to boost your Instagram engagement</p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="text-4xl font-bold">
                    {plan.price}
                    <span className="text-muted-foreground text-lg font-normal">/month</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="text-primary mr-2 h-4 w-4" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">{plan.cta}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
