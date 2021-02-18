import { auth } from '@/firebase';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useUserInfo } from './redux';

export const useAuthStatus = () => {
  const user = useUserInfo();

  const status = useMemo(() => !!user?.id && !!auth.currentUser, [user, auth.currentUser]);

  return status;
};
