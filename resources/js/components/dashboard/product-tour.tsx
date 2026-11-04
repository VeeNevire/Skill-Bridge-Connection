import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { easeOut } from '@/components/landing/blur-text';
import { CrossIcon } from '@/components/landing/icons';
import type { TourStep } from '@/data/tours';
import { cn } from '@/lib/utils';

const PAD = 6;
const GAP = 14;
const MARGIN = 16;
const CARD_WIDTH = 320;

type Rect = { top: number; left: number; width: number; height: number };

/** The first element with this `data-tour` value that is actually on screen (the sidebar exists twice on mobile). */
function findTarget(target?: string): HTMLElement | null {
    if (!target) return null;

    const elements = document.querySelectorAll<HTMLElement>(
        `[data-tour="${target}"]`,
    );

    for (const element of elements) {
        const rect = element.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) return element;
    }

    return null;
}

function spotlightRect(element: HTMLElement): Rect {
    const rect = element.getBoundingClientRect();

    return {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
    };
}

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), Math.max(min, max));

/** Place the card beside the highlighted element: right of it if there is room, otherwise below or above. */
function cardPosition(rect: Rect | null, height: number) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(CARD_WIDTH, vw - MARGIN * 2);

    if (!rect || vw < 640) {
        return {
            width,
            left: (vw - width) / 2,
            top: rect && rect.top + rect.height + GAP + height < vh - MARGIN
                ? rect.top + rect.height + GAP
                : rect && rect.top - GAP - height > MARGIN
                  ? rect.top - GAP - height
                  : (vh - height) / 2,
        };
    }

    if (rect.left + rect.width + GAP + width < vw - MARGIN) {
        return {
            width,
            left: rect.left + rect.width + GAP,
            top: clamp(rect.top, MARGIN, vh - height - MARGIN),
        };
    }

    const left = clamp(
        rect.left + rect.width / 2 - width / 2,
        MARGIN,
        vw - width - MARGIN,
    );
    const below = rect.top + rect.height + GAP;

    return {
        width,
        left,
        top:
            below + height < vh - MARGIN
                ? below
                : clamp(rect.top - GAP - height, MARGIN, vh - height - MARGIN),
    };
}

/**
 * Step-by-step guided tour: dims the page, highlights one element at a time and explains it.
 * `onClose(finished)` runs when the user finishes or skips; both count as "seen".
 */
export function ProductTour({
    steps: allSteps,
    onClose,
}: {
    steps: TourStep[];
    onClose: (finished: boolean) => void;
}) {
    // Optional steps point at things only some accounts have (a second role, a reviewer-only menu).
    const [steps] = useState(() =>
        allSteps.filter(
            (step) =>
                !step.optional ||
                document.querySelector(`[data-tour="${step.target}"]`),
        ),
    );
    const [index, setIndex] = useState(0);
    const [rect, setRect] = useState<Rect | null>(null);
    const [cardHeight, setCardHeight] = useState(220);
    const [, setViewport] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);
    const titleId = useId();
    const step = steps[index];
    const last = index === steps.length - 1;

    const measure = useCallback(() => {
        const element = findTarget(step?.target);

        setRect(element ? spotlightRect(element) : null);
        setViewport(window.innerWidth + window.innerHeight);
    }, [step]);

    useLayoutEffect(() => {
        findTarget(step?.target)?.scrollIntoView({ block: 'nearest' });
        measure();
    }, [measure, step]);

    useLayoutEffect(() => {
        if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
    }, [index]);

    useEffect(() => {
        nextRef.current?.focus();
    }, [index]);

    useEffect(() => {
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure, true);

        return () => {
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure, true);
        };
    }, [measure]);

    const next = useCallback(() => {
        if (last) onClose(true);
        else setIndex((i) => i + 1);
    }, [last, onClose]);
    const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

    useEffect(() => {
        const handle = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose(false);
            // The arrow never closes the tour; finishing takes a click on Selesai.
            else if (event.key === 'ArrowRight' && !last) next();
            else if (event.key === 'ArrowLeft') back();
        };

        document.addEventListener('keydown', handle);

        return () => document.removeEventListener('keydown', handle);
    }, [back, last, next, onClose]);

    if (!step) return null;

    const position = cardPosition(rect, cardHeight);

    return createPortal(
        <div className="fixed inset-0 z-[80]">
            {/* Swallows clicks so the page underneath stays put while the tour is open. */}
            <div className="absolute inset-0" />

            {rect ? (
                <motion.div
                    className="pointer-events-none absolute rounded-2xl ring-2 ring-white/80"
                    initial={false}
                    animate={rect}
                    transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                    style={{ boxShadow: '0 0 0 9999px rgba(15, 15, 18, 0.55)' }}
                />
            ) : (
                <motion.div
                    className="pointer-events-none absolute inset-0 bg-[rgba(15,15,18,0.55)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}

            <motion.div
                ref={cardRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    top: position.top,
                    left: position.left,
                }}
                transition={{ duration: 0.3, ease: easeOut }}
                style={{ width: position.width }}
                className="absolute rounded-2xl bg-white p-5 text-ink shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]"
            >
                <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-medium tracking-wide text-brand uppercase">
                        Langkah {index + 1} dari {steps.length}
                    </span>
                    <button
                        type="button"
                        aria-label="Tutup panduan"
                        onClick={() => onClose(false)}
                        className="-mt-1 -mr-1 rounded-lg p-1 text-black/40 transition-colors hover:bg-black/5 hover:text-ink"
                    >
                        <CrossIcon className="size-3.5" />
                    </button>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: easeOut }}
                    >
                        <h2
                            id={titleId}
                            className="mt-2 text-[16px] font-semibold tracking-tight"
                        >
                            {step.title}
                        </h2>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-black/60">
                            {step.body}
                        </p>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-4 flex gap-1" aria-hidden>
                    {steps.map((s, i) => (
                        <span
                            key={s.title}
                            className={cn(
                                'h-1 flex-1 rounded-full transition-colors',
                                i <= index ? 'bg-brand' : 'bg-black/10',
                            )}
                        />
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                    {!last && (
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className="text-[12.5px] text-black/45 transition-colors hover:text-ink"
                        >
                            Lewati
                        </button>
                    )}
                    <div className="ml-auto flex gap-2">
                        {index > 0 && (
                            <button
                                type="button"
                                onClick={back}
                                className="rounded-xl border border-black/10 px-3.5 py-2 text-[12.5px] font-medium transition-colors hover:bg-zinc-50"
                            >
                                Kembali
                            </button>
                        )}
                        <button
                            ref={nextRef}
                            type="button"
                            onClick={next}
                            className="rounded-xl bg-ink px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-ink/85"
                        >
                            {last ? 'Selesai' : index === 0 ? 'Mulai' : 'Lanjut'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body,
    );
}
