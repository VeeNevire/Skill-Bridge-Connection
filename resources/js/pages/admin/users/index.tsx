import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, Eye, EyeOff, Pencil, RefreshCw, Trash2, UserCheck, UserPlus, UserX, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Badge, EmptyState, formatDate, Modal, PageHeader, Pagination, RoleBadges, SearchInput, Segmented, useFilters } from '@/components/admin/ui';
import { Panel } from '@/components/dashboard/panel';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import type { AdminUser, Paginated, RoleOption, UserRole, UserStats } from '@/types';

type Filters = { q?: string; role?: string; status?: string };
type Props = { users: Paginated<AdminUser>; filters: Filters; stats: UserStats; roles: RoleOption[] };

const only = ['users', 'filters'];

function initials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('');
}

/** Checkbox list of the blueprint roles; `compact` hides the descriptions. */
function RoleCheckboxes({
    roles,
    selected,
    onToggle,
    compact = false,
}: {
    roles: RoleOption[];
    selected: UserRole[];
    onToggle: (role: UserRole) => void;
    compact?: boolean;
}) {
    return (
        <div className={compact ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            {roles.map((role) => {
                const checked = selected.includes(role.value);

                return (
                    <button
                        key={role.value}
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        title={role.description}
                        onClick={() => onToggle(role.value)}
                        className={cn(
                            'flex w-full items-start gap-3 rounded-xl border text-left transition-colors',
                            compact ? 'items-center p-2.5' : 'p-3',
                            checked ? 'border-brand/40 bg-brand/[0.04]' : 'border-black/10 hover:bg-zinc-50',
                        )}
                    >
                        <span
                            className={cn(
                                'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                                !compact && 'mt-0.5',
                                checked ? 'border-brand bg-brand text-white' : 'border-black/20',
                            )}
                        >
                            {checked && <Check className="size-3.5" />}
                        </span>
                        <span>
                            <span className="block text-[13px] font-medium">{role.label}</span>
                            {!compact && <span className="block text-[11.5px] text-black/50">{role.description}</span>}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    const bytes = crypto.getRandomValues(new Uint32Array(12));

    return Array.from(bytes, (n) => chars[n % chars.length]).join('');
}

function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="block text-[12.5px] font-medium text-black/70">
            {label}
            {children}
            {error && <span className="mt-1 block text-[11.5px] font-normal text-cta">{error}</span>}
        </label>
    );
}

const inputClass = 'mt-1.5 h-10 w-full rounded-xl border border-black/10 px-3 text-[13.5px] font-normal text-ink outline-none focus:border-brand';

/** Create an account on someone's behalf; it starts verified with the chosen roles. */
function CreateUserDialog({ roles, open, onClose }: { roles: RoleOption[]; open: boolean; onClose: () => void }) {
    const form = useForm<{ name: string; email: string; password: string; roles: UserRole[] }>({
        name: '',
        email: '',
        password: '',
        roles: ['peserta'],
    });
    const [showPassword, setShowPassword] = useState(false);

    const toggleRole = (role: UserRole) =>
        form.setData('roles', form.data.roles.includes(role) ? form.data.roles.filter((r) => r !== role) : [...form.data.roles, role]);

    const close = () => {
        form.reset();
        form.clearErrors();
        onClose();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(admin.users.store.url(), { preserveScroll: true, onSuccess: close });
    };

    const errors = form.errors as Record<string, string | undefined>;
    const rolesError = errors.roles ?? Object.entries(errors).find(([key]) => key.startsWith('roles.'))?.[1];

    return (
        <Modal open={open} onClose={close} title="Tambah pengguna">
            <form onSubmit={submit} className="space-y-3.5">
                <FormField label="Nama lengkap" error={form.errors.name}>
                    <input autoFocus value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Nama pengguna" className={inputClass} />
                </FormField>
                <FormField label="Email" error={form.errors.email}>
                    <input
                        type="email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        placeholder="nama@email.com"
                        autoComplete="off"
                        className={inputClass}
                    />
                </FormField>
                <FormField label="Kata sandi awal" error={form.errors.password}>
                    <div className="mt-1.5 flex gap-2">
                        <div className="flex h-10 flex-1 items-center rounded-xl border border-black/10 pr-2 focus-within:border-brand">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                autoComplete="new-password"
                                className="h-full w-full bg-transparent px-3 text-[13.5px] font-normal text-ink outline-none"
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                onClick={() => setShowPassword((v) => !v)}
                                className="text-black/40 hover:text-ink"
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                form.setData('password', generatePassword());
                                setShowPassword(true);
                            }}
                            className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-black/10 px-3 text-[12.5px] font-normal text-black/60 hover:bg-zinc-50 hover:text-ink"
                        >
                            <RefreshCw className="size-3.5" /> Buat acak
                        </button>
                    </div>
                    <span className="mt-1 block text-[11px] font-normal text-black/40">Bagikan kata sandi ini ke pengguna secara aman; mereka bisa menggantinya nanti.</span>
                </FormField>
                <div>
                    <p className="mb-1.5 text-[12.5px] font-medium text-black/70">Peran</p>
                    <RoleCheckboxes roles={roles} selected={form.data.roles} onToggle={toggleRole} compact />
                    {rolesError && <p className="mt-1 text-[11.5px] text-cta">{rolesError}</p>}
                </div>
                <div className="flex justify-end gap-2 pt-1">
                    <button type="button" onClick={close} className="rounded-lg px-3.5 py-2 text-[13px] text-black/60 hover:bg-zinc-100">
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing || form.data.roles.length === 0}
                        className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-white disabled:opacity-40"
                    >
                        Tambah pengguna
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/** Edit name, email and roles of one account in a single dialog. */
function EditUserDialog({ user, roles, open, onClose }: { user: AdminUser; roles: RoleOption[]; open: boolean; onClose: () => void }) {
    const form = useForm<{ name: string; email: string; roles: UserRole[] }>({
        name: user.name,
        email: user.email,
        roles: user.roles.map((r) => r.name),
    });

    const toggleRole = (role: UserRole) =>
        form.setData('roles', form.data.roles.includes(role) ? form.data.roles.filter((r) => r !== role) : [...form.data.roles, role]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.patch(admin.users.update.url(user.id), { preserveScroll: true, onSuccess: onClose });
    };

    const errors = form.errors as Record<string, string | undefined>;
    const rolesError = errors.roles ?? Object.entries(errors).find(([key]) => key.startsWith('roles.'))?.[1];

    return (
        <Modal open={open} onClose={onClose} title={`Ubah ${user.name}`}>
            <form onSubmit={submit} className="space-y-3.5">
                <FormField label="Nama lengkap" error={form.errors.name}>
                    <input autoFocus value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className={inputClass} />
                </FormField>
                <FormField label="Email" error={form.errors.email}>
                    <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} autoComplete="off" className={inputClass} />
                </FormField>
                <div>
                    <p className="mb-1.5 text-[12.5px] font-medium text-black/70">Peran</p>
                    <RoleCheckboxes roles={roles} selected={form.data.roles} onToggle={toggleRole} compact />
                    {(rolesError || form.data.roles.length === 0) && <p className="mt-1 text-[11.5px] text-cta">{rolesError ?? 'Pilih minimal satu peran.'}</p>}
                </div>
                <div className="flex justify-end gap-2 pt-1">
                    <button type="button" onClick={onClose} className="rounded-lg px-3.5 py-2 text-[13px] text-black/60 hover:bg-zinc-100">
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing || form.data.roles.length === 0}
                        className="rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-white disabled:opacity-40"
                    >
                        Simpan perubahan
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/** Asks before a consequential action; shows a server error (e.g. sole organization owner) inline. */
function ConfirmDialog({
    open,
    onClose,
    title,
    children,
    confirmLabel,
    danger,
    onConfirm,
    processing,
    error,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
    processing: boolean;
    error?: string;
}) {
    return (
        <Modal open={open} onClose={onClose} title={title}>
            <div className="space-y-2 text-[13px] leading-relaxed text-black/65">{children}</div>
            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="rounded-lg px-3.5 py-2 text-[13px] text-black/60 hover:bg-zinc-100">
                    Batal
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={processing}
                    className={cn('rounded-lg px-3.5 py-2 text-[13px] font-medium text-white disabled:opacity-50', danger ? 'bg-cta' : 'bg-ink')}
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}

function ActionButton({ icon: Icon, label, onClick, danger }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] whitespace-nowrap transition-colors',
                danger ? 'border-cta/20 text-cta hover:bg-cta/5' : 'border-black/10 text-black/65 hover:bg-zinc-50 hover:text-ink',
            )}
        >
            <Icon className="size-3.5" />
            {label}
        </button>
    );
}

