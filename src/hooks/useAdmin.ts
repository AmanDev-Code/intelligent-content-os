import { useAuth } from '@/contexts/AuthContext';

const ADMIN_USER_ID = 'c9327732-05cd-41dc-9d4f-e0c17b7fbea3';
const ADMIN_EMAIL = 'amanahuja@gmail.com';

export const useAdmin = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.id === ADMIN_USER_ID || user?.email === ADMIN_EMAIL;
  
  return {
    isAdmin,
    adminUserId: ADMIN_USER_ID,
    adminEmail: ADMIN_EMAIL,
  };
};