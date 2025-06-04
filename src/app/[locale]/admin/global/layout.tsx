import NavBar from '@/components/layouts/tenant/nav-bar';

export default async function TenantsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen w-full flex-1 flex-col gap-4">
      <NavBar />
      {children}
    </main>
  );
}
