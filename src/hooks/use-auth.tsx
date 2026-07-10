import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import {
  signInWithPassword,
  signOut as apiSignOut,
  getVeterinarianByEmail,
  getAdministratorByEmail,
} from '../lib/api';

type Role = 'vet' | 'admin' | 'deal';
type User = { id: string; email: string | null };

type Session = {
  status: 'loading' | 'authenticated' | 'guest';
  role: Role | null;
  user: User;
  vet?: any;
  admin?: any;
  signIn?: (email: string, password: string) => Promise<void>;
  signOut?: () => Promise<void>;
};

const AuthContext = createContext<Session>({
  status: 'loading',
  role: null,
  user: { id: '', email: null },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ status: 'loading', role: null, user: { id: '', email: null } });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return setSession({ status: 'guest', role: null, user: { id: '', email: null } });
      const uid = data.session.user.id;
      const email = data.session.user.email ?? null;

      let vet: any = undefined;
      let admin: any = undefined;
      let deal: any = undefined;
      if (email) {
        try {
          vet = await getVeterinarianByEmail(email);
        } catch (_vetErr) {
          // vet profile may not exist for non-vet users
        }
        try {
          admin = await getAdministratorByEmail(email);
        } catch (_adminErr) {
          // admin profile may not exist for non-admin users
        }
        try {
          deal = await getDealOwnerByEmail(email);
        } catch (_dealErr) {
          // deal profile may not exist for non-deal users
        }
      }

      const role: Role = admin ? 'admin' : deal ? 'deal' : 'vet';
      setSession({ status: 'authenticated', role, user: { id: uid, email }, vet, admin, deal });
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await signInWithPassword(email, password);
    const uid = data.session.user.id;
    const userEmail = data.session.user.email ?? null;

    let vet: any = undefined;
    let admin: any = undefined;
    let deal: any = undefined;
    if (userEmail) {
      try {
        vet = await getVeterinarianByEmail(userEmail);
      } catch (_vetErr) { /* non-vet or missing profile */ }
      try {
        admin = await getAdministratorByEmail(userEmail);
      } catch (_adminErr) { /* non-admin or missing profile */ }
      try {
        deal = await getDealOwnerByEmail(userEmail);
      } catch (_dealErr) { /* non-deal or missing profile */ }
    }

    const role: Role = admin ? 'admin' : deal ? 'deal' : 'vet';
    setSession({ status: 'authenticated', role, user: { id: uid, email: userEmail }, vet, admin, deal });
  };

  const signOut = async () => {
    await apiSignOut();
    setSession({ status: 'guest', role: null, user: { id: '', email: null } });
  };

  return <AuthContext.Provider value={{ ...session, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  const { user } = ctx;
  return {
    session: ctx,
    status: ctx.status,
    role: ctx.role,
    user,
    vet: ctx.vet,
    signIn: ctx.signIn,
    signOut: ctx.signOut,
  };
}
