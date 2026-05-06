"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { useBlogAccess } from "@/hooks/useBlogAccess";
import { usePlatformAccess } from "@/hooks/usePlatformAccess";

export type AdminSections = {
  overview: boolean;
  users: boolean;
  feedback: boolean;
  blog: boolean;
  careers: boolean;
  settings: boolean;
  maintenance: boolean;
};

export function useAdminAreaAccess(): {
  canEnter: boolean;
  loading: boolean;
  sections: AdminSections;
} {
  const { staff, loading: platformLoading } = usePlatformAccess();
  const { isAdmin } = useAdmin();
  const blog = useBlogAccess();

  const loading = platformLoading || blog.loading;
  const canEnter = staff || isAdmin || blog.canManageBlog;

  const sections = useMemo((): AdminSections => {
    const sStaff = staff || isAdmin;
    return {
      overview: canEnter,
      users: sStaff,
      feedback: sStaff,
      blog: blog.canManageBlog || isAdmin,
      careers: isAdmin,
      settings: isAdmin,
      maintenance: isAdmin,
    };
  }, [
    canEnter,
    staff,
    isAdmin,
    blog.canManageBlog,
    // maintenance derived from isAdmin — already captured
  ]);

  return { canEnter, loading, sections };
}

/** Redirect to /dashboard or /admin when the current route requires a section the user lacks. */
export function useAdminSectionGate(
  section: keyof AdminSections,
  redirectTo: "/dashboard" | "/admin" = "/admin",
) {
  const router = useRouter();
  const { canEnter, loading, sections } = useAdminAreaAccess();

  useEffect(() => {
    if (loading) return;
    if (!canEnter) {
      router.replace("/dashboard");
      return;
    }
    if (!sections[section]) {
      router.replace(redirectTo);
    }
  }, [loading, canEnter, sections, section, router, redirectTo]);

  return { loading, allowed: !loading && canEnter && sections[section] };
}
