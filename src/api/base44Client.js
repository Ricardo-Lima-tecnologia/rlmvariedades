import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

console.log('Base44 Client Configuration:', {
  appId: appId || 'NOT SET',
  appBaseUrl: appBaseUrl || 'NOT SET',
  functionsVersion: functionsVersion || 'NOT SET',
  hasToken: !!token
});

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});
