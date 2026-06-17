import type { Database } from './database.types';
import { supabase } from './supabase';

export const db = {
  get supabase() {
    return supabase as typeof supabase & { __db?: Database };
  },
};