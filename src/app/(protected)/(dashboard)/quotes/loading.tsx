import { TablePageSkeleton } from "@/components/skeletons";

export default function Loading() {
  return <TablePageSkeleton columns={5} rows={5} withSummary />;
}
