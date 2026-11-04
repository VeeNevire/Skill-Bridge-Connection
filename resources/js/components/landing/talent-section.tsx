import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { useRef } from 'react';
import { talent } from '@/data/landing';
import { cn } from '@/lib/utils';
import { register } from '@/routes';
import { BlurText, FadeUp } from './blur-text';
import { UserIcon } from './icons';
import { MotionLink } from './navbar';

// Outer-left, inner-left, inner-right, outer-right. Inner columns travel further for depth.
const columnConfig = [
    { y: [260, -220], x: -160, className: 'left-[-6%] md:left-[2%]', top: 'mt-24' },
    { y: [140, -380], x: -100, className: 'hidden md:flex left-[13%]', top: 'mt-0' },
    { y: [180, -340], x: 100, className: 'hidden md:flex right-[13%]', top: 'mt-10' },
    { y: [300, -180], x: 160, className: 'right-[-6%] md:right-[2%]', top: 'mt-28' },
];

function PhotoColumn({ photos, index, progress }: { photos: string[]; index: number; progress: MotionValue<number> }) {
    const config = columnConfig[index];
    const y = useTransform(progress, [0, 1], config.y);
    const x = useTransform(progress, [0, 0.3], [config.x, 0]);
    const opacity = useTransform(progress, [0, 0.25], [0, 1]);

    return (
        <motion.div
            style={{ y, x, opacity }}
            className={cn('absolute top-0 flex w-[26%] max-w-36 flex-col gap-4 sm:w-[18%] md:w-[11%] 2xl:max-w-44 2xl:gap-5 3xl:max-w-52', config.className, config.top)}
        >
            {photos.map((src, i) => (
                <motion.div
                    key={src}
                    whileHover={{ scale: 1.06, rotate: index < 2 ? -3 : 3, zIndex: 10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="aspect-[4/5] overflow-hidden rounded-2xl border-[3px] border-white bg-zinc-200 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.35)]"
                    style={{ rotate: (i % 2 ? 1 : -1) * (index + 1) * 0.6 }}
                >
                    <img src={src} alt="" loading="lazy" className="size-full object-cover" />
                </motion.div>
            ))}
        </motion.div>
    );
}

export function TalentSection() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

    return (
        <section id="passport" ref={ref} className="relative h-[170vh]">
            <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
                {talent.columns.map((photos, i) => (
                    <PhotoColumn key={i} photos={photos} index={i} progress={progress} />
                ))}

                <div className="relative z-10 mx-auto max-w-xs px-4 text-center sm:max-w-sm 2xl:max-w-lg">
                    <FadeUp className="mx-auto mb-5 flex size-12 items-center justify-center rounded-xl bg-white text-brand shadow-[0_6px_16px_-6px_rgba(0,0,0,0.15)]">
                        <UserIcon className="size-5" />
                    </FadeUp>
                    <BlurText text={talent.title} className="text-4xl leading-[1.05] font-semibold tracking-[-0.035em] sm:text-5xl 2xl:text-6xl" />
                    <FadeUp delay={0.3}>
                        <p className="mt-4 text-[14px] leading-relaxed text-black/50 2xl:text-[16px]">{talent.subtitle}</p>
                    </FadeUp>
                    <FadeUp delay={0.45}>
                        <MotionLink
                            href={register()}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="mt-6 inline-flex rounded-lg bg-brand px-8 py-2.5 text-sm font-medium text-white shadow-[0_8px_20px_-8px_rgba(139,92,246,0.7)]"
                        >
                            {talent.cta}
                        </MotionLink>
                    </FadeUp>
                </div>
            </div>
        </section>
    );
}
