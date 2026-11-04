import { Link } from '@inertiajs/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import {
    AnimatePresence,
    motion,
    useMotionValueEvent,
    useScroll,
} from 'motion/react';
import { useEffect, useState } from 'react';
import { brand, navLinks } from '@/data/landing';
import { cn } from '@/lib/utils';
import { login, register } from '@/routes';
import { easeOut } from './blur-text';
import { LogoMark } from './icons';

export const MotionLink = motion.create(Link);

/** Tracks which landing section is currently in the middle of the viewport. */
function useActiveSection(ids: string[]) {
    const [active, setActive] = useState<string | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id);
                    }
                }
            },
            { rootMargin: '-45% 0px -50% 0px' },
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

const sectionIds = navLinks
    .filter((link) => link.href.startsWith('#'))
    .map((l) => l.href.slice(1));

export function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hovered, setHovered] = useState<string | null>(null);
    const active = useActiveSection(sectionIds);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

    useEffect(() => {
        const onKey = (e: KeyboardEvent) =>
            e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const highlighted = hovered ?? active;

    return (
        <motion.header
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut }}
            className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4 sm:px-4 2xl:top-6"
        >
            <nav
                className={cn(
                    'relative flex h-14 w-full max-w-[960px] items-center gap-2 rounded-2xl border pr-2 pl-4 transition-[background-color,box-shadow,border-color] duration-300 sm:pl-5 2xl:h-16 2xl:max-w-[1080px] 2xl:pl-6',
                    scrolled
                        ? 'border-black/[0.06] bg-white/80 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl'
                        : 'border-black/5 bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md',
                )}
            >
                <a href="#" className="group flex shrink-0 items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-brand/10 transition-transform duration-300 group-hover:-rotate-6 2xl:size-9">
                        <LogoMark className="size-5 text-brand" />
                    </span>
                    <span className="text-[16px] font-bold tracking-tight 2xl:text-[18px]">
                        {brand.name}
                    </span>
                </a>

                <ul
                    className="mx-auto hidden items-center md:flex"
                    onMouseLeave={() => setHovered(null)}
                >
                    {navLinks.map((link) => {
                        const id = link.href.slice(1);
                        const isActive = active === id;

                        return (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    onMouseEnter={() => setHovered(id)}
                                    aria-current={isActive ? 'true' : undefined}
                                    className={cn(
                                        'relative block rounded-xl px-3.5 py-2 text-[14px] whitespace-nowrap transition-colors lg:px-4 2xl:text-[15px]',
                                        highlighted === id || isActive
                                            ? 'text-ink'
                                            : 'text-black/55',
                                    )}
                                >
                                    {highlighted === id && (
                                        <motion.span
                                            layoutId="nav-pill"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 420,
                                                damping: 34,
                                            }}
                                            className="absolute inset-0 rounded-xl bg-zinc-100"
                                        />
                                    )}
                                    <span className="relative">
                                        {link.label}
                                    </span>
                                    {isActive && (
                                        <motion.span
                                            layoutId="nav-dot"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 420,
                                                damping: 34,
                                            }}
                                            className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand"
                                        />
                                    )}
                                </a>
                            </li>
                        );
                    })}
                </ul>

                <div className="ml-auto flex items-center gap-1.5 md:ml-0">
                    <Link
                        href={login()}
                        className="hidden rounded-xl px-4 py-2 text-[14px] font-medium text-black/70 transition-colors hover:bg-zinc-100 hover:text-ink sm:block 2xl:text-[15px]"
                    >
                        Masuk
                    </Link>
                    <MotionLink
                        href={register()}
                        whileTap={{ scale: 0.97 }}
                        className="group flex items-center gap-1.5 rounded-xl bg-ink py-2 pr-3.5 pl-4 text-[14px] font-medium whitespace-nowrap text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)] transition-colors hover:bg-black 2xl:py-2.5 2xl:text-[15px]"
                    >
                        Daftar Gratis
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </MotionLink>
                    <button
                        type="button"
                        aria-label={open ? 'Tutup menu' : 'Buka menu'}
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                        className="relative flex size-10 items-center justify-center rounded-xl transition-colors hover:bg-zinc-100 md:hidden"
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                                key={open ? 'close' : 'menu'}
                                initial={{
                                    rotate: -90,
                                    opacity: 0,
                                    scale: 0.6,
                                }}
                                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                                transition={{ duration: 0.2 }}
                                className="flex"
                            >
                                {open ? (
                                    <X className="size-5" />
                                ) : (
                                    <Menu className="size-5" />
                                )}
                            </motion.span>
                        </AnimatePresence>
                    </button>
                </div>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: easeOut }}
                            className="absolute inset-x-0 top-full mt-2 origin-top rounded-2xl border border-black/5 bg-white p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] md:hidden"
                        >
                            <ul>
                                {navLinks.map((link, i) => (
                                    <motion.li
                                        key={link.href}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.04 * i,
                                            duration: 0.25,
                                        }}
                                    >
                                        <a
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                'flex items-center justify-between rounded-xl px-4 py-3 text-[15px] transition-colors hover:bg-zinc-50',
                                                active === link.href.slice(1)
                                                    ? 'font-medium text-ink'
                                                    : 'text-black/65',
                                            )}
                                        >
                                            {link.label}
                                            {active === link.href.slice(1) && (
                                                <span className="size-1.5 rounded-full bg-brand" />
                                            )}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-black/5 p-2 pt-3">
                                <Link
                                    href={login()}
                                    className="rounded-xl border border-black/10 py-2.5 text-center text-[14px] font-medium"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-xl bg-ink py-2.5 text-center text-[14px] font-medium text-white"
                                >
                                    Daftar Gratis
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </motion.header>
    );
}
