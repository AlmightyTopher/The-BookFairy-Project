import { generateLlmResponse } from './ollama-client';
import { config } from '../config/config';
import { IntentClassificationSchema } from '../types/schemas';
import { logger } from '../utils/logger';
import { parseWithRules } from './rule-parser';

const INTENT_PROMPT_TEMPLATE = `You are a strict JSON-only book request classifier. Temperature 0, top_p 0.1. Analyze:

"{query}"

Rules:
1. Return exactly one JSON object
2. Stop immediately after the closing brace
3. If confidence < 0.6, use UNKNOWN intent
4. Never invent metadata
5. Leave unknown fields blank

Available intents with confidence thresholds:
FIND_SIMILAR: 0.8 - explicit "like X", "similar to"
FIND_BY_TITLE: 0.9 - exact title match
FIND_BY_AUTHOR: 0.9 - exact author match
FIND_BY_METADATA: 0.7 - clear descriptors
GET_AUTHOR_MORE: 0.9 - explicit author request
GET_METADATA: 0.8 - explicit book details
GET_SUMMARY: 0.8 - explicit synopsis
UNKNOWN: < 0.6 - insufficient signals

Only respond with a JSON object following this exact schema:
{
  "intent": one of the above intents,
  "confidence": 0.0 to 1.0,
  "seed_book": {
    "title": "",
    "author": "",
    "series": "",
    "isbn": "",
    "publisher": "",
    "year": "",
    "audience": "children" | "middle-grade" | "YA" | "adult" | "academic" | "general",
    "format": "novel" | "picture_book" | "textbook" | "comic" | "graphic_novel" | "short_story_collection" | "anthology" | "reference" | "poetry" | "audiobook",
    "genre": "",
    "subgenres": [],
    "themes": [],
    "tone_style": [],
    "notable_features": []
  }
}

Extract known details but leave fields blank if uncertain. Never invent ISBNs or publishers.
For "more books by Author", set only author and leave title blank.
Do not include any other text, only the JSON object.
`;

export async function classifyIntent(query: string) {
  const prompt = INTENT_PROMPT_TEMPLATE.replace('{query}', query);

  try {
    const response = await generateLlmResponse(prompt, config.ollama.classifyModel);
    logger.info({ rawResponse: response }, 'Raw LLM response received');
    
    // Try multiple JSON extraction methods
    let jsonString = '';
    
    // Method 1: Extract JSON from response using regex
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    } else {
      // Method 2: Look for lines that start with { and end with }
      const lines = response.split('\n');
      const jsonLines = lines.filter(line => line.trim().startsWith('{') || line.trim().endsWith('}') || line.includes('"intent"'));
      jsonString = jsonLines.join('');
    }
    
    if (!jsonString) {
      throw new Error('No JSON found in LLM response');
    }
    
    logger.info({ extractedJson: jsonString }, 'Extracted JSON from LLM response');
    
    // Clean up common JSON issues
    jsonString = jsonString
      .replace(/\/\/.*$/gm, '')  // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove multi-line comments
      .replace(/'/g, '"')  // Replace single quotes with double quotes
      .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":');  // Add quotes around unquoted keys

    const parsed = JSON.parse(jsonString);
    return IntentClassificationSchema.parse(parsed);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        { 
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }, 
          query 
        }, 
        'Failed to classify intent using LLM'
      );
    } else {
      logger.error({ error, query }, 'Failed to classify intent with unknown error type');
    }

    // Try the rule-based parser as a fallback
    logger.info({ query }, 'Falling back to rule-based parser');
    return parseWithRules(query);
  }
}
