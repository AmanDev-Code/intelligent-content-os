"use client";

import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface GuideBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function GuideBreadcrumb({ items }: GuideBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index === 0 && <BookOpen className="h-4 w-4" />}
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {index === items.length - 1 ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-foreground hover:underline"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
