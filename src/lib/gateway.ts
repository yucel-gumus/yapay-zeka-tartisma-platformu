const gatewayBase = (): string => {
  const url =
    process.env.AI_API_URL ||
    process.env.GEMINI_GATEWAY_URL ||
    'https://api.yucelgumus.dev';
  return url.replace(/\/$/, '');
};

export const gatewayHeaders = (): HeadersInit => {
  const key = process.env.GATEWAY_CLIENT_API_KEY || process.env.CLIENT_API_KEY;
  if (!key) {
    throw new Error('GATEWAY_CLIENT_API_KEY is not configured');
  }
  return {
    'Content-Type': 'application/json',
    'X-API-Key': key,
  };
};

export const gatewayUrl = (path: string): string => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${gatewayBase()}${p}`;
};