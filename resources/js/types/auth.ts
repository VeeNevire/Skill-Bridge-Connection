export type UserRole = 'admin' | 'peserta' | 'mentor' | 'mitra' | 'perusahaan';

export type RoleRef = { id: number; name: UserRole; label: string };

export type User = {
    id: number;
    name: string;
    email: string;
    roles: RoleRef[];
    avatar?: string;
    completed_tours?: string[] | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
};

export type Auth = {
    user: User;
};
