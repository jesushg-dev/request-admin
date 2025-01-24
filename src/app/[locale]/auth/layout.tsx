const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="to-bg relative flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-blue-900 py-6">{children}</div>;
};

export default AuthLayout;
