export const cssVar = (name: string, value: string | null) => {
  document.documentElement.style.setProperty(name, value);
};
