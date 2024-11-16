const rswitch = (param: number | string, cases: Record<number | string, React.ReactNode>, defaultRequest?: React.ReactNode): React.ReactNode => {
  if (cases[param]) {
    return cases[param];
  } else {
    return defaultRequest ?? <span className="text-red-500">No found</span>;
  }
};

export default rswitch;
