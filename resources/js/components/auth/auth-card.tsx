import { Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react';
import { easeOut } from '@/components/landing/blur-text';
import { EyeIcon, LockIcon, MailIcon, UserIcon } from '@/components/landing/icons';
import { cn } from '@/lib/utils';
import { store as loginStore } from '@/routes/login';
import legal from '@/routes/legal';
import { request as passwordRequest } from '@/routes/password';
import { store as registerStore } from '@/routes/register';

export type AuthTab = 'login' | 'register';

const tabs: { id: AuthTab; label: string }[] = [
    { id: 'login', label: 'Masuk' },
    { id: 'register', label: 'Daftar' },
];

const copy: Record<AuthTab, { title: string; subtitle: string }> = {
    login: { title: 'Selamat datang kembali', subtitle: 'Masuk untuk melanjutkan persiapan beasiswa dan karier Anda.' },
    register: { title: 'Buat akun baru', subtitle: 'Mulai bangun Talent Passport Anda dalam hitungan menit.' },
};

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function Field({ label, icon, trailing, error, ...props }: FieldProps & { icon: ReactNode; trailing?: ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-black/70">{label}</span>
            <span
                className={cn(
                    'group flex items-center gap-2 rounded-xl border bg-white px-3 transition-[border-color,box-shadow] focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.12)]',
                    error ? 'border-cta/60 focus-within:border-cta' : 'border-black/10 focus-within:border-brand',
                )}
            >
                <span className={cn('transition-colors group-focus-within:text-brand', error ? 'text-cta/70' : 'text-black/35')}>{icon}</span>
                <input {...props} aria-invalid={error ? true : undefined} className="h-11 w-full bg-transparent text-[14px] outline-none placeholder:text-black/30" />
                {trailing}
            </span>
            <AnimatePresence>
                {error && (
                    <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-1.5 block text-[11.5px] text-cta"
                    >
                        {error}
                    </motion.span>
                )}
            </AnimatePresence>
        </label>
    );
}

export function PasswordField({ label, ...props }: FieldProps) {
    const [visible, setVisible] = useState(false);

    return (
        <Field
            {...props}
            label={label}
            type={visible ? 'text' : 'password'}
            icon={<LockIcon className="size-4" />}
            trailing={
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="text-black/35 transition-colors hover:text-black/70"
                >
                    <EyeIcon off={visible} className="size-4" />
                </button>
            }
        />
    );
}

function passwordScore(password: string) {
    return [password.length >= 8, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean)
        .length;
}

const strengthLabels = ['Terlalu lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'];
const strengthColors = ['#e4e4e7', '#f04438', '#f59e0b', '#10b981', '#8b5cf6'];

function StrengthMeter({ password }: { password: string }) {
    const score = passwordScore(password);

    if (!password) {
        return null;
    }

    return (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="-mt-1">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <motion.span
                        key={i}
                        className="h-1 flex-1 rounded-full"
                        animate={{ backgroundColor: i <= score ? strengthColors[score] : strengthColors[0] }}
                        transition={{ duration: 0.3 }}
                    />
                ))}
            </div>
            <span className="mt-1 block text-[11px] text-black/45">Kekuatan: {strengthLabels[score]}</span>
        </motion.div>
    );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
    return (
        <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-ink text-[14px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] disabled:opacity-80"
        >
            <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                    <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    />
                ) : (
                    <motion.span key="label" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        {children}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
    const form = useForm({ email: '', password: '', remember: false });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(loginStore(), { onFinish: () => form.reset('password') });
    };

    return (
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
            <PasswordField
                label="Kata sandi"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.data.password}
                onChange={(e) => form.setData('password', e.target.value)}
                error={form.errors.password}
            />
            <div className="flex items-center justify-between text-[12.5px]">
                <label className="flex cursor-pointer items-center gap-2 text-black/60">
                    <input
                        type="checkbox"
                        name="remember"
                        checked={form.data.remember}
                        onChange={(e) => form.setData('remember', e.target.checked)}
                        className="size-4 rounded accent-brand"
                    />
                    Ingat saya
                </label>
                <Link href={passwordRequest()} className="font-medium text-brand hover:underline">
                    Lupa kata sandi?
                </Link>
            </div>
            <SubmitButton loading={form.processing}>Masuk</SubmitButton>
            <p className="text-center text-[13px] text-black/50">
                Belum punya akun?{' '}
                <button type="button" onClick={onSwitch} className="font-medium text-brand hover:underline">
                    Daftar sekarang
                </button>
            </p>
        </form>
    );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
    const form = useForm({ name: '', email: '', password: '', password_confirmation: '', privacy: false });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(registerStore(), { onFinish: () => form.reset('password', 'password_confirmation') });
    };

    return (
        <form onSubmit={submit} noValidate className="space-y-4">
            <Field label="Nama lengkap" name="name" required autoComplete="name" placeholder="Nama Anda" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} icon={<UserIcon className="size-4" />} />
            <Field label="Email" type="email" name="email" required autoComplete="email" placeholder="nama@email.com" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} icon={<MailIcon className="size-4" />} />
            <PasswordField label="Kata sandi" name="password" required autoComplete="new-password" placeholder="Minimal 8 karakter" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} error={form.errors.password} />
            <StrengthMeter password={form.data.password} />
            <PasswordField label="Konfirmasi kata sandi" name="password_confirmation" required autoComplete="new-password" placeholder="Ulangi kata sandi" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
            <label className="flex cursor-pointer items-start gap-2 text-[12.5px] leading-snug text-black/60">
                <input type="checkbox" name="privacy" checked={form.data.privacy} onChange={(e) => form.setData('privacy', e.target.checked)} className="mt-0.5 size-4 shrink-0 rounded accent-brand" />
                <span>Saya telah membaca dan menyetujui <a href={legal.privacy.url()} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">Kebijakan Privasi</a> serta <a href={legal.terms.url()} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">Syarat Penggunaan</a>, termasuk penggunaan nama dan email saya untuk membuat dan mengelola akun.</span>
            </label>
            {form.errors.privacy && <p role="alert" className="text-[11.5px] text-cta">{form.errors.privacy}</p>}
            <SubmitButton loading={form.processing}>Buat Akun</SubmitButton>
            <p className="text-center text-[13px] text-black/50">Sudah punya akun?{' '}<button type="button" onClick={onSwitch} className="font-medium text-brand hover:underline">Masuk</button></p>
        </form>
    );
}

