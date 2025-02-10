const { createClient } = require("@supabase/supabase-js");
const { errorLogger } = require("../logger");

class SupabaseService {
  constructor() {
    this.supabase = null;
    this.initializeClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
    );
  }

  initializeClient(url, key) {
    this.supabase = createClient(url, key);
    return this.supabase;
  }

  ensureClient() {
    if (!this.supabase) {
      throw new Error(
        "Supabase client not initialized. Please verify credentials first.",
      );
    }
  }

  async checkMFAStatus() {
    try {
      this.ensureClient();

      const { data, error } = await this.supabase.auth.admin.listUsers();
      if (error) throw error;

      return data.users.map((user) => ({
        id: user.id,
        email: user.email,
        hasMFA: user.factors?.length > 0,
      }));
    } catch (error) {
      errorLogger("Error checking MFA status:", error);
      throw error;
    }
  }

  async checkRLSStatus() {
    try {
      this.ensureClient();
      const { data, error } = await this.supabase.rpc("get_tables_rls_data");
      if (error) throw error;

      return Object.entries(data.tables).map(([tableName, hasRLS]) => ({
        tableName,
        hasRLS,
      }));
    } catch (error) {
      errorLogger("Error checking RLS status:", error);
      throw error;
    }
  }

  async checkPITRStatus() {
    try {
      this.ensureClient();
      const { data, error } = await this.supabase.rpc("get_pitr_status");
      if (error) throw error;

      return {
        enabled: data.status,
      };
    } catch (error) {
      errorLogger("Error checking PITR status:", error);
      throw error;
    }
  }
}

module.exports = new SupabaseService();
