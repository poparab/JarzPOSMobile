import React, { createContext, useContext } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectProfile as selectProfileAction } from '../store/posProfileSlice';

interface PosContextValue {
  profile: string | null;
  setProfile: (profile: string | null) => void;
}

const PosContext = createContext<PosContextValue>({
  profile: null,
  setProfile: () => {},
});

export function PosProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.posProfile.selected);

  const setProfile = (p: string | null) => dispatch(selectProfileAction(p));

  return (
    <PosContext.Provider value={{ profile, setProfile }}>
      {children}
    </PosContext.Provider>
  );
}

export function usePos() {
  return useContext(PosContext);
}
