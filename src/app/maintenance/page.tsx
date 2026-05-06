import { MaintenancePage } from "@/components/maintenance/MaintenancePage";

interface Props {
  searchParams: Promise<{ message?: string; scheduledEnd?: string }>;
}

export default async function MaintenanceRoute({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <MaintenancePage
      message={params.message}
      scheduledEnd={params.scheduledEnd}
    />
  );
}
