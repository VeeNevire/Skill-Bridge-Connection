import { AnimatePresence, motion, useAnimate, useInView } from 'motion/react';
import { useEffect, useState } from 'react';
import { testimonials } from '@/data/landing';
import { BlurText, easeOut, FadeUp } from './blur-text';
import { ChevronIcon, StarIcon } from './icons';

function Envelope() {
    return (
        <div className="envelope pointer-events-none absolute bottom-0 left-1/2 h-44 w-[300px] -translate-x-1/2">
            <svg viewBox="0 0 300 176" className="absolute inset-0 size-full overflow-visible">
                <path d="M0 26 L128 104 L0 176Z" fill="#8b5cf6" />
                <path d="M300 26 L172 104 L300 176Z" fill="#7c3aed" />
                <path d="M0 176 L150 84 L300 176Z" fill="#fff" />
                <path d="M0 176 L150 84 L300 176" fill="none" stroke="rgba(0,0,0,0.05)" />
            </svg>
        </div>
    );
}

export function Testimonials() {
    const [scope, animate] = useAnimate();
    const inView = useInView(scope, { once: true, amount: 0.55 });
    const [[index, direction], setState] = useState<[number, number]>([0, 0]);
    const [opened, setOpened] = useState(false);
    const items = testimonials.items;
    const item = items[index];

    useEffect(() => {
        if (!inView) {
            return;
        }

        const run = async () => {
            await animate('.env-card', { y: [150, 70] }, { duration: 0.7, ease: easeOut });
            await animate([
                ['.env-card', { y: 0, rotate: [-3, 0] }, { duration: 0.8, ease: easeOut }],
                ['.envelope', { y: 260, opacity: 0 }, { duration: 0.8, ease: [0.55, 0, 0.75, 0.2], at: '<' }],
                ['.ghost', { opacity: 1, scale: 1 }, { duration: 0.7, ease: easeOut, at: '-0.4' }],
                ['.carousel-nav', { opacity: 1, y: 0 }, { duration: 0.5, at: '-0.3' }],
            ]);
            setOpened(true);
        };

        void run();
    }, [inView, animate]);

    const paginate = (dir: number) => {
        if (!opened) {
            return;
        }

        setState(([i]) => [(i + dir + items.length) % items.length, dir]);
    };

    return (
        <section id="testimoni" className="overflow-hidden px-4 py-24 sm:py-32">
            <div className="mx-auto max-w-xl text-center">
                <BlurText text={testimonials.title} className="text-4xl leading-[1.05] font-semibold tracking-[-0.035em] sm:text-6xl 2xl:text-7xl" />
                <FadeUp delay={0.3}>
                    <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-black/50">{testimonials.subtitle}</p>
                </FadeUp>
            </div>

            <div ref={scope} className="relative mx-auto mt-10 h-[430px] max-w-4xl 2xl:mt-16 2xl:mb-16 2xl:origin-top 2xl:scale-[1.15]">
                <div
                    className="ghost absolute top-6 left-[-8%] h-80 w-64 -rotate-[14deg] rounded-3xl bg-gradient-to-br from-white to-white/30 opacity-0 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.25)] sm:left-[4%]"
                    style={{ transform: 'scale(0.85)' }}
                />
                <div
                    className="ghost absolute top-6 right-[-8%] h-80 w-64 rotate-[14deg] rounded-3xl bg-gradient-to-bl from-white to-white/30 opacity-0 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.25)] sm:right-[4%]"
                    style={{ transform: 'scale(0.85)' }}
                />

                <div className="envelope absolute bottom-0 left-1/2 h-44 w-[300px] -translate-x-1/2 rounded-md bg-[#ede9fe]" />

                <div className="env-card absolute top-4 left-1/2 w-[250px] -ml-[125px]" style={{ transform: 'translateY(150px)' }}>
                <motion.div
                    className="cursor-grab active:cursor-grabbing"
                    drag={opened ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.4}
                    onDragEnd={(_, info) => {
                        if (info.offset.x < -60) {
                            paginate(1);
                        } else if (info.offset.x > 60) {
                            paginate(-1);
                        }
                    }}
                >
                    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                        <motion.figure
                            key={index}
                            custom={direction}
                            variants={{
                                enter: (d: number) => ({ x: d * 120, rotate: d * 8, opacity: 0 }),
                                center: { x: 0, rotate: 0, opacity: 1 },
                                exit: (d: number) => ({ x: d * -120, rotate: d * -8, opacity: 0 }),
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                            className="rounded-2xl border border-black/5 bg-white px-5 pt-6 pb-6 text-center shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)] select-none"
                        >
                            <img src={item.avatar} alt="" draggable={false} className="mx-auto size-11 rounded-xl object-cover" />
                            <figcaption className="mt-3">
                                <div className="text-[15px] font-semibold">{item.name}</div>
                                <div className="text-[11px] text-black/45">{item.role}</div>
                            </figcaption>
                            <div className="mt-3 flex items-center justify-center gap-0.5 text-[#FACC15]">
                                {Array.from({ length: item.rating }).map((_, i) => (
                                    <StarIcon key={i} className="size-3.5" />
                                ))}
                                <span className="ml-1 text-[11px] font-medium text-black/70">{item.rating.toFixed(1)}</span>
                            </div>
                            <blockquote className="mt-3 text-[12px] leading-relaxed text-black/55">{item.quote}</blockquote>
                        </motion.figure>
                    </AnimatePresence>
                </motion.div>
                </div>

                <Envelope />

                <div className="carousel-nav absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2 opacity-0" style={{ transform: 'translateY(8px)' }}>
                    {[-1, 1].map((dir) => (
                        <motion.button
                            key={dir}
                            type="button"
                            aria-label={dir < 0 ? 'Sebelumnya' : 'Berikutnya'}
                            onClick={() => paginate(dir)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex size-9 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm"
                        >
                            <ChevronIcon direction={dir < 0 ? 'left' : 'right'} className="size-4" />
                        </motion.button>
                    ))}
                </div>
            </div>
        </section>
    );
}
