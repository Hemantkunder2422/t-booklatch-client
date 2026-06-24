import { TablePageSkeleton } from "@/components/skeletons";

export default function Loading() {
  return <TablePageSkeleton columns={4} rows={6} withSummary />;
}
