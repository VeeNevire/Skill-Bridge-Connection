import { Head, Link } from '@inertiajs/react';
import { motion, MotionConfig } from 'motion/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { easeOut } from '@/components/landing/blur-text';
import { Footer } from '@/components/landing/footer';
import { ArrowLeftIcon, LogoMark } from '@/components/landing/icons';
import { brand } from '@/data/landing';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import legal from '@/routes/legal';

export type LegalSection = { id: string; title: string; body: ReactNode };

export const LAST_UPDATED = '3 November 2026';

function useActiveSection(ids: string[]) {
    const [active, setActive] = useState(ids[0]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
            { rootMargin: '-20% 0px -70% 0px' },
        );
        ids.forEach((id) => {
            const el = document.getElementById(id);

            if (el) {
                observer.observe(el);
            }
        });

        return () => observer.disconnect();
    }, [ids]);

    return active;
}

/** Shared shell for the privacy policy and terms pages: header, sticky table of contents, sections. */
export function LegalLayout({ title, intro, sections }: { title: string; intro: ReactNode; sections: LegalSection[] }) {
    const active = useActiveSection(sections.map((s) => s.id));

    return (
        <MotionConfig reducedMotion="user">
            <Head title={title} />
            <div className="min-h-screen bg-surface font-sans text-ink antialiased">
                <header className="sticky top-0 z-30 border-b border-black/5 bg-surface/85 backdrop-blur-md">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
                        <Link href={home()} className="flex items-center gap-2 text-[15px] font-bold tracking-tight">
                            <LogoMark className="size-5 text-brand" />
                            {brand.name}
                        </Link>
                        <nav className="flex items-center gap-1 text-[13px]">
                            <Link
                                href={legal.privacy()}
                                className={cn('rounded-lg px-3 py-1.5 transition-colors hover:bg-black/5', title === 'Kebijakan Privasi' ? 'font-medium text-ink' : 'text-black/55')}
                            >
                                Privasi
                            </Link>
                            <Link
                                href={legal.terms()}
                                className={cn('rounded-lg px-3 py-1.5 transition-colors hover:bg-black/5', title === 'Syarat Penggunaan' ? 'font-medium text-ink' : 'text-black/55')}
                            >
                                Syarat
                            </Link>
                            <Link href={home()} className="ml-1 hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-black/55 hover:bg-black/5 hover:text-ink sm:flex">
                                <ArrowLeftIcon className="size-4" /> Beranda
                            </Link>
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easeOut }} className="max-w-3xl">
                        <p className="text-[12px] font-medium tracking-wide text-brand uppercase">{brand.fullName}</p>
                        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">{title}</h1>
                        <p className="mt-3 text-[13px] text-black/45">Terakhir diperbarui {LAST_UPDATED}</p>
                        <div className="mt-5 text-[15px] leading-relaxed text-black/65">{intro}</div>
                    </motion.div>

                    <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
                        <aside className="hidden lg:block">
                            <nav className="sticky top-24" aria-label="Daftar isi">
                                <p className="mb-2 text-[11px] font-medium tracking-wide text-black/40 uppercase">Daftar isi</p>
                                <ol className="space-y-0.5 border-l border-black/10">
                                    {sections.map((s, i) => (
                                        <li key={s.id}>
                                            <a
                                                href={`#${s.id}`}
                                                className={cn(
                                                    '-ml-px block border-l-2 py-1.5 pl-3 text-[12.5px] transition-colors',
                                                    active === s.id ? 'border-brand font-medium text-ink' : 'border-transparent text-black/50 hover:text-ink',
                                                )}
                                            >
                                                {i + 1}. {s.title}
                                            </a>
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        </aside>

                        <article className="max-w-3xl space-y-4">
                            {sections.map((s, i) => (
                                <section key={s.id} id={s.id} className="scroll-mt-24 rounded-2xl border border-black/5 bg-white p-6 sm:p-7">
                                    <h2 className="text-[17px] font-semibold tracking-tight">
                                        <span className="mr-2 text-brand">{i + 1}.</span>
                                        {s.title}
                                    </h2>
                                    <div className="legal-body mt-3 space-y-3 text-[14px] leading-relaxed text-black/65">{s.body}</div>
                                </section>
                            ))}
                        </article>
                    </div>
                </main>

                <Footer />
            </div>
        </MotionConfig>
    );
}

/** Bulleted list styled for legal text. */
export function List({ items }: { items: ReactNode[] }) {
    return (
        <ul className="space-y-1.5">
            {items.map((item, i) => (
                <li key={i} className="flex gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/60" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export function Strong({ children }: { children: ReactNode }) {
    return <span className="font-medium text-ink">{children}</span>;
}
