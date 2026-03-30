/**
 * Locale Middleware
 * Detects Accept-Language header and x-vibehealth-lang override
 * Sets locale on context for route handlers
 */

import type { Context, Next } from 'hono';

/**
 * Extract locale from Accept-Language header
 * e.g., "fr-FR,fr;q=0.9,en;q=0.8" -> "fr"
 */
function parseAcceptLanguage(header: string | undefined): string {
  if (!header) return 'en';
  
  const languages = header.split(',').map(lang => {
    const [code] = lang.trim().split(';');
    return code.split('-')[0].toLowerCase();
  });

  // Support en, fr (add more as needed)
  const supported = new Set(['en', 'fr']);
  return languages.find(lang => supported.has(lang)) || 'en';
}

/**
 * Middleware to detect and set locale on context
 */
export async function localeMiddleware(c: Context, next: Next) {
  // Check for override header or query param
  let locale = c.req.query('lang') || c.req.header('x-vibehealth-lang');

  // Fall back to Accept-Language header
  if (!locale) {
    const acceptLanguage = c.req.header('accept-language');
    locale = parseAcceptLanguage(acceptLanguage);
  }

  // Validate: only allow en or fr for now
  const validLocales = new Set(['en', 'fr']);
  if (!validLocales.has(locale)) {
    locale = 'en';
  }

  // Set on context
  c.set('locale', locale);

  // Continue
  await next();
}

/**
 * Get locale from context
 */
export function getLocale(c: Context): string {
  return (c.get('locale') as string | undefined) || 'en';
}
