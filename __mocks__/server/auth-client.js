module.exports = {
  authClient: {
    resetPassword: jest.fn().mockResolvedValue({}),
    requestPasswordReset: jest.fn().mockResolvedValue({}),
    forgetPassword: jest.fn().mockResolvedValue({}),
    useSession: jest.fn().mockReturnValue({ data: null, isPending: false }),
  },
  useSession: jest.fn().mockReturnValue({ data: null, isPending: false }),
};
