import { CalendarClock } from 'lucide-react';
import { useEffect, useState } from 'react';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
});

export function DashboardClock() {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        const update = () => setNow(new Date());
        update();
        const timer = window.setInterval(update, 1000);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <div className="order-last flex h-10 w-full items-center gap-2.5 rounded-xl border border-black/5 bg-white px-3 xl:order-none xl:w-auto xl:shrink-0">
            <CalendarClock
                aria-hidden="true"
                className="size-4 shrink-0 text-brand/70"
            />
            <time
                dateTime={now?.toISOString()}
                title={
                    now
                        ? `${dateFormatter.format(now)}, ${timeFormatter.format(now)} WIB`
                        : undefined
                }
                className="flex min-w-0 flex-1 items-center justify-between gap-3 xl:flex-col xl:items-start xl:gap-0.5"
            >
                <span className="min-w-0 truncate text-[11px] leading-tight text-black/45">
                    {now ? dateFormatter.format(now) : 'Memuat waktu…'}
                </span>
                <span className="shrink-0 text-[12px] leading-tight font-medium whitespace-nowrap text-black/70 tabular-nums">
                    {now ? `${timeFormatter.format(now)} WIB` : '— WIB'}
                </span>
            </time>
        </div>
    );
}
