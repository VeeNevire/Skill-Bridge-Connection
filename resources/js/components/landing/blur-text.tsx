import { motion } from 'motion/react';
import type { ElementType } from 'react';
import { cn } from '@/lib/utils';

export const easeOut = [0.22, 1, 0.36, 1] as const;

type BlurTextProps = {
    text: string;
    as?: ElementType;
    className?: string;
    delay?: number;
    stagger?: number;
    /** Animate on mount instead of when scrolled into view. */
    immediate?: boolean;
};

/**
 * Reveals text word by word, each word going from blurred and lowered to sharp.
 */
export function BlurText({ text, as: Tag = 'h2', className, delay = 0, stagger = 0.08, immediate = false }: BlurTextProps) {
    const words = text.split(' ');
    const trigger = immediate ? { animate: 'visible' } : { whileInView: 'visible', viewport: { once: true, amount: 0.6 } };

    return (
        <Tag className={cn('text-balance', className)} aria-label={text}>
            <motion.span
                aria-hidden
                initial="hidden"
                {...trigger}
                transition={{ staggerChildren: stagger, delayChildren: delay }}
                className="inline"
            >
                {words.map((word, i) => (
                    <motion.span
                        key={`${word}-${i}`}
                        className="inline-block whitespace-pre"
                        variants={{
                            hidden: { opacity: 0, y: 18, filter: 'blur(10px)' },
                            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: easeOut } },
                        }}
                    >
                        {word}
                        {i < words.length - 1 ? ' ' : ''}
                    </motion.span>
                ))}
            </motion.span>
        </Tag>
    );
}

export function FadeUp({
    children,
    className,
    delay = 0,
    immediate = false,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    immediate?: boolean;
}) {
    const trigger = immediate ? { animate: { opacity: 1, y: 0, filter: 'blur(0px)' } } : { whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' }, viewport: { once: true, amount: 0.5 } };

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            {...trigger}
            transition={{ duration: 0.7, delay, ease: easeOut }}
        >
            {children}
        </motion.div>
    );
}
