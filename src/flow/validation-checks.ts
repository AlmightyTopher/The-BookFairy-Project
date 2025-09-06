import { logger } from '../utils/logger.js';
import { FlowEngine } from './flow-engine.js';
import { TaskExecutor } from './task-executor.js';
import { join } from 'path';

// Create instances for validation - delay creation to avoid module-level errors
let taskExecutor: TaskExecutor;
let flowEngine: FlowEngine;

function ensureInstances() {
  if (!taskExecutor) {
    taskExecutor = new TaskExecutor();
  }
  if (!flowEngine) {
    try {
      const configPath = join(process.cwd(), 'src', 'flow', 'bot_flow.json');
      flowEngine = new FlowEngine(configPath);
    } catch (error) {
      logger.error({ error }, 'Failed to create FlowEngine in validation');
      throw error;
    }
  }
}

interface ValidationReport {
  routes_count: number;
  links_validated_count: number;
  routes_with_globals_count: number;
  results_views_checked: number;
  wishlist_entry_points_verified: number;
  help_topics_verified: number;
  pass: boolean;
  errors: string[];
}

export class ValidationChecks {
  
  public static runAllChecks(): ValidationReport {
    logger.info('Running comprehensive validation checks...');
    
    const errors: string[] = [];
    
    try {
      ensureInstances();
      
      // 1. Flow lint (link integrity)
      const flowValidation = flowEngine.validateConfiguration();
      if (!flowValidation.pass) {
        errors.push(...flowValidation.errors);
      }
      
      // 2. Environment validation
      const envValidation = taskExecutor.validateEnvironment();
      if (!envValidation.valid) {
        errors.push(`Missing environment variables: ${envValidation.missingVars.join(', ')}`);
      }
      
      // 3. Global buttons assertion
      const globalButtonsCheck = this.validateGlobalButtonsEnforcement();
      if (!globalButtonsCheck.pass) {
        errors.push(...globalButtonsCheck.errors);
      }
      
      // 4. Results conformance
      const resultsCheck = this.validateResultsConformance();
      if (!resultsCheck.pass) {
        errors.push(...resultsCheck.errors);
      }
      
      // 5. No Results conformance
      const noResultsCheck = this.validateNoResultsConformance();
      if (!noResultsCheck.pass) {
        errors.push(...noResultsCheck.errors);
      }
      
      // 6. Help menu coverage
      const helpCheck = this.validateHelpMenuCoverage();
      if (!helpCheck.pass) {
        errors.push(...helpCheck.errors);
      }
      
      // 7. Legacy nav cleanup
      const legacyCheck = this.validateLegacyNavCleanup();
      if (!legacyCheck.pass) {
        errors.push(...legacyCheck.errors);
      }
      
      const report: ValidationReport = {
        routes_count: flowValidation.routes_count,
        links_validated_count: flowValidation.links_validated_count,
        routes_with_globals_count: flowValidation.routes_with_globals_count,
        results_views_checked: flowValidation.results_views_checked,
        wishlist_entry_points_verified: flowValidation.wishlist_entry_points_verified,
        help_topics_verified: flowValidation.help_topics_verified,
        pass: errors.length === 0,
        errors
      };
      
      this.logReport(report);
      return report;
      
    } catch (error) {
      logger.error({ error }, 'Validation checks failed');
      return {
        routes_count: 0,
        links_validated_count: 0,
        routes_with_globals_count: 0,
        results_views_checked: 0,
        wishlist_entry_points_verified: 0,
        help_topics_verified: 0,
        pass: false,
        errors: [`Validation system error: ${error}`]
      };
    }
  }
  
  private static validateGlobalButtonsEnforcement(): { pass: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Test rendering a few routes to ensure globals are enforced
      const testUserId = 'validation_test_user';
      
      // Test Main route
      const mainRender = flowEngine.renderRoute(testUserId, 'Main');
      if (!mainRender.components || mainRender.components.length === 0) {
        errors.push('Main route has no components');
      } else {
        const lastRow = mainRender.components[mainRender.components.length - 1];
        if (lastRow.components.length !== 3) {
          errors.push(`Main route last row has ${lastRow.components.length} buttons, expected 3 global buttons`);
        }
      }
      
      // Test a few other routes
      const testRoutes = ['Other.Menu', 'Help.Menu', 'Genre.Pick'];
      testRoutes.forEach(routeName => {
        try {
          const render = flowEngine.renderRoute(testUserId, routeName);
          if (!render.components || render.components.length === 0) {
            errors.push(`${routeName} has no components`);
          } else {
            const lastRow = render.components[render.components.length - 1];
            if (lastRow.components.length !== 3) {
              errors.push(`${routeName} last row has ${lastRow.components.length} buttons, expected 3 global buttons`);
            }
          }
        } catch (error) {
          errors.push(`Error rendering ${routeName}: ${error}`);
        }
      });
      
    } catch (error) {
      errors.push(`Global buttons validation error: ${error}`);
    }
    
