const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // In development, proxy API requests to the local server
  if (process.env.NODE_ENV === 'development') {
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://localhost:3000',
        changeOrigin: true,
      })
    );
  } else {
    // In production, proxy API requests to Netlify functions
    app.use(
      '/api',
      createProxyMiddleware({
        target: '/.netlify/functions/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '', // Remove /api prefix when forwarding to the function
        },
      })
    );
  }
};