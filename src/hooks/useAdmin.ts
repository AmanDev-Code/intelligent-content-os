import { useAuth } from '@/contexts/AuthContext';

/**
 * Admin user ID – must match backend AdminGuard (backend/src/guards/admin.guard.ts).
 * Admin-only features (e.g. Email Dashboard, Admin Notifications) are rendered only for this user.
 */
export const ADMIN_USER_ID = 'c9327732-05cd-41dc-9d4f-e0c17b7fbea3';
export const ADMIN_EMAIL = 'amanahuja@gmail.com';

export const useAdmin = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.id === ADMIN_USER_ID || user?.email === ADMIN_EMAIL;
  
  return {
    isAdmin,
    adminUserId: ADMIN_USER_ID,
    adminEmail: ADMIN_EMAIL,
  };
};