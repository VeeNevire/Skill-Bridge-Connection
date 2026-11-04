import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect, useState } from 'react';
import { easeOut } from '@/components/landing/blur-text';
import { BookmarkIcon, CalendarIcon, CheckCircleIcon, ClockIcon, ExternalIcon, ModuleIcon } from '@/components/landing/icons';
import { courses, currentUser, deadlines, mentorSession, profileChecklist, recommendations, stats } from '@/data/dashboard';
import { cn } from '@/lib/utils';
import { Panel, PanelHeader, TextButton } from './panel';

const toneStyles = {
    brand: 'bg-brand/10 text-brand',
    cta: 'bg-cta/10 text-cta',
    sky: 'bg-sky-500/10 text-sky-600',
    emerald: 'bg-emerald-500/10 text-emerald-600',
};

const statIcons = ['studio', 'scholarship', 'academy', 'mentor'] as const;

export function CountUp({ to }: { to: number }) {
    const value = useMotionValue(0);
    const rounded = useTransform(value, (v) => Math.round(v));

    useEffect(() => {
        const controls = animate(value, to, { duration: 1.2, delay: 0.3, ease: easeOut });

        return () => controls.stop();
    }, [to, value]);

    return <motion.span>{rounded}</motion.span>;
}

export function StatCards() {
    return (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {stats.map((stat, i) => (
                <Panel key={stat.label} index={i} className="p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] text-black/50">{stat.label}</span>
                        <span className={cn('flex size-8 items-center justify-center rounded-lg', toneStyles[stat.tone])}>
                            <ModuleIcon name={statIcons[i]} className="size-4" />
                        </span>
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight">
                        <CountUp to={stat.value} />
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-black/45">{stat.delta}</p>
                </Panel>
            ))}
        </div>
    );
}

