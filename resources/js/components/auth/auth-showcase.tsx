import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { statusStyles } from '@/components/landing/bento-section';
import { BlurText, easeOut, FadeUp } from '@/components/landing/blur-text';
import { BellIcon, LogoMark, StarIcon } from '@/components/landing/icons';
import { bento, brand, testimonials } from '@/data/landing';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

const progress = [72, 45, 20];
const trend = [24, 38, 32, 52, 46, 68, 62, 84];

function useCycle(length: number, interval: number) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setIndex((i) => (i + 1) % length), interval);

        return () => clearInterval(id);
    }, [length, interval]);

    return index;
}

function Floating({ children, className, delay, bob = 6 }: { children: ReactNode; className?: string; delay: number; bob?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay, ease: easeOut }}
            className={cn('absolute', className)}
        >
            <motion.div animate={{ y: [0, -bob, 0] }} transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.8 }}>
                {children}
            </motion.div>
        </motion.div>
    );
}

function TrackerCard() {
    return (
        <div className="w-[300px] rounded-2xl border border-black/5 bg-white p-4 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.25)]">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold">Aplikasi Saya</span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] text-black/50">3 aktif</span>
            </div>
            <ul className="space-y-3">
                {bento.applications.map((app, i) => (
                    <li key={app.name}>
                        <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <div className="truncate text-[12px] font-medium">{app.name}</div>
                                <div className="text-[10px] text-black/40">{app.type}</div>
                            </div>
                            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', statusStyles[app.status])}>{app.status}</span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-100">
                            <motion.div
                                className="h-full rounded-full bg-brand"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress[i]}%` }}
                                transition={{ duration: 1.2, delay: 0.9 + i * 0.15, ease: easeOut }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ChartCard() {
    const path = trend.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (trend.length - 1)) * 200} ${100 - v}`).join(' ');

    return (
        <div className="w-[190px] rounded-2xl border border-black/5 bg-white p-3.5 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.25)]">
            <div className="text-[11px] text-black/45">Progres Belajar</div>
            <div className="mt-0.5 text-xl font-semibold tracking-tight">
                84<span className="text-sm text-black/40">%</span>
            </div>
            <svg viewBox="0 0 200 100" className="mt-1 h-14 w-full overflow-visible" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="auth-chart-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.path
                    d={`${path} L200 100 L0 100Z`}
                    fill="url(#auth-chart-fill)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.6 }}
                />
                <motion.path
                    d={path}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, delay: 1, ease: easeOut }}
                />
            </svg>
        </div>
    );
}

function ProfileChip() {
    return (
        <div className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-white py-2 pr-4 pl-2 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.3)]">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="size-8 rounded-xl object-cover" />
            <div className="leading-tight">
                <div className="text-[12px] font-semibold">Talent Passport</div>
                <div className="text-[10px] text-black/45">Profil lengkap 85%</div>
            </div>
        </div>
    );
}

function DeadlineToast() {
    const index = useCycle(bento.toasts.length, 2600);

    return (
        <div className="flex h-11 w-[240px] items-center overflow-hidden rounded-xl border border-black/5 bg-white pr-3 pl-2 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.35)]">
            <span className="mr-2 flex size-7 shrink-0 items-center justify-center rounded-lg bg-cta/10 text-cta">
                <BellIcon className="size-4" />
            </span>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.4, ease: easeOut }}
                    className="truncate text-[12px] font-medium"
                >
                    {bento.toasts[index]}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}

function TestimonialTicker() {
    const index = useCycle(testimonials.items.length, 5000);
    const item = testimonials.items[index];

    return (
        <div className="relative mt-6 min-h-[92px] rounded-2xl border border-black/5 bg-white/70 p-4 backdrop-blur-sm">
            <AnimatePresence mode="wait">
                <motion.figure
                    key={index}
                    initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.45, ease: easeOut }}
                >
                    <blockquote className="line-clamp-2 text-[13px] leading-relaxed text-black/65">{item.quote}</blockquote>
                    <figcaption className="mt-2.5 flex items-center gap-2">
                        <img src={item.avatar} alt="" className="size-6 rounded-full object-cover" />
                        <span className="text-[12px] font-medium">{item.name}</span>
                        <span className="truncate text-[11px] text-black/40">· {item.role}</span>
                        <span className="ml-auto flex shrink-0 text-[#FACC15]">
                            {Array.from({ length: item.rating }).map((_, i) => (
                                <StarIcon key={i} className="size-3" />
                            ))}
                        </span>
                    </figcaption>
                </motion.figure>
            </AnimatePresence>
        </div>
    );
}

/**
 * Light brand panel beside the auth card: a live-looking preview of the dashboard the user is signing up for.
 */
export function AuthShowcase() {
    return (
        <div className="relative hidden overflow-hidden rounded-3xl border border-black/5 bg-white p-10 lg:sticky lg:top-3 lg:flex lg:h-[calc(100svh-1.5rem)] lg:flex-col lg:self-start">
            <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                    maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)',
                }}
            />
            <div className="pointer-events-none absolute top-[18%] left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-brand/15 blur-[90px]" />
            <div className="pointer-events-none absolute top-[38%] left-[62%] size-56 rounded-full bg-cta/10 blur-[70px]" />

            <Link href={home()} className="relative flex items-center gap-1.5 text-[15px] font-bold tracking-tight">
                <LogoMark className="size-5 text-brand" />
                {brand.name}
            </Link>

            <div className="relative my-auto flex shrink-0 justify-center py-6">
                <div className="relative h-[340px] w-[480px] shrink-0 origin-center scale-[0.82] xl:scale-100">
                    <Floating className="top-0 right-0" delay={0.7}>
                        <ProfileChip />
                    </Floating>
                    <Floating className="top-[16%] left-0" delay={0.4} bob={4}>
                        <TrackerCard />
                    </Floating>
                    <Floating className="top-[42%] right-0" delay={0.85}>
                        <ChartCard />
                    </Floating>
                    <Floating className="bottom-0 left-[8%]" delay={1.1} bob={5}>
                        <DeadlineToast />
                    </Floating>
                </div>
            </div>

            <div className="relative">
                <BlurText
                    as="h2"
                    immediate
                    delay={0.3}
                    text={brand.tagline}
                    className="max-w-md text-4xl leading-[1.05] font-semibold tracking-[-0.035em]"
                />
                <FadeUp immediate delay={0.9}>
                    <p className="mt-3 max-w-md text-[14px] leading-relaxed text-black/50">
                        Beasiswa, kelas, mentor, dan peluang karier dalam satu ekosistem yang terarah.
                    </p>
                </FadeUp>
                <FadeUp immediate delay={1.2}>
                    <TestimonialTicker />
                </FadeUp>
            </div>
        </div>
    );
}
