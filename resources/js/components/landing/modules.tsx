import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { modules } from '@/data/landing';
import { BlurText, easeOut, FadeUp } from './blur-text';
import { GearsIcon, ModuleIcon } from './icons';

const offsets = [-2, -1, 0, 1, 2];

function slot(offset: number) {
    const abs = Math.abs(offset);

    return {
        x: offset * 175,
        y: abs === 0 ? 0 : abs === 1 ? 26 : 92,
        rotate: offset * 11,
        scale: abs === 0 ? 1 : 0.94,
        opacity: abs === 2 ? 0.85 : 1,
    };
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

export function Modules() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const items = modules.items;
    const current = items[mod(active, items.length)];

    useEffect(() => {
        if (paused) {
            return;
        }

        const id = setInterval(() => setActive((a) => a + 1), 1800);

        return () => clearInterval(id);
    }, [paused]);

    return (
        <section id="modul" className="px-4 py-16 sm:py-24">
            <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: easeOut }}
                className="mx-auto max-w-5xl overflow-hidden rounded-3xl 2xl:max-w-6xl 2xl:pt-20 2xl:pb-20 border border-black/5 bg-white px-4 pt-12 pb-14 sm:pt-16"
            >
                <FadeUp className="mx-auto mb-5 flex size-10 items-center justify-center rounded-xl bg-[#F04438]/10 text-cta">
                    <GearsIcon className="size-5" />
                </FadeUp>
                <BlurText
                    text={modules.title}
                    className="mx-auto max-w-lg text-center text-3xl leading-[1.1] font-semibold tracking-[-0.03em] sm:text-4xl 2xl:max-w-2xl 2xl:text-5xl"
                />

                <div
                    className="relative mx-auto mt-12 h-56 w-full max-w-3xl scale-[0.55] sm:mt-14 sm:scale-100 2xl:mt-20 2xl:mb-8 2xl:scale-[1.15]"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    <AnimatePresence initial={false}>
                        {offsets.map((offset) => {
                            const key = active + offset;
                            const item = items[mod(key, items.length)];

                            return (
                                <motion.button
                                    type="button"
                                    key={key}
                                    aria-label={item.name}
                                    onClick={() => setActive((a) => a + offset)}
                                    initial={{ ...slot(offset + 1), opacity: 0 }}
                                    animate={slot(offset)}
                                    exit={{ ...slot(offset - 1), opacity: 0 }}
                                    whileHover={{ scale: 1.08 }}
                                    transition={{ type: 'spring', stiffness: 170, damping: 22 }}
                                    className="absolute top-0 left-1/2 -ml-11 flex size-22 cursor-pointer items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_-14px_rgba(0,0,0,0.3)]"
                                    style={{ backgroundColor: `${item.color}1a`, color: item.color }}
                                >
                                    <ModuleIcon name={item.key} className="size-10" strokeWidth={1.7} />
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>

                    <div className="absolute inset-x-0 top-28 origin-top scale-[1.8] text-center sm:scale-100">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.key}
                                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="text-[15px] font-semibold">{current.name}</div>
                                <div className="mt-1 text-xs text-black/45">{current.description}</div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