export function ProfileProgress({ index }: { index: number }) {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const pct = currentUser.profileCompletion;

    return (
        <Panel index={index}>
            <PanelHeader title="Talent Passport" subtitle="Kelengkapan profil Anda" action={<TextButton>Lengkapi</TextButton>} />
            <div className="flex items-center gap-5">
                <div className="relative size-28 shrink-0">
                    <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f4f4f5" strokeWidth="9" />
                        <motion.circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="9"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
                            transition={{ duration: 1.4, delay: 0.4, ease: easeOut }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-semibold tracking-tight">
                            <CountUp to={pct} />%
                        </span>
                        <span className="text-[10px] text-black/40">lengkap</span>
                    </div>
                </div>
                <ul className="min-w-0 flex-1 space-y-2">
                    {profileChecklist.map((item) => (
                        <li key={item.label} className="flex items-center gap-2 text-[12px]">
                            <CheckCircleIcon className={cn('size-4 shrink-0', item.done ? 'text-emerald-500' : 'text-black/20')} />
                            <span className={cn('truncate', item.done ? 'text-black/60' : 'font-medium text-ink')}>{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </Panel>
    );
}

export function Deadlines({ index }: { index: number }) {
    return (
        <Panel index={index}>
            <PanelHeader title="Tenggat terdekat" subtitle="Jangan sampai terlewat" action={<TextButton>Kalender</TextButton>} />
            <ul className="space-y-2.5">
                {deadlines.map((d, i) => {
                    const [day, month] = d.date.split(' ');
                    const urgent = d.daysLeft <= 3;

                    return (
                        <motion.li
                            key={d.title}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 + i * 0.08, ease: easeOut }}
                            className="flex items-center gap-3 rounded-xl border border-black/5 p-2.5"
                        >
                            <div className={cn('flex size-11 shrink-0 flex-col items-center justify-center rounded-lg', urgent ? 'bg-cta/10 text-cta' : 'bg-zinc-100 text-ink')}>
                                <span className="text-[15px] leading-none font-semibold">{day}</span>
                                <span className="text-[9.5px] uppercase">{month}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[12.5px] font-medium">{d.title}</p>
                                <p className="truncate text-[11px] text-black/45">{d.context}</p>
                            </div>
                            <span className={cn('shrink-0 text-[11px] font-medium', urgent ? 'text-cta' : 'text-black/45')}>{d.daysLeft} hari</span>
                        </motion.li>
                    );
                })}
            </ul>
        </Panel>
    );
}

export function Recommendations({ index }: { index: number }) {
    const [saved, setSaved] = useState<number[]>([2]);

    const toggle = (id: number) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    return (
        <Panel index={index} className="xl:col-span-2">
            <PanelHeader title="Rekomendasi beasiswa" subtitle="Berdasarkan Talent Passport Anda" action={<TextButton>Lihat semua</TextButton>} />
            <div className="grid gap-3 md:grid-cols-3">
                {recommendations.map((rec, i) => {
                    const isSaved = saved.includes(rec.id);

                    return (
                        <motion.article
                            key={rec.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: easeOut }}
                            whileHover={{ y: -3 }}
                            className="group flex flex-col rounded-xl border border-black/5 p-4 transition-shadow hover:shadow-[0_14px_30px_-18px_rgba(0,0,0,0.3)]"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10.5px] font-semibold text-brand">{rec.match}% cocok</span>
                                <motion.button
                                    type="button"
                                    aria-label={isSaved ? 'Hapus dari tersimpan' : 'Simpan beasiswa'}
                                    aria-pressed={isSaved}
                                    onClick={() => toggle(rec.id)}
                                    whileTap={{ scale: 0.8 }}
                                    className={cn('transition-colors', isSaved ? 'text-brand' : 'text-black/25 hover:text-black/50')}
                                >
                                    <motion.span key={String(isSaved)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="block">
                                        <BookmarkIcon filled={isSaved} className="size-[18px]" />
                                    </motion.span>
                                </motion.button>
                            </div>
                            <h3 className="mt-3 text-[13.5px] leading-snug font-semibold">{rec.name}</h3>
                            <p className="mt-0.5 text-[11.5px] text-black/45">{rec.organizer}</p>
                            <div className="mt-3 flex flex-wrap gap-1.5 text-[10.5px] text-black/55">
                                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5">{rec.level}</span>
                                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5">{rec.location}</span>
                                <span className="flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5">
                                    <CalendarIcon className="size-3" />
                                    {rec.deadline}
                                </span>
                            </div>
                            <p className="mt-3 text-[11.5px] leading-relaxed text-black/50">{rec.reason}</p>
                            <a href="#" className="mt-auto flex items-center gap-1 pt-3 text-[12px] font-medium text-ink group-hover:text-brand">
                                Lihat kanal resmi
                                <ExternalIcon className="size-3.5" />
                            </a>
                        </motion.article>
                    );
                })}
            </div>
        </Panel>
    );
}

export function Courses({ index }: { index: number }) {
    return (
        <Panel index={index}>
            <PanelHeader title="Skill Academy" subtitle="Lanjutkan belajar" action={<TextButton>Katalog</TextButton>} />
            <ul className="space-y-4">
                {courses.map((c, i) => (
                    <li key={c.title}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-[12.5px] font-medium">{c.title}</p>
                                <p className="text-[11px] text-black/45">
                                    {c.category} · {c.lessons}
                                </p>
                            </div>
                            <span className="text-[12px] font-semibold" style={{ color: c.color }}>
                                {c.progress}%
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: c.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${c.progress}%` }}
                                transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: easeOut }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

export function MentorCard({ index }: { index: number }) {
    return (
        <Panel index={index} className="relative overflow-hidden">
            <div className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-brand/10 blur-2xl" />
            <PanelHeader title="Sesi mentor berikutnya" action={<TextButton>Jadwal</TextButton>} />
            <div className="relative flex items-center gap-3">
                <img src={mentorSession.avatar} alt="" className="size-11 rounded-xl object-cover" />
                <div>
                    <p className="text-[13px] font-semibold">{mentorSession.mentor}</p>
                    <p className="text-[11.5px] text-black/45">{mentorSession.expertise}</p>
                </div>
            </div>
            <p className="relative mt-4 text-[12.5px] font-medium">{mentorSession.topic}</p>
            <div className="relative mt-2 flex flex-wrap gap-3 text-[11.5px] text-black/50">
                <span className="flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5" />
                    {mentorSession.date}
                </span>
                <span className="flex items-center gap-1.5">
                    <ClockIcon className="size-3.5" />
                    {mentorSession.time}
                </span>
            </div>
            <div className="relative mt-4 flex gap-2">
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 rounded-lg bg-brand py-2 text-[12.5px] font-medium text-white shadow-[0_8px_20px_-10px_rgba(139,92,246,0.8)]"
                >
                    Lihat detail
                </motion.button>
                <button type="button" className="rounded-lg border border-black/10 px-3 py-2 text-[12.5px] text-black/60 hover:bg-zinc-50">
                    Jadwal ulang
                </button>
            </div>
        </Panel>
    );
}

export function ComingSoon({ label }: { label: string }) {
    return (
        <Panel className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-[#a78bfa] to-brand text-white shadow-[0_12px_30px_-8px_rgba(139,92,246,0.6)]"
            >
                <ModuleIcon name="copilot" className="size-6" />
            </motion.div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">{label}</h2>
            <p className="mt-1.5 max-w-sm text-[13px] text-black/50">Halaman ini sedang disiapkan dan akan hadir di tahap pengembangan berikutnya.</p>
        </Panel>
    );
}
