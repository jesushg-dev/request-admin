'use client';

import React, { type FC } from 'react';
import { signIn } from 'next-auth/react';

import { Input } from '@/components/Form';
import { useLoginUserSchema, type LoginUserInputs } from '@/connections/user';
import { Link } from '@/navigation';

interface IUserLoginProps {}

const UserLogin: FC<IUserLoginProps> = () => {
  const { register, handleSubmit, formState } = useLoginUserSchema();

  const handleSignIn = async (data: LoginUserInputs) => {
    const result = await signIn('credentials', {
      username: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
      redirectUrl: true,
      callbackUrl: '/admin',
    });
  };

  return (
    <form onSubmit={handleSubmit(handleSignIn)}>
      <div className="intro-x mt-8">
        <Input
          required
          name="email"
          formState={formState}
          register={register}
          className="dark:disabled:bg-darkmode-800/50 [&[readonly]]:dark:bg-darkmode-800/50 dark:bg-darkmode-800 intro-x login__input block w-full min-w-full rounded-md border-slate-200 px-4 py-3 text-sm shadow-sm transition duration-200 ease-in-out placeholder:text-slate-400/90 focus:border-primary focus:border-opacity-40 focus:ring-4 focus:ring-primary focus:ring-opacity-20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-transparent dark:placeholder:text-slate-500/80 dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:disabled:border-transparent xl:min-w-[350px] [&[readonly]]:cursor-not-allowed [&[readonly]]:bg-slate-100 [&[readonly]]:dark:border-transparent"
          type="text"
          placeholder="Email"
        />
        <Input
          required
          name="password"
          formState={formState}
          register={register}
          className="dark:disabled:bg-darkmode-800/50 [&[readonly]]:dark:bg-darkmode-800/50 dark:bg-darkmode-800 intro-x login__input mt-4 block w-full min-w-full rounded-md border-slate-200 px-4 py-3 text-sm shadow-sm transition duration-200 ease-in-out placeholder:text-slate-400/90 focus:border-primary focus:border-opacity-40 focus:ring-4 focus:ring-primary focus:ring-opacity-20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-transparent dark:placeholder:text-slate-500/80 dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:disabled:border-transparent xl:min-w-[350px] [&[readonly]]:cursor-not-allowed [&[readonly]]:bg-slate-100 [&[readonly]]:dark:border-transparent"
          type="password"
          placeholder="Password"
        />
      </div>
      <div className="intro-x mt-4 flex text-xs text-slate-600 dark:text-slate-500 sm:text-sm">
        <div className="mr-auto flex items-center">
          <Input
            name="rememberMe"
            formState={formState}
            register={register}
            className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
            type="checkbox"
            id="remember-me"
          />
          <label className="cursor-pointer select-none" htmlFor="remember-me">
            Remember me
          </label>
        </div>
        <Link href="/">Forgot Password?</Link>
      </div>
      <div className="intro-x mt-5 text-center xl:mt-8 xl:text-left">
        <button className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-4 py-3 align-top font-medium text-white shadow-sm transition duration-200 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-primary dark:focus:ring-slate-700 dark:focus:ring-opacity-50 xl:mr-3 xl:w-32 [&:hover:not(:disabled)]:border-opacity-90 [&:hover:not(:disabled)]:bg-opacity-90 [&:not(button)]:text-center">
          Login
        </button>
        <button className="dark:border-darkmode-100/40 [&:hover:not(:disabled)]:dark:bg-darkmode-100/10 mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-secondary px-4 py-3 align-top font-medium text-slate-500 shadow-sm transition duration-200 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:text-slate-300 dark:focus:ring-slate-700 dark:focus:ring-opacity-50 xl:mt-0 xl:w-32 [&:hover:not(:disabled)]:border-opacity-90 [&:hover:not(:disabled)]:bg-secondary/20 [&:hover:not(:disabled)]:bg-opacity-90 [&:not(button)]:text-center">
          Register
        </button>
      </div>
    </form>
  );
};

export default UserLogin;
