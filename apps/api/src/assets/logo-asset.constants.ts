export const COMPANY_LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const COMPANY_LOGO_ALLOWED_CONTENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

export const COMPANY_LOGO_EXTENSIONS = new Map<string, string>([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);
