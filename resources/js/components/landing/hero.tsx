import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { hero } from '@/data/landing';
import { cn } from '@/lib/utils';
import { register } from '@/routes';
import { BlurText, easeOut, FadeUp } from './blur-text';
import { BalloonIcon, BulbIcon, CheckCircleIcon, CrossIcon, EyesIcon, FaceScanIcon, ShieldBoltIcon, SparkleIcon } from './icons';
import { MotionLink } from './navbar';

const morphIcons = [FaceScanIcon, CrossIcon, SparkleIcon, CheckCircleIcon];

// Network geometry in a 1000x260 coordinate space; every path starts at the hub so it draws outward.
const VIEW = { w: 1000, h: 260 };
const HUB = { x: 500, y: 130 };
const lines = [
    { d: 'M500 130 H40', dot: { x: 330, y: 70 } },
    { d: 'M500 130 H360 L320 70 H190', dot: { x: 280, y: 70 } },
    { d: 'M500 130 H380 L340 180 H245', dot: { x: 300, y: 180 } },
    { d: 'M500 130 H960', dot: null },
    { d: 'M500 130 H640 L680 70 H800', dot: { x: 720, y: 70 } },
    { d: 'M500 130 H660 L700 180 H790', dot: { x: 740, y: 180 } },
];

type Satellite = {
    x: number;
    y: number;
    size: number;
    className: string;
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
    image?: string;
};

const satellites: Satellite[] = [
    { x: 40, y: 130, size: 9, className: 'rounded-2xl', image: hero.avatars[0] },
    { x: 170, y: 70, size: 6, className: 'rounded-xl bg-[#FDE047] text-[#7a5d00]', icon: BulbIcon },
    { x: 228, y: 182, size: 7, className: 'rounded-xl bg-[#38BDF8] text-white', icon: BalloonIcon },
    { x: 820, y: 70, size: 7.5, className: 'rounded-xl bg-[#F04438] text-white', icon: ShieldBoltIcon },
    { x: 810, y: 182, size: 5.5, className: 'rounded-xl', image: hero.avatars[1] },
    { x: 962, y: 130, size: 9, className: 'rounded-2xl bg-white text-ink border border-black/5', icon: EyesIcon },
];

function MorphingHub({ onReplay }: { onReplay: () => void }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setIndex((i) => {
                if (i >= morphIcons.length - 1) {
                    clearInterval(id);

                    return i;
                }

                return i + 1;
            });
        }, 420);

        return () => clearInterval(id);
    }, []);

    const Icon = morphIcons[index];

    return (
        <motion.button
            type="button"
            onClick={onReplay}
            aria-label="Putar ulang animasi"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.06, rotate: -4 }}
            whileTap={{ scale: 0.9, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="absolute flex aspect-square cursor-pointer w-[10%] min-w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28%] bg-gradient-to-b from-[#a78bfa] to-brand text-white shadow-[0_12px_30px_-6px_rgba(139,92,246,0.6),inset_0_2px_0_rgba(255,255,255,0.35)]"
            style={{ left: `${(HUB.x / VIEW.w) * 100}%`, top: `${(HUB.y / VIEW.h) * 100}%` }}
        >
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={index}
                    initial={{ rotate: -90, scale: 0.4, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ rotate: 0, scale: 1, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ rotate: 90, scale: 0.4, opacity: 0, filter: 'blur(4px)' }}
                    transition={{ duration: 0.35, ease: easeOut }}
                    className="flex w-1/2"
                >
                    <Icon className="size-full" strokeWidth={1.8} />
                </motion.span>
            </AnimatePresence>
        </motion.button>
    );
}

/** Clicking the hub remounts the scene, which replays every entrance animation. */
function Network() {
    const [run, setRun] = useState(0);

    return <NetworkScene key={run} onReplay={() => setRun((r) => r + 1)} />;
}

