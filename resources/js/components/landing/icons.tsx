import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    Atom,
    BellRing,
    Blocks,
    BookOpen,
    Bookmark,
    BriefcaseBusiness,
    Calendar,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Clock,
    ExternalLink,
    Eye,
    EyeOff,
    FilePen,
    FileText,
    GraduationCap,
    IdCard,
    LayoutGrid,
    Lightbulb,
    Lock,
    LogOut,
    Mail,
    Menu,
    Plus,
    Rocket,
    ScanFace,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    Star,
    User,
    Users,
    X,
} from 'lucide-react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import type { SVGProps } from 'react';
import type { ModuleKey } from '@/data/landing';

type IconProps = SVGProps<SVGSVGElement>;

const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
} as const;

// UI icons come from Lucide; the names below are the ones the app already imports.
export {
    ArrowLeft as ArrowLeftIcon,
    BellRing as BellIcon,
    Blocks as GearsIcon,
    Calendar as CalendarIcon,
    CircleCheck as CheckCircleIcon,
    Clock as ClockIcon,
    ExternalLink as ExternalIcon,
    FileText as DocumentIcon,
    LayoutGrid as GridIcon,
    Lightbulb as BulbIcon,
    Lock as LockIcon,
    LogOut as LogoutIcon,
    Mail as MailIcon,
    Menu as MenuIcon,
    Plus as PlusIcon,
    Rocket as BalloonIcon,
    ScanFace as FaceScanIcon,
    Search as SearchIcon,
    Settings as SettingsIcon,
    ShieldCheck as ShieldBoltIcon,
    Atom as SparkleIcon,
    User as UserIcon,
    Users as UsersIcon,
    X as CrossIcon,
};

export function ChevronIcon({
    direction = 'right',
    ...props
}: LucideProps & { direction?: 'left' | 'right' }) {
    const Icon = direction === 'right' ? ChevronRight : ChevronLeft;

    return <Icon {...props} />;
}

export function EyeIcon({
    off = false,
    ...props
}: LucideProps & { off?: boolean }) {
    const Icon = off ? EyeOff : Eye;

    return <Icon {...props} />;
}

export function BookmarkIcon({
    filled = false,
    ...props
}: LucideProps & { filled?: boolean }) {
    return <Bookmark fill={filled ? 'currentColor' : 'none'} {...props} />;
}

export function StarIcon(props: LucideProps) {
    return <Star fill="currentColor" strokeWidth={0} {...props} />;
}

const moduleIcons: Record<ModuleKey, LucideIcon> = {
    passport: IdCard,
    scholarship: GraduationCap,
    studio: FilePen,
    academy: BookOpen,
    career: BriefcaseBusiness,
    mentor: Users,
    copilot: Sparkles,
};

export function ModuleIcon({
    name,
    ...props
}: LucideProps & { name: ModuleKey }) {
    const Icon = moduleIcons[name];

    return <Icon {...props} />;
}

// Brand marks and decorative shapes Lucide does not provide.
export function EyesIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 32 24" {...props}>
            <ellipse
                cx="10"
                cy="12"
                rx="5.5"
                ry="7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <ellipse
                cx="22"
                cy="12"
                rx="5.5"
                ry="7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <circle cx="11.5" cy="13" r="2.4" fill="currentColor" />
            <circle cx="23.5" cy="13" r="2.4" fill="currentColor" />
        </svg>
    );
}

export function InstagramIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" {...stroke} {...props}>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
        </svg>
    );
}

export function XLogoIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
        </svg>
    );
}

export function TikTokIcon(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M16.6 3c.3 2.3 1.7 3.8 4 4v3.2c-1.5.1-2.8-.3-4-1.1v6.1c0 4.3-4.6 6.9-8.3 4.8-3.8-2.2-3.3-8.2 1.2-9.2.5-.1 1-.1 1.5 0v3.3c-.4-.1-.8-.1-1.2 0-2 .6-1.8 3.5.3 3.9 1.4.3 2.8-.7 2.9-2.2V3h3.6Z" />
        </svg>
    );
}

export function LogoMark({ className }: { className?: string }) {
    return (
        <img
            src="/brand/symbol.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className={cn('object-contain', className)}
        />
    );
}

