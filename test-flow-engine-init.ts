import { join } from 'path';

// Temporarily disable validation to test basic loading
class SimpleFlowEngine {
  private config: any;

  constructor(configPath?: string) {
    try {
      const { readFileSync } = require('fs');
      const actualConfigPath = configPath || join(process.cwd(), 'src', 'flow', 'bot_flow.json');
      console.log('Loading config from:', actualConfigPath);
      
      const configData = readFileSync(actualConfigPath, 'utf-8');
      console.log('Config data length:', configData.length);
      
      this.config = JSON.parse(configData);
      console.log('JSON parsed, routes count:', Object.keys(this.config.routes).length);
      
      // Try basic validation
      console.log('Starting validation...');
      this.validateConfig();
      console.log('Validation passed!');
      
    } catch (error) {
      console.error('Error in constructor:', error);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  private validateConfig(): void {
    const { routes, global_buttons, validation } = this.config;
    
    console.log('Routes:', Object.keys(routes).length);
    console.log('Global buttons:', global_buttons.length);
    console.log('Validation config:', validation);
    
    // Check if validation is enabled
    if (validation.validate_links) {
      console.log('Link validation enabled, checking routes...');
      
      for (const [routeName, route] of Object.entries(routes)) {
        console.log(`Checking route: ${routeName}`);
        try {
          this.validateRouteLinks(routeName, route);
          console.log(`✓ Route ${routeName} validated`);
        } catch (error) {
          console.error(`✗ Route ${routeName} failed validation:`, error.message);
          throw error;
        }
      }
      console.log('All route links validated successfully');
    }
  }

  private validateRouteLinks(routeName: string, route: any): void {
    const checkRoute = (target: string, context: string) => {
      if (target && target !== 'Return.Previous' && !this.config.routes[target]) {
        throw new Error(`Invalid route link: ${routeName}.${context} -> ${target}`);
      }
    };

    console.log(`  Validating route ${routeName} (type: ${route.type})`);
    
    if (route.on) {
      console.log(`    Checking on: ${route.on}`);
      checkRoute(route.on, 'on');
    }
    if (route.on_submit) {
      console.log(`    Checking on_submit: ${route.on_submit}`);
      checkRoute(route.on_submit, 'on_submit');
    }
    if (route.on_select) {
      console.log(`    Checking on_select: ${route.on_select}`);
      checkRoute(route.on_select, 'on_select');
    }
    if (route.on_success) {
      console.log(`    Checking on_success: ${route.on_success}`);
      checkRoute(route.on_success, 'on_success');
    }
    if (route.on_error) {
      console.log(`    Checking on_error: ${route.on_error}`);
      checkRoute(route.on_error, 'on_error');
    }
    if (route.on_empty) {
      console.log(`    Checking on_empty: ${route.on_empty}`);
      checkRoute(route.on_empty, 'on_empty');
    }
    if (route.fallback) {
      console.log(`    Checking fallback: ${route.fallback}`);
      checkRoute(route.fallback, 'fallback');
    }

    if (route.buttons) {
      console.log(`    Checking ${route.buttons.length} buttons`);
      route.buttons.forEach((button: any) => {
        console.log(`      Button ${button.id} -> ${button.on}`);
        checkRoute(button.on, `button.${button.id}`);
      });
    }
    
    if (route.actions) {
      console.log(`    Checking ${route.actions.length} actions`);
      route.actions.forEach((action: any) => {
        if (action.on) {
          console.log(`      Action ${action.id} -> ${action.on}`);
          checkRoute(action.on, `action.${action.id}`);
        }
        if (action.on_success) {
          console.log(`      Action ${action.id} on_success -> ${action.on_success}`);
          checkRoute(action.on_success, `action.${action.id}.on_success`);
        }
      });
    }
    
    if (route.new_search?.on) {
      console.log(`    Checking new_search: ${route.new_search.on}`);
      checkRoute(route.new_search.on, 'new_search');
    }
    
    if (route.admin_button?.on) {
      console.log(`    Checking admin_button: ${route.admin_button.on}`);
      checkRoute(route.admin_button.on, 'admin_button');
    }
  }
}

// Test the simplified engine
try {
  console.log('Testing FlowEngine initialization...');
  const engine = new SimpleFlowEngine();
  console.log('✓ FlowEngine initialized successfully!');
} catch (error) {
  console.error('✗ FlowEngine initialization failed:', error.message);
}
