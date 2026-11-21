import Link from "next/link";
import { requireUserId } from "@/auth";
import { appTimeZone, todayKey } from "@/lib/dates";
import CaseForm from "@/components/CaseForm";
import { ArrowLeftIcon, PageHeader } from "@/components/ui";

export default async function NewCasePage() {
  await requireUserId();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/cases" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon /> Back to cases
      </Link>
      <PageHeader title="New case" description="Add the case details and, if you know it, the first hearing date." />
      <CaseForm today={todayKey(appTimeZone())} />
    </div>
  );
}
