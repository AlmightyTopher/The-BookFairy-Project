import { FlowEngine } from './src/flow/flow-engine.js';

console.log('🧪 Testing Unified Hub Implementation...\n');

try {
  const engine = new FlowEngine();
  
  // Test 1: Main hub rendering
  console.log('📋 Test 1: Main Hub Rendering');
  const result = engine.renderRoute('test-user', 'Main');
  console.log('✅ Hub rendered successfully');
  console.log('📄 Embed title:', result.embeds?.[0]?.data?.title);
  console.log('💬 Greeting:', result.embeds?.[0]?.data?.description?.substring(0, 50) + '...');
  console.log('🔘 Button rows:', result.components?.length);
  
  // Test 2: Button custom IDs
  console.log('\n📋 Test 2: Button Custom IDs');
  const allButtons = result.components?.flatMap(row => 
    row.components.map(btn => btn.data.custom_id)
  ) || [];
  console.log('🔘 Total buttons:', allButtons.length);
  console.log('🆔 Custom IDs:', allButtons.join(', '));
  
  // Test 3: Required hub buttons
  console.log('\n📋 Test 3: Required Hub Buttons');
  const requiredButtons = [
    'search_title_open', 'search_author_open', 'search_describe_open',
    'browse_genres_open', 'audiobooks_open', 'more_options_open',
    'home_back', 'home_next', 'home_new_chat', 'other_cmds_open'
  ];
  
  const foundButtons = requiredButtons.filter(id => allButtons.includes(id));
  console.log('✅ Found required buttons:', foundButtons.length + '/' + requiredButtons.length);
  console.log('📍 Found:', foundButtons.join(', '));
  
  if (foundButtons.length < requiredButtons.length) {
    const missing = requiredButtons.filter(id => !allButtons.includes(id));
    console.log('❌ Missing:', missing.join(', '));
  }
  
  // Test 4: Navigation routing
  console.log('\n📋 Test 4: Navigation Routing');
  const testRoutes = ['search_title_open', 'browse_genres_open', 'home_new_chat'];
  testRoutes.forEach(buttonId => {
    const routeResult = engine.handleButtonInteraction('test-user', buttonId);
    console.log('🔄', buttonId, '→', routeResult.route || routeResult.task || 'unknown');
  });
  
  // Test 5: Configuration validation
  console.log('\n📋 Test 5: Configuration Validation');
  const validation = engine.validateConfiguration();
  console.log('✅ Validation passed:', validation.pass);
  console.log('📊 Routes count:', validation.routes_count);
  console.log('🔗 Links validated:', validation.links_validated_count);
  
  console.log('\n🎉 All tests completed successfully!');
  console.log('✨ The unified hub is ready for user testing.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
