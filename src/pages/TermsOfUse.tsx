import { Link } from "react-router-dom";
import { FileText, ShieldCheck, Gavel, Globe2 } from "lucide-react";

const prohibitedUseItems = [
  "Publish or generate unlawful, fraudulent, defamatory, harassing, hateful, violent, deceptive, or infringing content.",
  "Use the service to violate platform rules, intellectual property rights, privacy rights, export controls, sanctions laws, or advertising disclosure obligations.",
  "Attempt unauthorized access, token misuse, scraping, credential theft, reverse engineering of protected systems, or interference with service availability.",
  "Use AI-generated outputs in a way that misleads users, impersonates others, conceals required disclosures, or violates professional, consumer, election, or advertising laws.",
  "Upload malware, harmful code, or data intended to damage systems, bypass controls, or disrupt operations.",
];

const userResponsibilityItems = [
  "Ensuring you have the necessary rights, licenses, permissions, and approvals for any content, prompts, media, brands, or accounts you connect to the service.",
  "Reviewing generated outputs before publication and determining whether those outputs are accurate, compliant, lawful, safe, and appropriate for the intended audience.",
  "Complying with the laws, regulations, industry codes, and platform rules that apply in each jurisdiction where your content is created, distributed, or viewed.",
  "Maintaining the security of your own devices, passwords, accounts, team access, and connected platform permissions.",
];

const regulatoryItems = [
  "Privacy and data protection regimes such as GDPR, UK GDPR, CCPA/CPRA, LGPD, and comparable national or state privacy laws.",
  "Consumer protection and advertising standards enforced by bodies such as the FTC, state regulators, the UK's ASA and CMA where relevant, and equivalent authorities in other jurisdictions.",
  "Online safety, intermediary, digital services, and platform-governance obligations that may apply to user-generated or AI-assisted content.",
  "Developer policies, terms, and API restrictions imposed by LinkedIn and any other platform integrated into the service.",
];

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-12 md:px-8">
        <div className="mb-10 flex flex-col gap-4 border-b pb-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Terms of Use
          </div>
          <h1 className="text-4xl font-bold tracking-tight">ContentOS Terms of Use</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Effective date: March 12, 2026. These Terms govern your access to and use of ContentOS AI,
            including its AI content generation, scheduling, publishing, analytics, billing, media, API,
            and connected-platform features.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/privacy-policy" className="text-primary underline-offset-4 hover:underline">
              View Privacy Policy
            </Link>
            <Link to="/auth" className="text-primary underline-offset-4 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>

        <div className="space-y-10 text-sm leading-7 text-foreground/90">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By creating an account, accessing the service, connecting a third-party platform, or using any
              ContentOS feature, you agree to these Terms. If you do not agree, you must not use the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">2. What the Service Provides</h2>
            <p>
              ContentOS is an AI-assisted content operations platform designed to help users discover topics,
              generate content drafts, manage media, schedule posts, connect external platforms, publish content,
              review account-level or platform-level results where available, and manage quotas, plans, and workflows.
            </p>
            <p>
              The service is a tool to support your workflow. It does not replace your legal, editorial, security,
              tax, compliance, platform-policy, or professional judgment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <ShieldCheck className="h-5 w-5" />
              3. Eligibility and Account Security
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>You must be legally capable of entering into a binding agreement and using the service under applicable law.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials and connected platform permissions.</li>
              <li>You must provide accurate account information and promptly update it if it changes.</li>
              <li>You are responsible for all activity conducted through your account unless prohibited by law.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">4. Acceptable Use</h2>
            <p>You may use ContentOS only for lawful, authorized, and legitimate business or creator purposes.</p>
            <ul className="list-disc space-y-2 pl-6">
              {prohibitedUseItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">5. User Responsibilities</h2>
            <ul className="list-disc space-y-2 pl-6">
              {userResponsibilityItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Globe2 className="h-5 w-5" />
              6. Platform, Regulatory, and Country-Level Compliance
            </h2>
            <p>
              You are responsible for ensuring that your use of ContentOS complies with the laws, platform policies,
              disclosure standards, and regulatory expectations applicable to your content, audience, geography, and industry.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              {regulatoryItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Different countries and regions may regulate content, privacy, advertising, AI use, consumer protection,
              competition, online harms, financial promotions, or political content differently. You remain responsible for
              determining which rules apply to your content and business activities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">7. AI Output and Content Disclaimer</h2>
            <p>
              AI-generated results may be incomplete, inaccurate, biased, or inappropriate for your specific use case.
              ContentOS does not guarantee that any generated output is correct, compliant, original, non-infringing,
              fit for publication, or suitable for any legal or commercial purpose.
            </p>
            <p>
              You must independently review, edit, and approve all outputs before relying on them or publishing them.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">8. Connected Accounts and Third-Party Services</h2>
            <p>
              By connecting LinkedIn or any other platform, you authorize ContentOS to act within the permissions granted
              by you and permitted by that platform's API terms. Third-party services may limit available features,
              analytics, or actions, and those limitations are outside our direct control.
            </p>
            <p>
              We may suspend, remove, or modify an integration if required by platform policy, legal risk, abuse prevention,
              technical limitations, or service reliability concerns.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">9. Plans, Billing, and Quotas</h2>
            <p>
              Certain features require a paid plan or are subject to usage limits, credits, or quota enforcement.
              Pricing, plan benefits, and included usage may change over time. You are responsible for all fees,
              taxes, and charges associated with your use of the service unless otherwise stated.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">10. Intellectual Property</h2>
            <p>
              We retain all rights in the ContentOS service, software, design, branding, documentation, and related
              materials, except for rights expressly granted to you. You retain ownership of content you submit,
              subject to the rights necessary for us to host, process, secure, transmit, and operate the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">11. Suspension and Termination</h2>
            <p>
              We may suspend, limit, or terminate access where reasonably necessary to protect the service, users,
              third parties, or legal compliance, including for suspected abuse, non-payment, unlawful conduct,
              platform-policy violations, or security incidents.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Gavel className="h-5 w-5" />
              12. Disclaimers and Limitation of Liability
            </h2>
            <p>
              The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis to the maximum extent
              permitted by law. We disclaim implied warranties except where such disclaimers are prohibited by applicable law.
            </p>
            <p>
              To the maximum extent permitted by law, we are not liable for indirect, incidental, special,
              consequential, exemplary, or loss-of-profit damages, or for losses arising from third-party platform changes,
              content decisions, AI output quality, user misuse, or events outside our reasonable control.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">13. Lawful Requests and Cooperation</h2>
            <p>
              We may preserve, review, or disclose relevant records where required by valid legal process, court order,
              regulatory inquiry, national security obligation, or other lawful request from a competent public authority.
              We do not voluntarily disclose user data except where reasonably necessary for service operation, safety,
              rights protection, or legal compliance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">14. Changes to These Terms</h2>
            <p>
              We may revise these Terms from time to time. Continued use of the service after an update becomes effective
              constitutes acceptance of the revised Terms, except where additional notice or consent is required by law.
            </p>
          </section>

          <section className="space-y-3 border-t pt-8">
            <h2 className="text-2xl font-semibold">15. Contact</h2>
            <p>
              For legal, compliance, or platform-governance matters related to ContentOS AI, please contact the operator
              through the official support or business contact channel provided by the service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