/** Animates its height to follow the content, so switching tabs only reshapes the card. */
function AutoHeight({ children }: { children: ReactNode }) {
    const inner = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | 'auto'>('auto');

    useLayoutEffect(() => {
        const el = inner.current;

        if (!el) {
            return;
        }

        const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return (
        <motion.div animate={{ height }} transition={{ duration: 0.45, ease: easeOut }} className="overflow-hidden">
            <div ref={inner}>{children}</div>
        </motion.div>
    );
}

export function AuthCard({ tab, onTabChange }: { tab: AuthTab; onTabChange: (tab: AuthTab) => void }) {
    const direction = tab === 'register' ? 1 : -1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="w-full max-w-[420px] rounded-3xl 2xl:max-w-[460px] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] sm:p-8"
        >
            <div role="tablist" aria-label="Masuk atau daftar" className="relative grid grid-cols-2 rounded-xl bg-zinc-100 p-1">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={tab === t.id}
                        onClick={() => onTabChange(t.id)}
                        className={cn(
                            'relative z-10 h-9 rounded-lg text-[13px] font-medium transition-colors',
                            tab === t.id ? 'text-ink' : 'text-black/45 hover:text-black/70',
                        )}
                    >
                        {tab === t.id && (
                            <motion.span
                                layoutId="auth-tab-pill"
                                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                className="absolute inset-0 -z-10 rounded-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                            />
                        )}
                        {t.label}
                    </button>
                ))}
            </div>

            <AutoHeight>
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                    <motion.div
                        key={tab}
                        custom={direction}
                        variants={{
                            enter: (d: number) => ({ opacity: 0, x: d * 40, filter: 'blur(6px)' }),
                            center: { opacity: 1, x: 0, filter: 'blur(0px)' },
                            exit: (d: number) => ({ opacity: 0, x: d * -40, filter: 'blur(6px)' }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: easeOut }}
                        className="pt-7"
                    >
                        <h1 className="text-2xl font-semibold tracking-[-0.03em]">{copy[tab].title}</h1>
                        <p className="mt-1.5 mb-6 text-[13.5px] leading-relaxed text-black/50">{copy[tab].subtitle}</p>
                        {tab === 'login' ? <LoginForm onSwitch={() => onTabChange('register')} /> : <RegisterForm onSwitch={() => onTabChange('login')} />}
                    </motion.div>
                </AnimatePresence>
            </AutoHeight>
        </motion.div>
    );
}
