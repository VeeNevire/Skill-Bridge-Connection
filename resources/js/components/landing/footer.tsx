import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { brand, footer } from '@/data/landing';
import { FadeUp } from './blur-text';
import { InstagramIcon, LogoMark, TikTokIcon, XLogoIcon } from './icons';
import legal from '@/routes/legal';

const socials = [
    { label: 'Instagram', icon: InstagramIcon },
    { label: 'X', icon: XLogoIcon },
    { label: 'TikTok', icon: TikTokIcon },
];

export function Footer() {
    return (
        <footer className="px-4 pt-8 pb-4">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl 3xl:max-w-7xl border border-black/5 bg-white">
                <div className="grid gap-10 px-6 pt-14 sm:px-10 sm:pt-16 lg:grid-cols-[1fr_auto] lg:gap-16">
                    <FadeUp className="max-w-xs">
                        <a href="#" className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight">
                            <LogoMark className="size-5 text-brand" />
                            {brand.name}
                        </a>
                        <p className="mt-4 text-[13px] leading-relaxed text-black/55">{footer.tagline}</p>
                        <div className="mt-5 flex gap-2">
                            {socials.map(({ label, icon: Icon }) => (
                                <motion.a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    whileHover={{ y: -3, scale: 1.08 }}
                                    className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-ink transition-colors hover:bg-zinc-200"
                                >
                                    <Icon className="size-4" />
                                </motion.a>
                            ))}
                        </div>
                    </FadeUp>

                    <div className="grid grid-cols-2 gap-x-14 gap-y-8 sm:grid-cols-3">
                        {footer.columns.map((col, i) => (
                            <FadeUp key={col.title} delay={0.08 * i}>
                                <div className="text-[13px] font-semibold">{col.title}</div>
                                <ul className="mt-3 space-y-2">
                                    {col.links.map((link) => (
                                        <li key={link}>
                                            <a href="#" className="text-[13px] whitespace-nowrap text-black/45 transition-colors hover:text-black">
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </FadeUp>
                        ))}
                    </div>
                </div>

                <div className="mx-6 mt-12 mb-6 flex flex-col gap-2 border-t border-black/5 pt-5 text-[12px] text-black/40 sm:mx-10 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        © {new Date().getFullYear()} {brand.fullName}. Seluruh hak cipta dilindungi.
                    </span>
                    <div className="flex gap-5">
                        <Link href={legal.privacy()} className="transition-colors hover:text-black">
                            Kebijakan Privasi
                        </Link>
                        <Link href={legal.terms()} className="transition-colors hover:text-black">
                            Syarat Penggunaan
                        </Link>
                    </div>
                </div>
                <p className="mx-6 mb-6 -mt-2 text-[11px] leading-relaxed text-black/35 sm:mx-10">{footer.disclaimer}</p>
            </div>
        </footer>
    );
}