    return { pass: errors.length === 0, errors };
  }
  
  private static validateResultsConformance(): { pass: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const requiredActions = ['More Info', 'Add to Wish List'];
    const resultRoutes = ['ByTitle.Results', 'ByAuthor.Results', 'DescribeBook.Results', 'Genre.Results'];
    
    resultRoutes.forEach(routeName => {
      const route = flowEngine.getRouteInfo(routeName);
      if (!route) {
        errors.push(`Results route ${routeName} not found`);
        return;
      }
      
      if (route.type !== 'results') {
        errors.push(`Route ${routeName} is not of type 'results'`);
        return;
      }
      
      requiredActions.forEach(requiredAction => {
        const hasAction = route.actions?.some(action => action.label === requiredAction);
        if (!hasAction) {
          errors.push(`Results route ${routeName} missing required action: ${requiredAction}`);
        }
      });
    });
    
    return { pass: errors.length === 0, errors };
  }
  
  private static validateNoResultsConformance(): { pass: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const noResultRoutes = ['ByTitle.NoResults', 'ByAuthor.NoResults', 'DescribeBook.NoResults', 'Genre.NoResults'];
    
    noResultRoutes.forEach(routeName => {
      const route = flowEngine.getRouteInfo(routeName);
      if (!route) {
        errors.push(`No results route ${routeName} not found`);
        return;
      }
      
      if (route.type !== 'no_results') {
        errors.push(`Route ${routeName} is not of type 'no_results'`);
        return;
      }
      
      const hasWishlistAction = route.actions?.some(action => 
        action.label.includes('Add') && action.label.includes('Wish List')
      );
      
      if (!hasWishlistAction) {
        errors.push(`No results route ${routeName} missing wishlist action`);
      }
    });
    
    return { pass: errors.length === 0, errors };
  }
  
  private static validateHelpMenuCoverage(): { pass: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const helpRoute = flowEngine.getRouteInfo('Help.Menu');
    if (!helpRoute) {
      errors.push('Help.Menu route not found');
      return { pass: false, errors };
    }
    
    const requiredHelpTopics = [
      'Message Admin',
      'How to Search by Title',
      'How to Search by Author', 
      'How to Describe Books',
      'How to Browse Genres',
      'How Downloads Work',
      'How do I search for more information about books?'
    ];
    
    requiredHelpTopics.forEach(topic => {
      const hasTopic = helpRoute.buttons?.some(button => button.label === topic);
      if (!hasTopic) {
        errors.push(`Help menu missing required topic: ${topic}`);
      }
    });
    
    return { pass: errors.length === 0, errors };
  }
  
  private static validateLegacyNavCleanup(): { pass: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // This is a basic check - in a real implementation, you would scan the codebase
    // for legacy navigation patterns and ensure they're not present
    
    const legacyPatterns = [
      'More Options', // Should be replaced with canonical flow
      'Audio Books',  // Should be part of canonical flow
      'Back' // Should only be used in specific contexts, not menu nav
    ];
    
    // For now, just verify that our main routes don't use legacy patterns
    const mainRoute = flowEngine.getRouteInfo('Main');
    if (mainRoute && mainRoute.buttons) {
      mainRoute.buttons.forEach(button => {
        if (legacyPatterns.includes(button.label)) {
          errors.push(`Main route contains legacy button: ${button.label}`);
        }
      });
    }
    
    // Verify exact button count and labels for Main route
    if (mainRoute && mainRoute.buttons) {
      const expectedButtons = [
        'By Title', 'By Author', 'Describe Book', 'Browse Genre',
        'New Chat', 'Other Commands', 'Help'
      ];
      
      if (mainRoute.buttons.length !== 7) {
        errors.push(`Main route has ${mainRoute.buttons.length} buttons, expected exactly 7`);
      }
      
      expectedButtons.forEach((expected, index) => {
        if (index < mainRoute.buttons!.length) {
          const actual = mainRoute.buttons![index].label;
          if (actual !== expected) {
            errors.push(`Main route button ${index + 1}: expected "${expected}", got "${actual}"`);
          }
        }
      });
    }
    
    return { pass: errors.length === 0, errors };
  }
  
  private static logReport(report: ValidationReport): void {
    logger.info('=== VALIDATION REPORT ===');
    logger.info(`Routes Count: ${report.routes_count}`);
    logger.info(`Links Validated: ${report.links_validated_count}`);
    logger.info(`Routes with Globals: ${report.routes_with_globals_count}`);
    logger.info(`Results Views Checked: ${report.results_views_checked}`);
    logger.info(`Wishlist Entry Points: ${report.wishlist_entry_points_verified}`);
    logger.info(`Help Topics Verified: ${report.help_topics_verified}`);
    logger.info(`Overall Result: ${report.pass ? 'PASS' : 'FAIL'}`);
    
    if (report.errors.length > 0) {
      logger.error('Validation Errors:');
      report.errors.forEach(error => logger.error(`  - ${error}`));
    }
    
    logger.info('=== END VALIDATION REPORT ===');
  }
  
  public static async runButtonByButtonTest(): Promise<{ pass: boolean; errors: string[] }> {
    const errors: string[] = [];
    const testUserId = 'button_test_user';
    
    logger.info('Running button-by-button functionality test...');
    
    try {
      ensureInstances();
      
      // 1. Test Main menu loads with exact 7 buttons
      flowEngine.navigateTo(testUserId, 'Main');
      const mainRender = flowEngine.renderRoute(testUserId);
      
      if (!mainRender.embeds || mainRender.embeds.length === 0) {
        errors.push('Main menu has no embed');
      }
      
      if (!mainRender.components || mainRender.components.length === 0) {
        errors.push('Main menu has no components');
      }
      
      // 2. Test each main button leads to correct route
      const mainRoute = flowEngine.getRouteInfo('Main');
      if (mainRoute && mainRoute.buttons) {
        mainRoute.buttons.forEach(button => {
          try {
            const result = flowEngine.handleButtonInteraction(testUserId, button.id);
            if (!result.route) {
              errors.push(`Button ${button.label} (${button.id}) does not navigate to any route`);
            } else {
              const targetRoute = flowEngine.getRouteInfo(result.route);
              if (!targetRoute) {
                errors.push(`Button ${button.label} navigates to non-existent route: ${result.route}`);
              }
            }
          } catch (error) {
            errors.push(`Error testing button ${button.label}: ${error}`);
          }
        });
      }
      
      // 3. Test global buttons work from any screen
      const testRoutes = ['Other.Menu', 'Help.Menu', 'Genre.Pick'];
      testRoutes.forEach(routeName => {
        try {
          flowEngine.navigateTo(testUserId, routeName);
          
          // Test each global button
          const globalButtons = ['new_chat', 'other_commands', 'help'];
          globalButtons.forEach(buttonId => {
            const result = flowEngine.handleButtonInteraction(testUserId, buttonId);
            if (!result.route) {
              errors.push(`Global button ${buttonId} doesn't work from ${routeName}`);
            }
          });
        } catch (error) {
          errors.push(`Error testing global buttons from ${routeName}: ${error}`);
        }
      });
      
      // 4. Test input flows
      const inputRoutes = ['ByTitle.Input', 'ByAuthor.Input', 'DescribeBook.Input'];
      inputRoutes.forEach(routeName => {
        try {
          flowEngine.navigateTo(testUserId, routeName);
          const render = flowEngine.renderRoute(testUserId);
          
          if (!render.embeds || render.embeds.length === 0) {
            errors.push(`Input route ${routeName} has no embed`);
          }
          
          // Should have global buttons
          if (!render.components || render.components.length === 0) {
            errors.push(`Input route ${routeName} has no components (should have globals)`);
          }
        } catch (error) {
          errors.push(`Error testing input route ${routeName}: ${error}`);
        }
      });
      
      logger.info(`Button-by-button test completed. ${errors.length} errors found.`);
      
    } catch (error) {
      errors.push(`Button test system error: ${error}`);
    }
    
    return { pass: errors.length === 0, errors };
  }
}

export const validationChecks = ValidationChecks;
