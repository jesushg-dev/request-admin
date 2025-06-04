import { Glow } from '@/components/ui/glow';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-2 text-center z-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-lg font-bold">RE</span>
          </div>
          <h1 className="text-ms font-semibold">Request Engine</h1>
        </div>
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Glow variant="above" className="animate-appear-zoom opacity-0 [animation-delay:1000ms]" />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
