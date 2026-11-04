import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { bento } from '@/data/landing';
import type { ApplicationStatus } from '@/data/landing';
import { cn } from '@/lib/utils';
import { BlurText, easeOut, FadeUp } from './blur-text';
import { DocumentIcon, ModuleIcon, SparkleIcon, UsersIcon } from './icons';

export const statusStyles: Record<ApplicationStatus, string> = {
    Persiapan: 'bg-amber-100 text-amber-700',
    Dikirim: 'bg-sky-100 text-sky-700',
    Seleksi: 'bg-violet-100 text-violet-700',
};

const bars = [38, 52, 30, 78, 64, 46, 28];
const trend = [30, 42, 36, 58, 50, 72, 64, 88];

function Card({ className, index, children }: { className?: string; index: number; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: easeOut }}
            whileHover={{ y: -4 }}
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.18)]',
                className,
            )}
        >
            {children}
        </motion.div>
    );
}

function CardText({ title, body }: { title: string; body: string }) {
    return (
        <div className="mt-auto pt-4">
            <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-black/45">{body}</p>
        </div>
    );
}

function SkillReport() {
    return (
        <div className="relative mx-auto flex h-36 w-full items-center justify-center">
            <div className="absolute left-0 h-24 w-10 rounded-xl bg-zinc-100" />
            <div className="absolute right-0 h-24 w-10 rounded-xl bg-zinc-100" />
            <div className="relative w-[72%] rounded-xl border border-black/5 bg-white p-3 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] transition-transform duration-500 group-hover:scale-105">
                <div className="mb-2 flex items-center justify-between text-[8px] font-medium">
                    <span>{bento.reportLabel}</span>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-black/50">Bulanan</span>
                </div>
                <div className="flex h-16 items-end gap-1.5">
                    {bars.map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 + i * 0.07, ease: easeOut }}
                            className={cn('flex-1 rounded-t-[3px]', i === 3 ? 'bg-brand' : i % 2 ? 'bg-[#c4b5fd]' : 'bg-[#F04438]/80')}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ToastCycler() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setIndex((i) => (i + 1) % bento.toasts.length), 2200);

        return () => clearInterval(id);
    }, []);

    const colors = ['bg-[#38BDF8]', 'bg-[#F04438]', 'bg-[#FDE047]'];

    return (
        <div className="relative flex h-36 items-center justify-center">
            {[1, 2, 3].map((r) => (
                <motion.div
                    key={r}
                    animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 4, delay: r * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute rounded-full border border-black/[0.06]"
                    style={{ width: r * 70, height: r * 70 }}
                />
            ))}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 24, scale: 0.9, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -24, scale: 0.9, filter: 'blur(4px)' }}
                    transition={{ duration: 0.5, ease: easeOut }}
                    className="relative flex items-center gap-2 rounded-lg border border-black/5 bg-white py-2 pr-4 pl-2 text-[11px] font-medium shadow-[0_10px_24px_-10px_rgba(0,0,0,0.25)]"
                >
                    <span className={cn('flex size-5 items-center justify-center rounded-md text-white', colors[index])}>
                        <SparkleIcon className="size-3" />
                    </span>
                    {bento.toasts[index]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function StackedDocs() {
    return (
        <div className="relative flex h-36 items-center justify-center">
            <motion.div
                className="absolute h-20 w-24 rounded-lg border border-black/5 bg-zinc-50 shadow-sm"
                initial={{ rotate: 0, x: 0 }}
                whileInView={{ rotate: -10, x: -46 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.4, ease: easeOut }}
            />
            <motion.div
                className="absolute h-20 w-24 rounded-lg border border-black/5 bg-zinc-50 shadow-sm"
                initial={{ rotate: 0, x: 0 }}
                whileInView={{ rotate: 10, x: 46 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.4, ease: easeOut }}
            />
            <div className="absolute h-24 w-28 rounded-lg border border-black/5 bg-white shadow-md" />
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex size-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#a78bfa] to-brand text-white shadow-[0_10px_20px_-6px_rgba(139,92,246,0.6)] transition-transform group-hover:rotate-12"
            >
                <ModuleIcon name="mentor" className="size-5" />
            </motion.div>
        </div>
    );
}

function DataPanel() {
    const path = trend.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (trend.length - 1)) * 200} ${100 - v}`).join(' ');

    return (
        <div className="flex h-full flex-col gap-4 sm:flex-row">
            <div className="flex flex-col sm:w-[38%]">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#F04438]/10 text-cta">
                    <DocumentIcon className="size-4" />
                </span>
                <CardText {...bento.cards.tracker} />
            </div>
            <div className="relative grid flex-1 grid-cols-2 gap-3">
                <div className="rounded-xl border border-black/5 p-3 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.25)]">
                    <div className="mb-2 flex justify-between text-[9px] font-medium">
                        <span>Aplikasi Saya</span>
                        <span className="text-black/40">Lihat semua</span>
                    </div>
                    <ul className="space-y-2">
                        {bento.applications.map((app, i) => (
                            <motion.li
                                key={app.name}
                                initial={{ opacity: 0, x: -12 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.5 + i * 0.12, ease: easeOut }}
                                className="flex items-center justify-between gap-2"
                            >
                                <div className="min-w-0 leading-tight">
                                    <div className="truncate text-[9px] font-medium">{app.name}</div>
                                    <div className="text-[8px] text-black/40">{app.type}</div>
                                </div>
                                <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[7.5px] font-medium', statusStyles[app.status])}>
                                    {app.status}
                                </span>
                            </motion.li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-xl border border-black/5 p-3 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.25)]">
                    <div className="mb-2 text-[9px] font-medium">Kesiapan Dokumen</div>
                    <svg viewBox="0 0 200 100" className="h-20 w-full overflow-visible" preserveAspectRatio="none">
                        <motion.path
                            d={path}
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.4, delay: 0.5, ease: easeOut }}
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}

function AvatarOrbit() {
    const n = bento.orbit.length;

    return (
        <div className="relative mx-auto flex size-36 items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
            >
                {bento.orbit.map((src, i) => {
                    const angle = (i / n) * Math.PI * 2;

                    return (
                        <motion.img
                            key={src}
                            src={src}
                            alt=""
                            loading="lazy"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                            className={cn('absolute size-9 rounded-xl border-2 border-white object-cover shadow-md', i % 3 === 0 && 'size-7')}
                            style={{
                                left: `${50 + Math.cos(angle) * 42}%`,
                                top: `${50 + Math.sin(angle) * 42}%`,
                                translate: '-50% -50%',
                            }}
                        />
                    );
                })}
            </motion.div>
            <span className="flex size-10 items-center justify-center rounded-full bg-white text-ink shadow-md">
                <UsersIcon className="size-5" />
            </span>
        </div>
    );
}

export function BentoSection() {
    const { participant, partner, mentor, company } = bento.cards;

    return (
        <section id="peran" className="relative px-4 py-24 sm:py-32">
            <div className="mx-auto max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl">
                <div className="mx-auto max-w-xl text-center">
                    <BlurText text={bento.title} className="text-4xl leading-[1.05] font-semibold tracking-[-0.035em] sm:text-5xl 2xl:text-6xl" />
                    <FadeUp delay={0.3}>
                        <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-black/50 2xl:max-w-lg 2xl:text-[16px]">{bento.subtitle}</p>
                    </FadeUp>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card index={0}>
                        <SkillReport />
                        <CardText {...participant} />
                    </Card>
                    <Card index={1}>
                        <ToastCycler />
                        <CardText {...partner} />
                    </Card>
                    <Card index={2}>
                        <StackedDocs />
                        <CardText {...mentor} />
                    </Card>
                    <Card index={3} className="sm:col-span-2">
                        <DataPanel />
                    </Card>
                    <Card index={4} className="sm:col-span-2 lg:col-span-1">
                        <AvatarOrbit />
                        <CardText {...company} />
                    </Card>
                </div>
            </div>
        </section>
    );
}
