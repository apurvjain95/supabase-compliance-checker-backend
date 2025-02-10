const supabaseService = require("./supabaseService");
const { infoLogger, errorLogger } = require("../logger");

class ScanService {
  async runFullScan() {
    const timestamp = new Date().toISOString();
    const results = {
      timestamp,
      mfa: { status: null, details: null },
      rls: { status: null, details: null },
      pitr: { status: null, details: null },
    };

    try {
      // Check MFA
      const mfaResults = await supabaseService.checkMFAStatus();
      results.mfa = {
        status: mfaResults.every((user) => user.hasMFA),
        details: mfaResults,
      };

      // Check RLS
      const rlsResults = await supabaseService.checkRLSStatus();
      results.rls = {
        status: rlsResults.every((table) => table.hasRLS),
        details: rlsResults,
      };

      // Check PITR
      const pitrResults = await supabaseService.checkPITRStatus();
      results.pitr = {
        status: pitrResults.enabled,
      };

      // Log results
      infoLogger("Security scan completed", { results });

      return results;
    } catch (error) {
      errorLogger("Error during security scan:", error);
      throw error;
    }
  }
}

module.exports = new ScanService();