/** Always-visible, labelled actions so admins do not have to discover a hidden menu. */
function RowActions({ user, roles, className }: { user: AdminUser; roles: RoleOption[]; className?: string }) {
    const me = usePage().props.auth.user;
    const [dialog, setDialog] = useState<'edit' | 'suspend' | 'delete' | null>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string>();

    if (me?.id === user.id) {
        return <span className="text-[11.5px] text-black/35">Akun Anda</span>;
    }

    const close = () => {
        setDialog(null);
        setError(undefined);
    };
    const options = {
        preserveScroll: true,
        onStart: () => setProcessing(true),
        onFinish: () => setProcessing(false),
        onSuccess: close,
        onError: (errors: Record<string, string>) => setError(Object.values(errors)[0]),
    };
    const suspended = Boolean(user.suspended_at);

    return (
        <div className={cn('flex flex-wrap justify-end gap-1.5', className)}>
            <ActionButton icon={Pencil} label="Ubah" onClick={() => setDialog('edit')} />
            <ActionButton icon={suspended ? UserCheck : UserX} label={suspended ? 'Pulihkan' : 'Tangguhkan'} onClick={() => setDialog('suspend')} />
            <ActionButton icon={Trash2} label="Hapus" danger onClick={() => setDialog('delete')} />

            <EditUserDialog key={dialog === 'edit' ? 'open' : 'closed'} user={user} roles={roles} open={dialog === 'edit'} onClose={close} />

            <ConfirmDialog
                open={dialog === 'suspend'}
                onClose={close}
                title={suspended ? 'Pulihkan akun' : 'Tangguhkan akun'}
                confirmLabel={suspended ? 'Pulihkan akun' : 'Tangguhkan akun'}
                danger={!suspended}
                processing={processing}
                error={error}
                onConfirm={() => router.patch(admin.users.update.url(user.id), { suspended: !suspended }, options)}
            >
                {suspended ? (
                    <p>
                        <span className="font-medium text-ink">{user.name}</span> akan bisa masuk dan memakai platform lagi.
                    </p>
                ) : (
                    <p>
                        <span className="font-medium text-ink">{user.name}</span> tidak akan bisa masuk sampai akunnya dipulihkan. Datanya tetap tersimpan.
                    </p>
                )}
            </ConfirmDialog>

            <ConfirmDialog
                open={dialog === 'delete'}
                onClose={close}
                title="Hapus akun permanen"
                confirmLabel="Hapus permanen"
                danger
                processing={processing}
                error={error}
                onConfirm={() => router.delete(admin.users.destroy.url(user.id), options)}
            >
                <p>
                    Akun <span className="font-medium text-ink">{user.name}</span> ({user.email}) akan dihapus beserta Talent Passport, aplikasi, dokumen, kelas, dan riwayat mentoringnya. Tindakan ini{' '}
                    <span className="font-medium text-cta">tidak dapat dibatalkan</span>.
                </p>
                <p className="text-[12px] text-black/45">Jika hanya ingin memblokir sementara, gunakan Tangguhkan.</p>
            </ConfirmDialog>
        </div>
    );
}

