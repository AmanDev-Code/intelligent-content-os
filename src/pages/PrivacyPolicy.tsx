import { Link } from "react-router-dom";
import { Shield, Lock, Database, Globe, FileCheck } from "lucide-react";

const collectionItems = [
  "Account information such as your name, email address, profile photo, workspace identifiers, and authentication metadata.",
  "Connected platform data required to operate the app, such as LinkedIn account identifiers, OAuth tokens, token expiry times, organization/page identifiers, publication status, and data returned by approved platform APIs.",
  "Content workflow data such as prompts, generated topics, generated drafts, scheduled content, media references, publishing preferences, usage history, and generation job logs.",
  "Billing and subscription data such as selected plan, billing cycle, credit quota, usage totals, transaction references, and payment provider metadata needed to manage subscriptions.",
  "Technical and security data such as IP address, browser type, device information, request logs, error logs, session data, audit trails, and abuse-prevention signals.",
  "Support and communications data such as messages you send to support, bug reports, feedback, and records needed to resolve issues or protect the service.",
];

const useItems = [
  "To authenticate users, maintain secure sessions, and protect accounts from unauthorized access.",
  "To generate, improve, schedule, publish, and manage AI-assisted content workflows inside ContentOS.",
  "To connect with third-party platforms, execute your requested actions, and return platform data back to your workspace.",
  "To calculate usage, enforce quotas, manage subscriptions, process billing operations, and prevent fraud or abuse.",
  "To monitor performance, investigate incidents, maintain logs, troubleshoot failures, and improve reliability and security.",
  "To comply with applicable law, platform rules, contractual obligations, and valid lawful requests from public authorities.",
];

const securityItems = [
  "Authenticated access controls and role-based restrictions designed to ensure users can access only their own workspace data.",
  "Encryption in transit using HTTPS/TLS and secure handling of tokens, credentials, and session data.",
  "Server-side validation, audit logging, rate-limiting, quota enforcement, and abuse-prevention controls.",
  "Segregated storage patterns for user content, jobs, cache entries, and connected platform records to reduce cross-user data exposure risk.",
  "Operational monitoring, error tracking, infrastructure hardening, dependency management, and periodic access review practices.",
  "Limited personnel access on a need-to-know basis, subject to confidentiality and internal security controls.",
];

