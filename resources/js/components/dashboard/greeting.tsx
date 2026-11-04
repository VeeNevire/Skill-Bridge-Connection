import { CalendarClock, CalendarDays, Moon, Sun, Sunrise, Sunset, UserRoundCheck, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { BlurText, easeOut, FadeUp } from '@/components/landing/blur-text';
import { deadlines, mentorSession } from '@/data/dashboard';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';

type Period = { label: string; message: string; icon: LucideIcon; tile: string; spin: boolean };

function periodOf(hour: number): Period {
    if (hour >= 4 && hour < 11) {
        return { label: 'Selamat pagi', message: 'Awali hari dengan satu langkah kecil menuju peluangmu.', icon: Sunrise, tile: 'from-amber-300 to-orange-400', spin: false };
    }

    if (hour >= 11 && hour < 15) {
        return { label: 'Selamat siang', message: 'Sedikit progres siang ini, besar dampaknya nanti.', icon: Sun, tile: 'from-yellow-300 to-amber-400', spin: true };
    }

    if (hour >= 15 && hour < 18) {
        return { label: 'Selamat sore', message: 'Sempatkan cek checklist sebelum hari berakhir.', icon: Sunset, tile: 'from-orange-300 to-rose-400', spin: false };
    }

    return { label: 'Selamat malam', message: 'Tinjau progres hari ini, lalu istirahat yang cukup.', icon: Moon, tile: 'from-indigo-400 to-brand', spin: false };
}

export function Chip({ icon: Icon, children, className, delay }: { icon: LucideIcon; children: React.ReactNode; className: string; delay: number }) {
    return (
        <motion.span
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay, ease: easeOut }}
            whileHover={{ y: -2 }}
            className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium', className)}
        >
            <Icon className="size-3.5" />
            {children}
        </motion.span>
    );
}

/** Chips for the participant overview: deadlines, next mentor session and profile completion. */
export function ParticipantChips() {
    const currentUser = useCurrentUser();
    const dueThisWeek = deadlines.filter((d) => d.daysLeft <= 7).length;

    return (
        <>
            <Chip icon={CalendarClock} delay={0.45} className="border-cta/15 bg-cta/[0.06] text-cta">
                {dueThisWeek} tenggat minggu ini
            </Chip>
            <Chip icon={Users} delay={0.53} className="border-brand/15 bg-brand/[0.06] text-brand-dark">
                Sesi mentor {mentorSession.date.split(',')[0]}, {mentorSession.time.split(' ')[0]}
            </Chip>
            <Chip icon={UserRoundCheck} delay={0.61} className="border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-700">
                Profil {currentUser.profileCompletion}% lengkap
            </Chip>
        </>
    );
}

export function Greeting({ message, children }: { message?: string; children?: React.ReactNode }) {
    const currentUser = useCurrentUser();
    const now = new Date();
    const period = periodOf(now.getHours());
    const Icon = period.icon;
    const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);

    return (
        <div className="mb-6 pt-2">
            <div className="flex items-start gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className={cn(
                        'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_12px_28px_-10px_rgba(0,0,0,0.35),inset_0_2px_0_rgba(255,255,255,0.35)] sm:size-14',
                        period.tile,
                    )}
                >
                    <motion.span
                        animate={period.spin ? { rotate: 360 } : { y: [0, -3, 0] }}
                        transition={period.spin ? { duration: 18, repeat: Infinity, ease: 'linear' } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex"
                    >
                        <Icon className="size-6 sm:size-7" strokeWidth={2} />
                    </motion.span>
                </motion.div>

                <div className="min-w-0">
                    <FadeUp immediate>
                        <p className="mb-1 flex items-center gap-1.5 text-[11.5px] font-medium tracking-wide text-black/40 uppercase">
                            <CalendarDays className="size-3.5" />
                            {today}
                        </p>
                    </FadeUp>
                    <BlurText
                        as="h1"
                        immediate
                        delay={0.1}
                        text={`${period.label}, ${currentUser.firstName}`}
                        className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
                    />
                    <FadeUp immediate delay={0.3}>
                        <p className="mt-1 text-[13.5px] text-black/50">{message ?? period.message}</p>
                    </FadeUp>
                    {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
                </div>
            </div>
        </div>
    );
}
