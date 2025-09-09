import { logger } from '../utils/logger.js';

export interface EnvRequirements {
  HARDCOVER_API_TOKEN: string;
  PROWLARR_URL: string;
  PROWLARR_API_KEY: string;
  PROWLARR_INDEXER_IDS?: string;
  MAM_INDEXER_ID?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConnectionTestResult {
  hardcover: boolean;
  prowlarr: boolean;
  overall: boolean;
  errors: string[];
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  const required = [
    'HARDCOVER_API_TOKEN',
    'PROWLARR_URL', 
    'PROWLARR_API_KEY'
  ];

  for (const varName of required) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Optional variables (warnings only)
  const optional = [
    'PROWLARR_INDEXER_IDS',
    'MAM_INDEXER_ID'
  ];

  for (const varName of optional) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      warnings.push(`Optional environment variable not set: ${varName}`);
    }
  }

  // URL format validation
  if (process.env.PROWLARR_URL) {
    try {
      new URL(process.env.PROWLARR_URL);
    } catch {
      errors.push('PROWLARR_URL is not a valid URL format');
    }
  }

  const result = {
    valid: errors.length === 0,
    errors,
    warnings
  };

  if (errors.length > 0) {
    logger.error({ errors }, 'Environment validation failed');
  } else {
    logger.info({ warnings: warnings.length }, 'Environment validation passed');
  }

  return result;
}

export async function testConnections(): Promise<ConnectionTestResult> {
  const errors: string[] = [];
  let hardcover = false;
  let prowlarr = false;

  // Test Hardcover GraphQL endpoint
  try {
    const token = process.env.HARDCOVER_API_TOKEN;
    if (!token) {
      errors.push('Cannot test Hardcover: no API token');
    } else {
      const response = await fetch('https://api.hardcover.app/v1/graphql', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`,
          'user-agent': 'BookFairy/1.0'
        },
        body: JSON.stringify({
          query: '{ __typename }' // Minimal introspection query
        })
      });

      if (response.ok) {
        hardcover = true;
        logger.info('Hardcover connection test passed');
      } else {
        errors.push(`Hardcover HTTP ${response.status}: ${response.statusText}`);
      }
    }
  } catch (error) {
    errors.push(`Hardcover connection failed: ${error}`);
  }

  // Test Prowlarr API endpoint
  try {
    const url = process.env.PROWLARR_URL;
    const apiKey = process.env.PROWLARR_API_KEY;
    
    if (!url || !apiKey) {
      errors.push('Cannot test Prowlarr: missing URL or API key');
    } else {
      const testUrl = `${url.replace(/\/$/, '')}/api/v1/search?query=test&limit=1`;
      const response = await fetch(testUrl, {
        headers: {
          'X-Api-Key': apiKey,
          'user-agent': 'BookFairy/1.0'
        }
      });

      if (response.ok || response.status === 400) {
        // 400 is acceptable - means API is responding but query might be malformed
        prowlarr = true;
        logger.info('Prowlarr connection test passed');
      } else {
        errors.push(`Prowlarr HTTP ${response.status}: ${response.statusText}`);
      }
    }
  } catch (error) {
    errors.push(`Prowlarr connection failed: ${error}`);
  }

  const result = {
    hardcover,
    prowlarr,
    overall: hardcover && prowlarr,
    errors
  };

  if (result.overall) {
    logger.info('All connection tests passed');
  } else {
    logger.error({ errors }, 'Connection tests failed');
  }

  return result;
}

export function emitBlockingChecklist(validation: ValidationResult): string {
  const checklist = [
    '🚨 BLOCKING ENVIRONMENT ISSUES DETECTED',
    '',
    'Required environment variables missing:',
    ...validation.errors.map(error => `  ❌ ${error}`),
    '',
    'Please set these variables in your .env file:',
    '  HARDCOVER_API_TOKEN=your_token_here',
    '  PROWLARR_URL=http://your-prowlarr-host:port',
    '  PROWLARR_API_KEY=your_api_key_here',
    '',
    'Optional variables (recommended):',
    '  PROWLARR_INDEXER_IDS=comma,separated,ids',
    '  MAM_INDEXER_ID=your_mam_indexer_id',
    '',
    'After setting these variables, restart the application.',
    ''
  ].join('\n');

  console.error(checklist);
  return checklist;
}

// Global english_only policy (P0.2)
export const ENGLISH_ONLY = true;

export function filterEnglishOnly<T extends { language?: string | string[] }>(items: T[]): T[] {
  if (!ENGLISH_ONLY) return items;
  
  return items.filter(item => {
    if (!item.language) return true; // No language info, assume OK
    
    if (Array.isArray(item.language)) {
      return item.language.some(lang => 
        lang.toLowerCase().includes('eng') || 
        lang.toLowerCase().includes('english')
      );
    }
    
    return item.language.toLowerCase().includes('eng') || 
           item.language.toLowerCase().includes('english');
  });
}