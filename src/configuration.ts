export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  corsAllowedUrls: '*',
  shopify: {
    appProxy: {
      clientId: process.env.SHOPIFY_APP_PROXY_KEY,
      clientSecret: process.env.SHOPIFY_APP_PROXY_SECRET,
      scopes: [
        'read_customers',
        'write_customers',
        'read_orders',
        'write_orders',
        'write_products',
        'read_products',
        'write_draft_orders',
      ],
    },
  },
});
