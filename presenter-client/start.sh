#!/bin/sh

# Get the SERVER_HOST from environment variable, default to localhost
SERVER_HOST=${SERVER_HOST:-localhost}

# Create a JavaScript configuration file
cat > /usr/share/nginx/html/config.js << EOF
window.APP_CONFIG = {
  SERVER_URL: 'http://${SERVER_HOST}:3000'
};
EOF

# Start nginx
nginx -g 'daemon off;'