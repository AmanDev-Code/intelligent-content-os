import Link from "next/link";
import { Receipt, ShieldAlert, Mail, Scale } from "lucide-react";

const wrongfulPaymentItems = [
  "You were charged after you had already cancelled your subscription through the documented in-product or checkout cancellation path, as confirmed by timestamps and ledger records.",
  "The same renewal or purchase was billed more than once in error (duplicate authorization for the identical subscription interval), or the invoiced period does not match the plan interval you authorized.",
  "A mismatch between what you reasonably understood you were purchasing—based on the plan name, advertised price tier, and cadence—and the subscription line item that was invoiced without your explicit agreement to material changes affecting price or term.",
  "We fail to activate or materially restore access tied to your account after Polar reports a successfully completed qualifying payment attributable to your user record, pending reasonable verification timelines.",
];

const fraudItems = [
  "Transactions we reasonably believe are attributable to compromised accounts, unauthorized access using stolen credentials, or payment credentials used without verified account-holder consent.",
  "Patterns flagged by Polar, issuing banks, or our internal abuse controls indicative of fraudulent purchase activity, card testing, stolen payment instruments, or identity abuse targeting our users or billing systems.",
  "Chargebacks initiated for fraud classification by the card issuer, where Polar or our processors request cooperation and substantive evidence supports reversing the charge appropriately.",
];

const notTypicallyItems = [
  "Requests made solely because expectations about campaign performance or audience outcomes were unmet—not because of a faulty charge or entitlement issue.",
  "Partial or full refunds demanded after significant paid usage of premium capabilities without a wrongful-charge justification, absent applicable statutory consumer protections.",
  "Disputes that should be routed through Polar’s purchaser flow or issuer chargeback timelines when fraudulent activity claims have already progressed through payment-network rules.",
];

export default function RefundPolicy({ h1Override }: { h1Override?: string | null }) {
  const headline =
    (h1Override?.trim()?.length ?? 0) > 0 ? h1Override!.trim() : "Refund & billing resolutions";
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-12 md:px-8">
        <div className="mb-10 flex flex-col gap-4 border-b pb-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
            <Receipt className="h-4 w-4" />
            Refund Policy
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{headline}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Effective date: May 10, 2026. This policy explains how Trndinn evaluates refund and billing-correction requests
            for wrongful charges and suspected fraud affecting subscription purchases, and how to contact us when something
            is wrong. Payments for Trndinn are processed by Polar (merchant of record) or other authorized payment partners;
            final accounting, tax invoicing format, or additional processor rules may also apply alongside this policy.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/terms-of-use" className="text-primary underline-offset-4 hover:underline">
              Terms of Use
            </Link>
            <Link href="/privacy-policy" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
              Contact support
            </Link>
          </div>
        </div>

        <div className="space-y-10 text-sm leading-7 text-foreground/90">
          <section className="rounded-lg border bg-muted/20 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Summary for buyers
            </h2>
            <p className="mt-3">
              Subscription software is ordinarily non-refundable except where billing was wrong or payments were abusive.
              When you qualify, our goal is corrective action—typically <strong>cancellation adjustment</strong>,{" "}
              <strong>credits when appropriate</strong>, or processing a <strong>refund pathway</strong> through Polar
              (or succeeding processor) consistent with lawful chargebacks and Polar’s policies—not open-ended discretionary
              cash-back for subjective dissatisfaction alone.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">1. Scope</h2>
            <p>
              Trndinn provides digital access subscriptions and related quotas. Charges are recurrent until legitimately cancelled.
              This policy supplements your agreements in the Terms of Use and does not waive mandatory consumer statutes where applicable.
              If statutory rights (for example statutory cooling-off for digital services in limited jurisdictions where still available)
              provide stronger remedies, those rules govern to the extent they apply and cannot contractually surrender where prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Scale className="h-5 w-5" />
              2. Wrongful-payment situations we review
            </h2>
            <p className="text-muted-foreground">
              “Wrongful payment” means the charge arose from an invoicing defect, erroneous renewal, entitlement gap, duplicate capture,
              or analogous mistake—not ordinary dissatisfaction while the service materially operated as subscribed.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              {wrongfulPaymentItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Investigations may examine checkout logs provided by Polar, subscription webhooks correlating invoices to workspace IDs,
              our activation records and usage counters, timestamps of cancellation confirmations, correlation with SSO email owners, and issuer fraud codes.
              We cooperate with Polar’s compliance teams whenever they request documentation for adjudication under their Merchant of Record program.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <ShieldAlert className="h-5 w-5" />
              3. Fraud detection & unauthorized charges
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              {fraudItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              If you believe your credentials were abused, promptly secure your authentication provider (magic link/password reset),
              review active sessions inside Trndinn, and initiate a Polar buyer ticket or issuer dispute concurrently with notifying us—we
              will cross-reference anomalies. Repeated fraud attempts may permanently close accounts alongside processor reporting requirements.
              False fraud claims materially delay legitimate users; misrepresentation can trigger legal or contractual remedies outlined in our Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">4. Outcomes after approval</h2>
            <p>Possible corrective actions include, singly or in combination:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Issuing refunds or partial refunds initiated through Polar (or succeeding processor reconciliation) toward the funding source originally charged.
              </li>
              <li>Applying service credits or entitlement extensions proportional to erroneous downtime—not cash—when uptime failures were objectively verified.</li>
              <li>Correcting erroneous upcoming renewal amounts before the next cycle when misconfiguration surfaced before capture.</li>
              <li>Coordinated responses to chargebacks, including provisional reversals contingent on payment-network outcomes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">5. Situations refunds are generally not entertained</h2>
            <ul className="list-disc space-y-2 pl-6">
              {notTypicallyItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">6. How to request review</h2>
            <p className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Email or message us via{" "}
                <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
                  the Contact page
                </Link>{" "}
                using the billing email tied to Polar. Include Polar transaction IDs, timestamps, invoice PDFs where available,
                and a short explanation so we can match your account quickly. We usually acknowledge substantive requests within roughly{" "}
                <strong>five (5) business days</strong> and escalate to Polar promptly when refund or reversal grounds are credible.
              </span>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">7. Taxes, currency, rounding</h2>
            <p>
              Applicable VAT/GST/SST or analogous taxes may appear on Polar invoices in line with Polar’s Merchant of Record obligations. Approved refunds reconcile tax lines as Polar dictates;
              fluctuations from FX timing are outside our discretionary control unless a processor bug is proven with processor acknowledgment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">8. Abuse & policy breaches</h2>
            <p>
              Accounts tied to materially abusive exploitation of refund channels, circumventing metering, circumventing quotas, exploiting processor loopholes,
              or repeated chargeback abuses may lose access pursuant to Terms of Use and may be billed recovery costs permissible by law where applicable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">9. Changes</h2>
            <p>
              We may update this Refund Policy to reflect product, processor, geographic, regulatory, fraud-prevention technology, or underwriting changes—revising the effective date atop the policy.
              Material restrictions will be signaled through reasonable avenues (for example banners, email summaries, changelog updates) wherever legally required alongside continued publication at this canonical URL for Polar verification and purchasers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