function NetworkScene({ onReplay }: { onReplay: () => void }) {
    return (
        <div className="relative mx-auto aspect-[1000/260] w-full max-w-[1000px] 2xl:max-w-[1200px] 3xl:max-w-[1400px]">
            <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="absolute inset-0 size-full overflow-visible" fill="none">
                {lines.map((line, i) => (
                    <motion.path
                        key={line.d}
                        d={line.d}
                        stroke="#e4e4e7"
                        strokeWidth={1.5}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.9, delay: 0.55 + i * 0.05, ease: easeOut }}
                    />
                ))}
                {lines.map(
                    (line, i) =>
                        line.dot && (
                            <motion.circle
                                key={`dot-${i}`}
                                r={3}
                                fill="#8b5cf6"
                                initial={{ opacity: 0, cx: HUB.x, cy: HUB.y }}
                                animate={{ opacity: [0, 1, 1, 0.4, 1], cx: line.dot.x, cy: line.dot.y }}
                                transition={{
                                    cx: { duration: 0.9, delay: 0.9 + i * 0.08, ease: easeOut },
                                    cy: { duration: 0.9, delay: 0.9 + i * 0.08, ease: easeOut },
                                    opacity: { duration: 3, delay: 0.9 + i * 0.08, repeat: Infinity, repeatType: 'mirror' },
                                }}
                            />
                        ),
                )}
            </svg>

            {satellites.map((s, i) => {
                const Icon = s.icon;

                return (
                    <motion.div
                        key={`${s.x}-${s.y}`}
                        initial={{ opacity: 0, scale: 0.5, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.6, delay: 0.9 + i * 0.08, ease: easeOut }}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${(s.x / VIEW.w) * 100}%`, top: `${(s.y / VIEW.h) * 100}%`, width: `${s.size}%` }}
                    >
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                            whileHover={{ scale: 1.12, rotate: i % 2 ? 6 : -6 }}
                            className={cn(
                                'flex aspect-square w-full items-center justify-center overflow-hidden shadow-[0_8px_20px_-6px_rgba(0,0,0,0.25)]',
                                s.className,
                            )}
                        >
                            {s.image ? (
                                <img src={s.image} alt="" className="size-full object-cover" />
                            ) : (
                                Icon && <Icon className="w-1/2" />
                            )}
                        </motion.div>
                    </motion.div>
                );
            })}

            <MorphingHub onReplay={onReplay} />
        </div>
    );
}

export function Hero() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const networkY = useTransform(scrollYProgress, [0, 1], [0, -120]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

    return (
        <section ref={ref} className="relative overflow-hidden bg-white pt-28 pb-24 sm:pt-32 sm:pb-32 lg:flex lg:min-h-svh lg:flex-col lg:justify-center 2xl:pt-36">
            <motion.div style={{ opacity: contentOpacity, scale: contentScale }} className="px-4">
                <motion.div style={{ y: networkY }}>
                    <motion.div initial={{ y: 70 }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.5, ease: easeOut }}>
                        <Network />
                    </motion.div>
                </motion.div>

                <div className="mx-auto mt-6 max-w-2xl text-center sm:mt-8 2xl:mt-10 2xl:max-w-4xl">
                    <BlurText
                        as="h1"
                        immediate
                        delay={0.9}
                        text={hero.title}
                        className="text-4xl leading-[1.05] font-semibold tracking-[-0.035em] sm:text-6xl 2xl:text-7xl 3xl:text-8xl"
                    />
                    <FadeUp immediate delay={1.6}>
                        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-black/50 2xl:mt-6 2xl:max-w-xl 2xl:text-[18px]">{hero.subtitle}</p>
                    </FadeUp>
                    <FadeUp immediate delay={1.8}>
                        <MotionLink
                            href={register()}
                            whileHover={{ scale: 1.04, boxShadow: '0 12px 24px -8px rgba(240,68,56,0.6)' }}
                            whileTap={{ scale: 0.97 }}
                            className="mt-7 inline-flex rounded-lg bg-cta px-7 py-2.5 text-sm font-medium 2xl:mt-9 2xl:px-9 2xl:py-3 2xl:text-base text-white shadow-[0_6px_16px_-6px_rgba(240,68,56,0.5)]"
                        >
                            {hero.cta}
                        </MotionLink>
                    </FadeUp>
                </div>
            </motion.div>
        </section>
    );
}