const regulatorItems = [
  "European Union data protection authorities and the European Data Protection Board (EDPB) under the GDPR.",
  "The UK Information Commissioner's Office (ICO) under UK GDPR and the Data Protection Act.",
  "United States regulators and agencies where relevant, including the Federal Trade Commission (FTC), state attorneys general, and the California Privacy Protection Agency (CPPA) under CCPA/CPRA.",
  "India's digital privacy framework and relevant authorities under the Digital Personal Data Protection Act, where applicable.",
  "Brazil's Autoridade Nacional de Protecao de Dados (ANPD) under the LGPD, where applicable.",
  "Canada's privacy regulators, including the Office of the Privacy Commissioner of Canada (OPC), where applicable.",
  "Australia's Office of the Australian Information Commissioner (OAIC), Singapore's PDPC, and other competent authorities in jurisdictions where the service is offered or used.",
  "Platform governance obligations imposed by service providers such as LinkedIn and other connected platforms whose APIs or developer policies apply to the product.",
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-12 md:px-8">
        <div className="mb-10 flex flex-col gap-4 border-b pb-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Privacy Policy
          </div>
          <h1 className="text-4xl font-bold tracking-tight">ContentOS Privacy Policy</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Effective date: March 12, 2026. This Privacy Policy explains how ContentOS AI collects,
            uses, stores, secures, and discloses information when you use our AI content strategy,
            creation, scheduling, publishing, analytics, media, billing, and connected-platform features.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/terms-of-use" className="text-primary underline-offset-4 hover:underline">
              View Terms of Use
            </Link>
            <Link to="/auth" className="text-primary underline-offset-4 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>

        <div className="space-y-10 text-sm leading-7 text-foreground/90">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">1. What ContentOS Is Made For</h2>
            <p>
              ContentOS is built to help individuals, teams, brands, creators, and businesses discover topics,
              create content with AI assistance, organize media, schedule and publish posts, review performance,
              manage quotas and billing, and connect approved third-party platforms from one secure workspace.
            </p>
            <p>
              We do not intentionally collect unrelated digital data. We collect information that is reasonably
              necessary to operate the app, secure the service, comply with law, and deliver the features you ask us to provide.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Database className="h-5 w-5" />
              2. Information We Collect
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              {collectionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">3. How We Use Information</h2>
            <ul className="list-disc space-y-2 pl-6">
              {useItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Lock className="h-5 w-5" />
              4. Security and Storage
            </h2>
            <p>
              We use layered technical and organizational measures designed to maintain a high level of security
              appropriate to the nature of the data processed by the service. No system can be guaranteed to be
              absolutely secure, but we are committed to using industry-standard safeguards and continuously improving them.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              {securityItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Data is retained only for as long as reasonably necessary for service delivery, security, legal compliance,
              dispute resolution, platform requirements, or legitimate business recordkeeping.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">5. Third-Party Platforms and Service Providers</h2>
            <p>
              When you connect a third-party service such as LinkedIn, you authorize ContentOS to access and process
              data made available under that platform's API scopes and developer rules. Your use of those platforms also
              remains subject to their own terms, privacy notices, and compliance requirements.
            </p>
            <p>
              We may use cloud infrastructure, payment processors, logging services, secure storage providers, and other
              subprocessors to operate the app. These providers may process limited data on our behalf under contractual,
              technical, and security controls.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">6. Data Sharing and Lawful Disclosure</h2>
            <p>
              We do not sell personal information. We disclose data only where necessary to operate the service,
              complete user-requested actions, protect rights and security, or comply with applicable law.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>To service providers acting on our behalf under appropriate contractual and security obligations.</li>
              <li>To connected platforms when you instruct the app to authenticate, retrieve approved data, or publish content.</li>
              <li>To advisors, auditors, insurers, or counterparties where reasonably necessary for lawful business operations.</li>
              <li>To courts, regulators, law enforcement, or other public authorities only when required by a valid legal process, lawful request, or binding legal obligation.</li>
              <li>As part of a merger, acquisition, financing, restructuring, or asset transfer, subject to appropriate safeguards.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Globe className="h-5 w-5" />
              7. International Compliance and Regulatory Understanding
            </h2>
            <p>
              ContentOS is designed with privacy, platform integrity, content governance, and security obligations in mind.
              Depending on where users are located and how the service is used, the product may be subject to oversight,
              guidance, or enforcement from multiple data protection, consumer protection, and online platform authorities.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              {regulatorItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              These references do not mean every law applies in every situation or jurisdiction. They reflect our intent
              to design and operate the service responsibly with awareness of major global privacy and platform rules.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">8. User Rights and Choices</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>You may review and update account information from within the app where available.</li>
              <li>You may disconnect connected social accounts, which removes stored connection credentials used by the service.</li>
              <li>You may request deletion, correction, export, or restriction of certain data, subject to law and operational necessity.</li>
              <li>You may stop using the service at any time, though certain records may be retained where required for security, billing, or legal compliance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <FileCheck className="h-5 w-5" />
              9. Children's Data
            </h2>
            <p>
              ContentOS is not intended for children and should be used only by persons legally permitted to enter into
              binding agreements under applicable law. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in the product, security practices,
              legal obligations, or platform integrations. When material updates are made, we may revise the effective date
              and provide additional notice where required.
            </p>
          </section>

          <section className="space-y-3 border-t pt-8">
            <h2 className="text-2xl font-semibold">11. Contact</h2>
            <p>
              For privacy, compliance, or security inquiries relating to ContentOS AI, please contact the service operator
              through the official support or business contact channel made available in the application or company materials.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
