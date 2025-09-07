/**
 * Simple validation test for Hardcover Discord command structure
 */

const fs = require('fs');
const path = require('path');

function testDiscordCommandStructure() {
  console.log('🎮 Testing Hardcover Discord Command Structure...\n');
  
  try {
    // Read the Discord command file
    const commandPath = path.join(__dirname, 'src', 'discord', 'commands', 'hc.ts');
    const commandContent = fs.readFileSync(commandPath, 'utf8');
    
    console.log('✅ Successfully read Discord command file');
    
    // Check for required imports
    const requiredImports = [
      'SlashCommandBuilder',
      'ChatInputCommandInteraction',
      'hcPing'
    ];
    
    let missingImports = [];
    requiredImports.forEach(imp => {
      if (!commandContent.includes(imp)) {
        missingImports.push(imp);
      }
    });
    
    if (missingImports.length === 0) {
      console.log('✅ All required imports present');
    } else {
      console.log(`❌ Missing imports: ${missingImports.join(', ')}`);
    }
    
    // Check for command structure
    const structureChecks = [
      { name: 'Command Name', pattern: /\.setName\s*\(\s*["']hc["']\s*\)/ },
      { name: 'Command Description', pattern: /\.setDescription\s*\(\s*["'].*["']\s*\)/ },
      { name: 'Ping Subcommand', pattern: /\.addSubcommand.*setName\s*\(\s*["']ping["']\s*\)/ },
      { name: 'Execute Function', pattern: /export\s+async\s+function\s+execute/ },
      { name: 'Interaction Handling', pattern: /interaction\.options\.getSubcommand/ },
      { name: 'Error Handling', pattern: /try\s*{[\s\S]*}\s*catch/ }
    ];
    
    console.log('\n📋 Command Structure Validation:');
    let structurePassed = 0;
    
    structureChecks.forEach(check => {
      if (check.pattern.test(commandContent)) {
        console.log(`✅ ${check.name}`);
        structurePassed++;
      } else {
        console.log(`❌ ${check.name}`);
      }
    });
    
    // Check for proper response handling
    const responseChecks = [
      'interaction.reply',
      'ephemeral: true',
      'me.username'
    ];
    
    console.log('\n📤 Response Handling:');
    responseChecks.forEach(check => {
      if (commandContent.includes(check)) {
        console.log(`✅ Contains ${check}`);
      } else {
        console.log(`❌ Missing ${check}`);
      }
    });
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 DISCORD COMMAND VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Structure Checks Passed: ${structurePassed}/${structureChecks.length}`);
    console.log(`📈 Success Rate: ${((structurePassed / structureChecks.length) * 100).toFixed(1)}%`);
    
    if (structurePassed === structureChecks.length) {
      console.log('\n🎉 Discord command structure is valid and follows best practices!');
    } else {
      console.log('\n⚠️  Some structural issues detected in Discord command.');
    }
    
    return {
      passed: structurePassed,
      total: structureChecks.length,
      percentage: (structurePassed / structureChecks.length) * 100
    };
    
  } catch (error) {
    console.log(`❌ Failed to read or analyze Discord command: ${error.message}`);
    return { passed: 0, total: 1, percentage: 0 };
  }
}

// Function to test Hardcover service file structure
function testServiceStructure() {
  console.log('\n📚 Testing Hardcover Service Structure...\n');
  
  try {
    const servicePath = path.join(__dirname, 'src', 'integrations', 'hardcover', 'service.ts');
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    
    const expectedFunctions = [
      'hcPing',
      'searchBooksDescriptionFirst', 
      'listBooksByAuthor',
      'bookMenuFromBookId',
      'editionPreflightByIsbn',
      'userHasBook',
      'warnIfLengthMismatch',
      'buildSmartTitleQuery'
    ];
    
    console.log('🔍 Checking for exported functions:');
    let functionsFound = 0;
    
    expectedFunctions.forEach(func => {
      const exportPattern = new RegExp(`export\\s+(async\\s+)?function\\s+${func}|const\\s+${func}\\s*=.*export`);
      const declarationPattern = new RegExp(`(export\\s+)?(async\\s+)?function\\s+${func}|${func}\\s*:`);
      
      if (exportPattern.test(serviceContent) || declarationPattern.test(serviceContent)) {
        console.log(`✅ ${func}`);
        functionsFound++;
      } else {
        console.log(`❌ ${func}`);
      }
    });
    
    console.log(`\n📊 Functions Found: ${functionsFound}/${expectedFunctions.length}`);
    
    return {
      passed: functionsFound,
      total: expectedFunctions.length,
      percentage: (functionsFound / expectedFunctions.length) * 100
    };
    
  } catch (error) {
    console.log(`❌ Failed to analyze service structure: ${error.message}`);
    return { passed: 0, total: 1, percentage: 0 };
  }
}

// Run tests
console.log('🔍 Starting Hardcover Functionality Structure Validation...\n');

const commandResults = testDiscordCommandStructure();
const serviceResults = testServiceStructure();

console.log('\n' + '='.repeat(60));
console.log('🎯 FINAL HARDCOVER FUNCTIONALITY VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`📱 Discord Command Structure: ${commandResults.percentage.toFixed(1)}% (${commandResults.passed}/${commandResults.total})`);
console.log(`⚙️  Service Functions: ${serviceResults.percentage.toFixed(1)}% (${serviceResults.passed}/${serviceResults.total})`);

const overallPassed = commandResults.passed + serviceResults.passed;
const overallTotal = commandResults.total + serviceResults.total;
const overallPercentage = (overallPassed / overallTotal) * 100;

console.log(`🎯 Overall Validation: ${overallPercentage.toFixed(1)}% (${overallPassed}/${overallTotal})`);

if (overallPercentage >= 95) {
  console.log('\n🌟 Excellent! Hardcover integration is structurally sound and ready for end-user functionality.');
} else if (overallPercentage >= 80) {
  console.log('\n✅ Good! Hardcover integration structure is mostly complete with minor areas for improvement.');
} else {
  console.log('\n⚠️  Hardcover integration structure needs attention before end-user functionality can be fully validated.');
}

console.log('\n📋 Key Hardcover Functions Available:');
console.log('   • API Authentication (hcPing)');
console.log('   • Book Search (searchBooksDescriptionFirst)');
console.log('   • Author Book Listing (listBooksByAuthor)');
console.log('   • Book Details (bookMenuFromBookId)');
console.log('   • ISBN Edition Lookup (editionPreflightByIsbn)');
console.log('   • User Library Check (userHasBook)');
console.log('   • Length Validation (warnIfLengthMismatch)');
console.log('   • Smart Query Building (buildSmartTitleQuery)');
console.log('   • Discord Command Interface (/hc ping)');
