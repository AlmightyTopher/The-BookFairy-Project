import { describe, it, expect } from 'vitest';
import { ValidationChecks } from '../../src/flow/validation-checks';

describe('Flow Validation Checks', () => {
  it('should run all validation checks successfully', async () => {
    const report = ValidationChecks.runAllChecks();
    
    console.log('\n=== VALIDATION REPORT ===');
    console.log(`Routes Count: ${report.routes_count}`);
    console.log(`Links Validated: ${report.links_validated_count}`);
    console.log(`Routes with Globals: ${report.routes_with_globals_count}`);
    console.log(`Results Views Checked: ${report.results_views_checked}`);
    console.log(`Wishlist Entry Points: ${report.wishlist_entry_points_verified}`);
    console.log(`Help Topics Verified: ${report.help_topics_verified}`);
    console.log(`Overall Status: ${report.pass ? 'PASS' : 'FAIL'}`);
    
    if (report.errors.length > 0) {
      console.log('\nValidation Errors:');
      report.errors.forEach(error => {
        console.log(`- ${error}`);
      });
    }

    expect(report.pass).toBe(true);
  });

  it('should run button-by-button testing', async () => {
    const result = await ValidationChecks.runButtonByButtonTest();
    
    console.log('\n=== BUTTON-BY-BUTTON TEST REPORT ===');
    console.log(`Test Status: ${result.pass ? 'PASS' : 'FAIL'}`);
    
    if (result.errors.length > 0) {
      console.log('\nButton Test Errors:');
      result.errors.forEach(error => {
        console.log(`- ${error}`);
      });
    }

    expect(result.pass).toBe(true);
  });
});
