import { AnimatePresence, motion, useAnimate, useInView } from 'motion/react';
import { useEffect, useState } from 'react';
import { testimonials } from '@/data/landing';
import { cn } from '@/lib/utils';
import { BlurText, easeOut, FadeUp } from './blur-text';
import { ChevronIcon, StarIcon } from './icons';

/** Front of the envelope: side and bottom folds, drawn over the cards so they look tucked inside. */
function Envelope() {
    return (
        <div className="envelope pointer-events-none absolute bottom-0 left-1/2 z-20 h-44 w-[300px] -translate-x-1/2">
            <svg viewBox="0 0 300 176" className="absolute inset-0 size-full overflow-visible">
                <path d="M0 26 L128 104 L0 176Z" fill="#8b5cf6" />
                <path d="M300 26 L172 104 L300 176Z" fill="#7c3aed" />
                <path d="M0 176 L150 84 L300 176Z" fill="#fff" />
                <path d="M0 176 L150 84 L300 176" fill="none" stroke="rgba(0,0,0,0.05)" />
            </svg>
        </div>
    );
}

/**
 * Top fold, hinged on the envelope's upper edge. It starts closed in front of everything;
 * flipping scaleY to -1 opens it upward, then it drops behind the cards.
 */
function EnvelopeFlap() {
    return (
        <div className="envelope env-flap pointer-events-none absolute bottom-0 left-1/2 z-30 h-[150px] w-[300px] origin-top -translate-x-1/2">
            <svg viewBox="0 0 300 150" className="absolute inset-0 size-full overflow-visible">
                <path d="M0 0 L150 96 L300 0Z" fill="#a78bfa" />
                <path d="M0 0 L150 96 L300 0" fill="none" stroke="rgba(0,0,0,0.06)" />
                <circle cx="150" cy="88" r="11" fill="#f04438" />
                <circle cx="150" cy="88" r="5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            </svg>
        </div>
    );
}

type Testimonial = (typeof testimonials.items)[number];

/** Tilted preview of the previous or next story; clicking it brings that story to the front. */
function PeekCard({ side, item, onClick }: { side: 'left' | 'right'; item: Testimonial; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`Lihat cerita ${item.name}`}
            className={cn(
                'group absolute top-12 z-10 w-56 rounded-3xl border border-black/5 bg-white/80 p-5 text-left opacity-0 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-colors hover:bg-white',
                side === 'left' ? 'peek-left left-[-14%] sm:left-[5%]' : 'peek-right right-[-14%] sm:right-[5%]',
            )}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: easeOut }}
                    className="opacity-55 transition-opacity duration-300 group-hover:opacity-100"
                >
                    <div className="flex items-center gap-2.5">
                        <img src={item.avatar} alt="" draggable={false} className="size-9 rounded-xl object-cover" />
                        <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold">{item.name}</div>
                            <div className="truncate text-[10.5px] text-black/45">{item.role}</div>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-0.5 text-[#FACC15]">
                        {Array.from({ length: item.rating }).map((_, i) => (
                            <StarIcon key={i} className="size-3" />
                        ))}
                    </div>
                    <p className="mt-2 line-clamp-4 text-[11.5px] leading-relaxed text-black/50">{item.quote}</p>
                </motion.div>
            </AnimatePresence>
        </button>
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

        // Closed envelope -> flap opens -> all three cards rise out stacked -> they fan out and the envelope drops away.
        const run = async () => {
            await animate([
                ['.env-flap', { scaleY: [1, -1] }, { duration: 0.6, ease: [0.65, 0, 0.35, 1], delay: 0.2 }],
                ['.env-flap', { zIndex: 5 }, { duration: 0 }],
                ['.env-card', { y: [170, 40], opacity: [0, 1] }, { duration: 0.7, ease: easeOut, opacity: { duration: 0.25 } }],
                ['.peek-left', { x: ['125%', '125%'], y: [170, 60], scale: [0.8, 0.85], rotate: [0, -4], opacity: [0, 1] }, { duration: 0.7, ease: easeOut, opacity: { duration: 0.25 }, at: '<' }],
                ['.peek-right', { x: ['-125%', '-125%'], y: [170, 60], scale: [0.8, 0.85], rotate: [0, 4], opacity: [0, 1] }, { duration: 0.7, ease: easeOut, opacity: { duration: 0.25 }, at: '<' }],
            ]);
            await animate([
                ['.env-card', { y: 0 }, { type: 'spring', stiffness: 160, damping: 20 }],
                ['.peek-left', { x: '0%', y: 0, scale: 1, rotate: -10 }, { type: 'spring', stiffness: 120, damping: 17, at: '<' }],
                ['.peek-right', { x: '0%', y: 0, scale: 1, rotate: 10 }, { type: 'spring', stiffness: 120, damping: 17, at: '<' }],
                ['.envelope', { y: 260, opacity: 0 }, { duration: 0.8, ease: [0.55, 0, 0.75, 0.2], at: '<' }],
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
                {/* Soft brand glow behind the stack so the cards sit on something. */}
                <div className="pointer-events-none absolute top-1/2 left-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.14),transparent)]" />

                <PeekCard side="left" item={items[(index - 1 + items.length) % items.length]} onClick={() => paginate(-1)} />
                <PeekCard side="right" item={items[(index + 1) % items.length]} onClick={() => paginate(1)} />

                {/* Inside of the envelope, behind the cards. */}
                <div className="envelope absolute bottom-0 left-1/2 h-[150px] w-[300px] -translate-x-1/2 rounded-md bg-[#ede9fe]" />

                <div className="env-card absolute top-4 left-1/2 z-10 w-[250px] -ml-[125px] opacity-0" style={{ transform: 'translateY(170px)' }}>
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
                <EnvelopeFlap />

                <div className="carousel-nav absolute bottom-0 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 opacity-0" style={{ transform: 'translateY(8px)' }}>
                    {[-1, 1].map((dir) => (
                        <motion.button
                            key={dir}
                            type="button"
                            aria-label={dir < 0 ? 'Sebelumnya' : 'Berikutnya'}
                            onClick={() => paginate(dir)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={cn('flex size-9 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm', dir > 0 && 'order-2')}
                        >
                            <ChevronIcon direction={dir < 0 ? 'left' : 'right'} className="size-4" />
                        </motion.button>
                    ))}
                    <div className="order-1 flex items-center gap-1.5" aria-hidden="true">
                        {items.map((t, i) => (
                            <span
                                key={t.name}
                                className={cn('h-1.5 rounded-full transition-all duration-300', i === index ? 'w-5 bg-brand' : 'w-1.5 bg-black/15')}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
