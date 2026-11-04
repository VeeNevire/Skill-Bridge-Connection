import { OrganizationPortal } from '@/components/dashboard/organization-portal';
import type { Portal } from '@/components/dashboard/organization-portal';
export default function Dashboard({ portal }: { portal: Portal }) {
    return <OrganizationPortal portal={portal} />;
}
