import type { RoleRef, UserRole } from './auth';

export type Option = { value: string; label: string };

export type PaginationLink = { url: string | null; label: string; active: boolean };

/** Laravel's length-aware paginator as serialized to JSON. */
export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
};

/** Laravel's cursor paginator as serialized to JSON. */
export type CursorPaginated<T> = {
    data: T[];
    per_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export type ReviewStatus = 'menunggu' | 'disetujui' | 'ditolak';
export type OpportunityType = 'beasiswa' | 'kelas' | 'lowongan';
export type ReportStatus = 'terbuka' | 'ditindak' | 'diabaikan';
export type ReportSeverity = 'rendah' | 'sedang' | 'tinggi';

export type AdminBadges = { verification: number; moderation: number; reports: number };

export type UserStats = { total: number; suspended: number; newThisWeek: number; roles: Record<UserRole, number> };

export type RoleOption = { value: UserRole; label: string; description: string };

export type AdminUser = { id: number; name: string; email: string; roles: RoleRef[]; suspended_at: string | null; created_at: string };

export type OrganizationRow = {
    id: number;
    name: string;
    type: 'institusi' | 'perusahaan' | 'yayasan';
    email?: string;
    website?: string | null;
    description?: string | null;
    status?: ReviewStatus;
    review_note?: string | null;
    created_at: string;
};

export type MentorRow = {
    id: number;
    expertise: string;
    years_experience: number;
    bio?: string | null;
    status?: ReviewStatus;
    review_note?: string | null;
    created_at: string;
    user: { id: number; name: string; email?: string };
};

export type OpportunityRow = {
    id: number;
    type: OpportunityType;
    title: string;
    summary?: string | null;
    details?: Record<string, string> | null;
    deadline?: string | null;
    source_url?: string | null;
    status?: ReviewStatus;
    review_note?: string | null;
    open_reports_count?: number;
    created_at: string;
    organization?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
};

export type ReportRow = {
    id: number;
    reason: string;
    details?: string | null;
    severity: ReportSeverity;
    status?: ReportStatus;
    resolution_note?: string | null;
    created_at: string;
    opportunity: { id: number; title: string; type?: OpportunityType; status?: ReviewStatus };
    reporter?: { id: number; name: string } | null;
};

export type AuditLogRow = { id: number; action: string; description: string; created_at: string; user: { id: number; name: string } | null };

export type CategoryRow = { id: number; name: string; slug: string; description: string | null; opportunities_count: number; created_at: string };

export type PlatformSettings = {
    platform_name: string;
    support_email: string;
    registration_open: boolean;
    require_moderation: boolean;
    announcement: string;
};
