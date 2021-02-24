import { auth } from '@/firebase';
import { useMemo } from 'react';
import { useUserInfo } from './redux';

export const useAuthStatus = () => {
  const user = useUserInfo();

  const status = useMemo(() => !!user?.email?.length && !!auth.currentUser, [
    user,
    auth.currentUser,
  ]);

  return status;
};
