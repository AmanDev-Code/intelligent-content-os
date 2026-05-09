import { Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlogAuthorCardProps {
  name: string;
  role?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  linkedinUrl?: string | null;
}

export function BlogAuthorCard({ name, role, bio, avatarUrl, linkedinUrl }: BlogAuthorCardProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="mt-14 border-t border-border/50 pt-10">
      <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
        About the author
      </p>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              loading="lazy"
              className="h-16 w-16 rounded-full border border-border/50 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary shadow-sm ring-1 ring-border/30">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-base font-bold">{name}</span>
            {role ? (
              <Badge variant="secondary" className="rounded-full text-[11px] font-normal">
                {role}
              </Badge>
            ) : null}
          </div>
          {bio ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{bio}</p>
          ) : null}
          {linkedinUrl ? (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
