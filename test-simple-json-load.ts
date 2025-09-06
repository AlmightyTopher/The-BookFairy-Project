import { readFileSync } from 'fs';
import { join } from 'path';

const configPath = join(process.cwd(), 'src', 'flow', 'bot_flow.json');
console.log('Trying to read:', configPath);

try {
  const rawData = readFileSync(configPath, 'utf-8');
  console.log('File read successfully! Length:', rawData.length);
  console.log('First 100 chars:', rawData.substring(0, 100));
  
  const parsed = JSON.parse(rawData);
  console.log('JSON parsed successfully!');
  console.log('Routes count:', Object.keys(parsed.routes).length);
  console.log('Global buttons count:', parsed.global_buttons.length);
  
} catch (error) {
  console.error('Error details:', error);
  console.error('Error type:', typeof error);
  console.error('Error constructor:', error.constructor.name);
  
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}
