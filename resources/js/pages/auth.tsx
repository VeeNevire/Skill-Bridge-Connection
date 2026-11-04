import { Head, Link } from '@inertiajs/react';
import { MotionConfig } from 'motion/react';
import { useState } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import type { AuthTab } from '@/components/auth/auth-card';
import { FlashNotice } from '@/components/auth/auth-shell';
import { AuthShowcase } from '@/components/auth/auth-showcase';
import { ArrowLeftIcon, LogoMark } from '@/components/landing/icons';
import { brand } from '@/data/landing';
import { home, login, register } from '@/routes';

const titles: Record<AuthTab, string> = { login: 'Masuk', register: 'Daftar' };

export default function Auth({ tab: initialTab }: { tab: AuthTab }) {
    const [tab, setTab] = useState<AuthTab>(initialTab);

    const changeTab = (next: AuthTab) => {
        setTab(next);
        // Keep the URL shareable without an Inertia visit, so only the card changes.
        window.history.replaceState(window.history.state, '', next === 'login' ? login.url() : register.url());
    };

    return (
        <MotionConfig reducedMotion="user">
            <Head title={titles[tab]} />
            <div className="grid min-h-screen bg-surface p-3 font-sans text-ink antialiased lg:grid-cols-2 lg:gap-3">
                <AuthShowcase />

                <main className="relative flex flex-col px-3 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <Link href={home()} className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight lg:invisible">
                            <LogoMark className="size-5 text-brand" />
                            {brand.name}
                        </Link>
                        <Link
                            href={home()}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-black/60 transition-colors hover:bg-black/5 hover:text-black"
                        >
                            <ArrowLeftIcon className="size-4" />
                            Beranda
                        </Link>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center py-10">
                        <div className="w-full max-w-[420px] 2xl:max-w-[460px]">
                            <FlashNotice />
                        </div>
                        <AuthCard tab={tab} onTabChange={changeTab} />
                    </div>

                    <p className="text-center text-[11px] text-black/35">
                        © {new Date().getFullYear()} {brand.fullName}
                    </p>
                </main>
            </div>
        </MotionConfig>
    );
}
