export const dynamic = "force-dynamic";
import Link from "next/link";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";

export const metadata = { title: "Payment Successful — SORK Cloud" };

interface Props {
  searchParams: Promise<{ plan?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const plan = params.plan ?? "Pro";

  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Payment received</h1>
          <p className="text-muted">
            Your <span className="text-fg font-medium">{plan}</span> plan is being activated.
          </p>
        </div>

        <div className="border border-border rounded-2xl p-5 text-left space-y-3">
          {[
            { step: "1", label: "Payment confirmed", done: true },
            { step: "2", label: "Plan upgrade processed", done: false },
            { step: "3", label: "Issue your new license keys", done: false },
          ].map(({ step, label, done }) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  done
                    ? "bg-success/20 border border-success/40 text-success"
                    : "bg-border text-muted"
                }`}
              >
                {done ? "✓" : step}
              </div>
              <span className={`text-sm ${done ? "text-fg" : "text-muted"}`}>{label}</span>
            </div>
          ))}
        </div>

        <p className="text-muted text-sm">
          Upgrade typically activates within a few minutes. Need help?{" "}
          <a
            href="mailto:support@sorkcloud.space"
            className="text-accent hover:underline inline-flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" /> support@sorkcloud.space
          </a>
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold rounded-xl hover:bg-accent/90 transition-colors"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
