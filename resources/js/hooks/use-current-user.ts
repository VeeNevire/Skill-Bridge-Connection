import { usePage } from '@inertiajs/react';
import { currentUser as sample } from '@/data/dashboard';
import type { UserRole } from '@/types';

// When an account holds several roles, the header shows the most specific one.
const rolePriority: UserRole[] = [
    'admin',
    'mitra',
    'perusahaan',
    'mentor',
    'peserta',
];

/**
 * The signed-in user from Inertia's shared `auth` prop, plus profile fields the backend does not provide yet.
 */
export function useCurrentUser() {
    const { auth, profileCompletion } = usePage().props;
    const name = auth.user?.name ?? '';

    return {
        name,
        // Skip honorifics such as "Prof." or "Dr." so the greeting uses the actual name.
        firstName:
            name.split(' ').find((part) => !part.endsWith('.')) ??
            name.split(' ')[0],
        initials: name
            .split(' ')
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join(''),
        email: auth.user?.email ?? '',
        avatar: auth.user?.avatar ?? null,
        roles: auth.user?.roles ?? [],
        role:
            rolePriority
                .map((name) => auth.user?.roles.find((r) => r.name === name))
                .find(Boolean)?.label ?? sample.role,
        profileCompletion: profileCompletion ?? 0,
    };
}
