import NavBar from '@/components/layouts/tenant/nav-bar';

export default async function TenantsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen max-h-screen flex-col overflow-hidden">
      <NavBar />
      {children}
    </div>
  );
}
