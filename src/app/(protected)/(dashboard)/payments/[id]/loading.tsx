import { FormCardSkeleton, PageHeaderSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton action={false} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormCardSkeleton rows={2} />
          <FormCardSkeleton rows={5} />
        </div>
        <div className="space-y-6">
          <FormCardSkeleton rows={3} />
          <FormCardSkeleton rows={4} />
        </div>
      </div>
    </>
  );
}
