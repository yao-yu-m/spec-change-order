import { redirect } from "next/navigation";

export default async function PmDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/change-orders/${id}`);
}
