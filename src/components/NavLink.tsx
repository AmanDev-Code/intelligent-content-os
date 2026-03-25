"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  to?: string;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, href, to, ...props }, ref) => {
    const pathname = usePathname();
    const dest = (to as string) || href || "/";
    const isActive =
      dest === "/"
        ? pathname === "/"
        : pathname === dest || pathname.startsWith(`${dest}/`);

    return (
      <Link
        ref={ref}
        href={dest}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
