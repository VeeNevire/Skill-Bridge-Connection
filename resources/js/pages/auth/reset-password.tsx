import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Field, PasswordField, SubmitButton } from '@/components/auth/auth-card';
import { AuthShell } from '@/components/auth/auth-shell';
import { MailIcon } from '@/components/landing/icons';
import { store as resetPassword } from '@/routes/password';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const form = useForm({ token, email, password: '', password_confirmation: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(resetPassword(), { onFinish: () => form.reset('password', 'password_confirmation') });
    };

    return (
        <AuthShell title="Atur ulang kata sandi" heading="Atur ulang kata sandi" description="Buat kata sandi baru untuk akun Anda.">
            <form onSubmit={submit} noValidate className="space-y-4">
                <Field
                    label="Email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                    icon={<MailIcon className="size-4" />}
                />
                <PasswordField
                    label="Kata sandi baru"
                    name="password"
                    required
                    autoFocus
                    autoComplete="new-password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    error={form.errors.password}
                />
                <PasswordField
                    label="Konfirmasi kata sandi baru"
                    name="password_confirmation"
                    required
                    autoComplete="new-password"
                    value={form.data.password_confirmation}
                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                    error={form.errors.password_confirmation}
                />
                <SubmitButton loading={form.processing}>Simpan kata sandi baru</SubmitButton>
            </form>
        </AuthShell>
    );
}
