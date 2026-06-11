import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import {
  signInWithPassword,
  signOut as apiSignOut,
  getVeterinarian,
  getAdministrator,
  type Veterinarian,
  type Administrator,
} from '../lib/api';

type Role = 'vet' | 'admin';
type SessionStatus = 'loading' | 'authenticated' | 'guest';

type Session = {
  status: SessionStatus;
  role: Role | null;
  user: { id: string; email: string | null };
  vet?: Veterinarian;
  admin?: Administrator;
};

const AuthContext = createContext<Session>({
  status: 'loading',
  role: null,
  user: { id: '', email: null },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({
    status: 'loading',
    role: null,
    user: { id: '', email: null },
  });

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setSession({ status: 'guest', role: null, user: { id: '', email: null } });
        return;
      }
      const uid = data.session.user.id;
      const email = data.session.user.email;
      const vet = await getVeterinarian(uid).catch(() => undefined);
      const admin = await getAdministrator(uid).catch(() => undefined);
      const role: Role = admin ? 'admin' : vet ? 'vet' : 'admin';
      setSession({ status: 'authenticated', role, user: { id: uid, email }, vet, admin });
    };
    init();
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await signInWithPassword(email, password);
    const uid = data.session.user.id;
    const vet = await getVeterinarian(uid).catch(() => undefined);
    const admin = await getAdministrator(uid).catch(() => undefined);
    const role: Role = admin ? 'admin' : vet ? 'vet' : 'admin';
    setSession({ status: 'authenticated', role, user: { id: uid, email: data.session.user.email }, vet, admin });
  };

  const signOut = async () => {
    await apiSignOut();
    setSession({ status: 'guest', role: null, user: { id: '', email: null } });
  };

  return (
    <AuthContext.Provider value={session}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
