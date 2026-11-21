import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/db";
import { appTimeZone, todayKey } from "@/lib/dates";
import CaseForm from "@/components/CaseForm";
import { ArrowLeftIcon, PageHeader } from "@/components/ui";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  const c = await prisma.case.findFirst({ where: { id, lawyerId: userId } });
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/cases/${c.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon /> Back to case
      </Link>
      <PageHeader title="Edit case" description={c.title} />
      <CaseForm
        today={todayKey(appTimeZone())}
        initial={{
          id: c.id,
          title: c.title,
          caseType: c.caseType,
          caseNumber: c.caseNumber,
          courtName: c.courtName,
          clientName: c.clientName,
          clientPhone: c.clientPhone,
          opposingParty: c.opposingParty,
          status: c.status,
          notes: c.notes,
        }}
      />
    </div>
  );
}
