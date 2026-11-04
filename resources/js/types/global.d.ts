import type { AdminBadges } from '@/types/admin';
import type { Auth } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            profileCompletion: number;
            accountActivity: { title: string; time: string; href: string }[];
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            flash: { success: string | null };
            adminBadges: AdminBadges | null;
            [key: string]: unknown;
        };
    }
}
