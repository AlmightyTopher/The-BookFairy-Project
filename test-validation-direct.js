// Direct validation test script
import { ValidationChecks } from './src/flow/validation-checks.js';
import { FlowEngine } from './src/flow/flow-engine.js';
import { join } from 'path';

async function runValidation() {
  console.log('Current working directory:', process.cwd());
  console.log('Looking for bot_flow.json at:', join(process.cwd(), 'src', 'flow', 'bot_flow.json'));

  try {
    // Try to create a flow engine with explicit path
    const configPath = join(process.cwd(), 'src', 'flow', 'bot_flow.json');
    console.log('Attempting to create FlowEngine with path:', configPath);
    
    const flowEngine = new FlowEngine(configPath);
    console.log('FlowEngine created successfully!');
    
    // Run validation checks
    console.log('\n=== Running Validation Checks ===');
    const report = ValidationChecks.runAllChecks();
    console.log('Validation Report:', JSON.stringify(report, null, 2));
    
    console.log('\n=== Running Button-by-Button Tests ===');
    const buttonTest = await ValidationChecks.runButtonByButtonTest();
    console.log('Button Test Report:', JSON.stringify(buttonTest, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

runValidation();
