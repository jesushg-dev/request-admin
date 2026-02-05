module.exports = {
  useTranslations: () => (k) => k,
  useLocale: () => 'en',
  // minimal client provider stub
  NextIntlClientProvider: ({ children }) => children,
  // server-side helpers that may be imported in some modules
  createTranslator: () => ({ t: (k) => k }),
  getTranslator: async () => ({ t: (k) => k }),
  getTranslations: (/* namespaceOrOptions */) => {
    return (key) => key;
  },
};
