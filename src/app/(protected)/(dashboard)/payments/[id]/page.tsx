import { PaymentDetail } from "@/features/payments/payment-detail";

export const metadata = { title: "Payment" };

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PaymentDetail id={id} />;
}
