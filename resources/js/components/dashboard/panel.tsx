import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { easeOut } from '@/components/landing/blur-text';
import { cn } from '@/lib/utils';

export function Panel({ children, className, index = 0 }: { children: ReactNode; className?: string; index?: number }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.1 + index * 0.07, ease: easeOut }}
            className={cn('min-w-0 rounded-2xl border border-black/5 bg-white p-5', className)}
        >
            {children}
        </motion.section>
    );
}

export function PanelHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
    return (
        <div className="mb-4 flex items-start justify-between gap-3">
            <div>
                <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
                {subtitle && <p className="mt-0.5 text-[12px] text-black/45">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

export function TextButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
    return (
        <button type="button" onClick={onClick} className="shrink-0 text-[12px] font-medium text-brand hover:underline">
            {children}
        </button>
    );
}
