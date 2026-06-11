import type { Database } from './database.types';

export const db = {
  get supabase() {
    const { supabase } = require('./supabase');
    return supabase as import('./supabase').default & { __db?: Database };
  },
};
