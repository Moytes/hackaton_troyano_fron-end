import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://ptouxihznnmihsoekmfr.supabase.co',
      'sb_publishable_nGWQQk8KaOlvYyUZ5SBBQg_4R55_CdQ'
    );
  }

  async testConnection() {
    try {
      const { data, error } = await this.supabase.from('is').select('*').limit(1);
      if (error) {
        console.error('❌ Error de conexión a Supabase:', error.message);
        return false;
      }
      console.log('✅ Conexión exitosa a Supabase:', data);
      return true;
    } catch (error: any) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}