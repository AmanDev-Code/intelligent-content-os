"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface TableOfContentsProps {
  className?: string;
  items?: TocItem[];
}

export function TableOfContents({ className, items: propItems }: TableOfContentsProps) {
  const [autoItems, setAutoItems] = useState<TocItem[]>([]);
  const items = propItems ?? autoItems;
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll("article h2[id], article h3[id]")
    );
    const tocItems = headings.map((heading) => ({
      id: heading.id,
      text: heading.textContent?.trim() ?? "",
      level: heading.tagName === "H2" ? 2 : 3,
    }));
    setAutoItems(tocItems);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className={cn("hidden xl:block", className)}>
      <div className="sticky top-24">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Contents
        </h2>
        <ul className="space-y-2 border-l-2 border-border/60">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "transition-colors",
                item.level === 3 ? "ml-4" : ""
              )}
            >
              <a
                href={`#${item.id}`}
                className={cn(
                  "block border-l-2 pl-4 text-sm transition-colors -ml-[2px]",
                  activeId === item.id
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
