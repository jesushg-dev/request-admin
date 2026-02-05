module.exports = {
  // provide minimal placeholders used in code/tests
  JWKS: {},
  SignJWT: function () {
    return { setProtectedHeader: () => ({ setExpirationTime: () => ({ sign: async () => '' }) }) };
  },
};
