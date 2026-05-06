"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";

export type PlatformAccess = {
  loading: boolean;
  superAdmin: boolean;
  staff: boolean;
};

/** Env super-admin OR delegated row in `platform_admin_grants`. */
export function usePlatformAccess(): PlatformAccess {
  const { user, session } = useAuth();
  const [state, setState] = useState<PlatformAccess>({
    loading: true,
    superAdmin: false,
    staff: false,
  });

  const load = useCallback(async () => {
    if (!user || !session) {
      setState({ loading: false, superAdmin: false, staff: false });
      return;
    }
    try {
      const data = await apiClient.get("/platform-admin/access");
      setState({
        loading: false,
        superAdmin: Boolean(data?.superAdmin),
        staff: Boolean(data?.staff),
      });
    } catch {
      setState({ loading: false, superAdmin: false, staff: false });
    }
  }, [user, session]);

  useEffect(() => {
    void load();
  }, [load]);

  return state;
}
