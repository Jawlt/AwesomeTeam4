import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
  async login(req, res) {
    try {
      await handleLogin(req, res, {
        authorizationParams: {
          redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI, // Correct redirect URI after login
        },
      });
    } catch (error) {
      res.status(error.status || 500).end(error.message);
    }
  },
  secret: process.env.AUTH0_SECRET,  // Secure session encryption secret
  issuerBaseURL: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,  // Auth0 domain
  clientID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,  // Auth0 Client ID (frontend safe)
  clientSecret: process.env.AUTH0_CLIENT_SECRET,  // Secret for secure backend communication
  baseURL: process.env.AUTH0_BASE_URL,  // Your application's base URL
});
