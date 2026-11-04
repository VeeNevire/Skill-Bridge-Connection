import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field, SubmitButton } from '@/components/auth/auth-card';
import { AuthShell } from '@/components/auth/auth-shell';
import { MailIcon } from '@/components/landing/icons';
import { login } from '@/routes';
import { email as sendResetLink } from '@/routes/password';

export default function ForgotPassword() {
    const form = useForm({ email: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(sendResetLink(), { preserveScroll: true });
    };

    return (
        <AuthShell
            title="Lupa kata sandi"
            heading="Lupa kata sandi?"
            description="Masukkan email akun Anda. Kami akan mengirim tautan untuk mengatur ulang kata sandi."
        >
            <form onSubmit={submit} noValidate className="space-y-4">
                <Field
                    label="Email"
                    type="email"
                    name="email"
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                    icon={<MailIcon className="size-4" />}
                />
                <SubmitButton loading={form.processing}>Kirim tautan atur ulang</SubmitButton>
                <p className="text-center text-[13px] text-black/50">
                    Ingat kata sandi?{' '}
                    <Link href={login()} className="font-medium text-brand hover:underline">
                        Masuk
                    </Link>
                </p>
            </form>
        </AuthShell>
    );
}