export default function UsersIndex({ users, filters, stats, roles }: Props) {
    const apply = useFilters(admin.users.index.url(), filters, only);
    const [creating, setCreating] = useState(false);

    return (
        <>
            <Head title="Pengguna" />
            <PageHeader
                title="Pengguna"
                subtitle={`${stats.total} akun · ${stats.roles.mentor} mentor · ${stats.roles.mitra} mitra · ${stats.roles.perusahaan} perusahaan · ${stats.suspended} ditangguhkan`}
                actions={
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setCreating(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-[13px] font-medium text-white"
                    >
                        <UserPlus className="size-4" /> Tambah pengguna
                    </motion.button>
                }
            />
            <CreateUserDialog roles={roles} open={creating} onClose={() => setCreating(false)} />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <SearchInput value={filters.q ?? ''} onSearch={(q) => apply({ q })} placeholder="Cari nama atau email…" />
                <Segmented
                    id="users-role"
                    value={filters.role ?? ''}
                    onChange={(role) => apply({ role })}
                    options={[
                        { value: '', label: 'Semua peran' },
                        ...roles.map((r) => ({ value: r.value, label: r.label })),
                    ]}
                />
                <Segmented
                    id="users-status"
                    value={filters.status ?? ''}
                    onChange={(status) => apply({ status })}
                    options={[
                        { value: '', label: 'Semua status' },
                        { value: 'aktif', label: 'Aktif' },
                        { value: 'ditangguhkan', label: 'Ditangguhkan' },
                    ]}
                />
            </div>

            <Panel>
                {users.data.length === 0 ? (
                    <EmptyState icon={Users} title="Tidak ada pengguna yang cocok" text="Coba ubah kata kunci atau filter." />
                ) : (
                    <>
                    <div className="-mx-5 hidden overflow-x-auto px-5 xl:block">
                        <table className="w-full min-w-[860px] text-left text-[13px]">
                            <thead>
                                <tr className="border-b border-black/5 text-[11.5px] text-black/45">
                                    <th className="pb-2.5 font-medium">Nama</th>
                                    <th className="pb-2.5 font-medium">Peran</th>
                                    <th className="pb-2.5 font-medium">Status</th>
                                    <th className="pb-2.5 font-medium">Bergabung</th>
                                    <th className="pb-2.5 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id} className="border-b border-black/5 last:border-0">
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={cn(
                                                        'flex size-8 shrink-0 items-center justify-center rounded-lg text-[11.5px] font-semibold',
                                                        user.suspended_at ? 'bg-zinc-100 text-black/35' : 'bg-brand/10 text-brand',
                                                    )}
                                                >
                                                    {initials(user.name)}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">{user.name}</p>
                                                    <p className="truncate text-[11.5px] text-black/45">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <RoleBadges roles={user.roles} />
                                        </td>
                                        <td className="py-3">
                                            <Badge tone={user.suspended_at ? 'red' : 'green'}>{user.suspended_at ? 'Ditangguhkan' : 'Aktif'}</Badge>
                                        </td>
                                        <td className="py-3 text-[12px] text-black/50">{formatDate(user.created_at)}</td>
                                        <td className="py-3">
                                            <RowActions user={user} roles={roles} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <ul className="divide-y divide-black/5 xl:hidden">
                        {users.data.map((user) => (
                            <li key={user.id} className="py-3.5 first:pt-0 last:pb-0">
                                <div className="flex items-start gap-3">
                                    <span
                                        className={cn(
                                            'flex size-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-semibold',
                                            user.suspended_at ? 'bg-zinc-100 text-black/35' : 'bg-brand/10 text-brand',
                                        )}
                                    >
                                        {initials(user.name)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13.5px] font-medium">{user.name}</p>
                                        <p className="truncate text-[12px] text-black/45">{user.email}</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                            <RoleBadges roles={user.roles} />
                                            <Badge tone={user.suspended_at ? 'red' : 'green'}>{user.suspended_at ? 'Ditangguhkan' : 'Aktif'}</Badge>
                                            <span className="text-[11.5px] text-black/40">Bergabung {formatDate(user.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                <RowActions user={user} roles={roles} className="mt-3 justify-start pl-12" />
                            </li>
                        ))}
                    </ul>
                    </>
                )}
            </Panel>
            <Pagination paginator={users} only={only} />
        </>
    );
}

UsersIndex.layout = AdminLayout;
