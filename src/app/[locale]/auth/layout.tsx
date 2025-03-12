const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-2 text-center z-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-lg font-bold">RE</span>
          </div>
          <h1 className="text-ms font-semibold"> Request Engine</h1>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
