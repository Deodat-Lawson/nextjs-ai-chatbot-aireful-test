'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { login, type LoginActionState } from '../actions';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
      login,
      {
        status: 'idle',
      },
  );

  useEffect(() => {
    if (state.status === 'failed') {
      toast.error('Invalid credentials!');
    } else if (state.status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-background px-4">
        {/* App Title and Description */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold dark:text-zinc-50">
            Eric 的爸爸
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-zinc-400">
            Try out free o1 mini and o1 preview。
          </p>
        </div>

        {/* Sign In Card */}
        <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12 bg-white p-6 shadow-md dark:bg-zinc-800">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Use your email and password to sign in
            </p>
          </div>
          <AuthForm action={handleSubmit} defaultEmail={email}>
            <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
            <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
              {"Don't have an account? "}
              <Link
                  href="/register"
                  className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              >
                Sign up
              </Link>
              {' for free.'}
            </p>
          </AuthForm>
        </div>
      </div>
  );
}
