import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { motion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { easeOut } from '@/components/landing/blur-text';
import { ArrowLeftIcon, LogoMark } from '@/components/landing/icons';
import { brand } from '@/data/landing';
import { home, login } from '@/routes';
import { AuthShowcase } from './auth-showcase';

/** Notice for the session flash message, e.g. after a reset link is sent. */
export function FlashNotice() {
    const message = usePage().props.flash?.success;

    if (!message) {
        return null;
    }

    return (
        <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[12.5px] text-emerald-800"
        >
            <CheckCircle2 className="mt-px size-4 shrink-0" />
            {message}
        </motion.p>
    );
}

/** Same split layout as the login page, with a single card on the right. */
export function AuthShell({ title, heading, description, children }: { title: string; heading: string; description: string; children: ReactNode }) {
    return (
        <MotionConfig reducedMotion="user">
            <Head title={title} />
            <div className="grid min-h-screen bg-surface p-3 font-sans text-ink antialiased lg:grid-cols-2 lg:gap-3">
                <AuthShowcase />

                <main className="relative flex flex-col px-3 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <Link href={home()} className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight lg:invisible">
                            <LogoMark className="size-5 text-brand" />
                            {brand.name}
                        </Link>
                        <Link
                            href={login()}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-black/60 transition-colors hover:bg-black/5 hover:text-black"
                        >
                            <ArrowLeftIcon className="size-4" />
                            Kembali ke masuk
                        </Link>
                    </div>

                    <div className="flex flex-1 items-center justify-center py-10">
                        <motion.div
                            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.7, ease: easeOut }}
                            className="w-full max-w-[420px] rounded-3xl border border-black/5 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] sm:p-8 2xl:max-w-[460px]"
                        >
                            <h1 className="text-2xl font-semibold tracking-[-0.03em]">{heading}</h1>
                            <p className="mt-1.5 mb-6 text-[13.5px] leading-relaxed text-black/50">{description}</p>
                            <FlashNotice />
                            {children}
                        </motion.div>
                    </div>

                    <p className="text-center text-[11px] text-black/35">
                        © {new Date().getFullYear()} {brand.fullName}
                    </p>
                </main>
            </div>
        </MotionConfig>
    );
}
