import Link from "next/link";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { requireOwnerOrRealtor } from "@/lib/admin";
import { getTranslations } from "@/i18n/server";
import { verifyAndActivatePromotion } from "@/lib/promotions";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PromoteResultPage({ searchParams }: PageProps) {
  const user = await requireOwnerOrRealtor();
  const query = await searchParams;
  const { t } = await getTranslations();

  const statusRaw = typeof query.status === "string" ? query.status : "unknown";
  const promotionId = typeof query.promotionId === "string" ? query.promotionId : "";

  let status: "success" | "failed" | "unknown" =
    statusRaw === "success" || statusRaw === "failed" ? statusRaw : "unknown";

  // Re-verify on success path so activation works even if callback was delayed.
  if (promotionId && (status === "success" || status === "unknown")) {
    const result = await verifyAndActivatePromotion(promotionId);
    if ("success" in result) {
      status = "success";
    } else if (status === "success") {
      // Payriff said success URL but we couldn't activate yet
      status = "failed";
    }
  }

  void user;

  const config = {
    success: {
      icon: <CheckCircle2 className="h-14 w-14 text-green-600" />,
      title: t("promotion.resultSuccessTitle"),
      body: t("promotion.resultSuccessBody"),
      box: "border-green-200 bg-green-50",
    },
    failed: {
      icon: <XCircle className="h-14 w-14 text-red-600" />,
      title: t("promotion.resultFailedTitle"),
      body: t("promotion.resultFailedBody"),
      box: "border-red-200 bg-red-50",
    },
    unknown: {
      icon: <HelpCircle className="h-14 w-14 text-amber-600" />,
      title: t("promotion.resultUnknownTitle"),
      body: t("promotion.resultUnknownBody"),
      box: "border-amber-200 bg-amber-50",
    },
  }[status];

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className={`rounded-2xl border p-8 text-center shadow-sm ${config.box}`}>
        <div className="flex justify-center">{config.icon}</div>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">{config.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{config.body}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {status === "success" && promotionId && (
            <Link
              href={`/dashboard/promotions/${promotionId}`}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              {t("promotion.viewStats")}
            </Link>
          )}
          <Link
            href="/dashboard/promote"
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            {t("promotion.promoteAgain")}
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            {t("nav.villas")}
          </Link>
        </div>
      </div>
    </div>
  );
}
