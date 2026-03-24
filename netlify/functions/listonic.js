const https = require('https');

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }

  const params = event.queryStringParameters || {};
  const path = params.path || '/projects';
  const token = params.token || (event.headers.authorization || '').replace('Bearer ', '');

  const options = {
    hostname: 'api.todoist.com',
    path: '/api/v1' + path,
    method: event.httpMethod,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: cors, body: data });
      });
    });
    req.on('error', (e) => {
      resolve({ statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) });
    });
    if (event.body) req.write(event.body);
    req.end();
  });
};
```

Commit → dan test je met:
```
https://imaginative-empanada-61637f.netlify.app/.netlify/functions/listonic?path=/projects&token=b637cf1d66210628931915e1c694bdbd636d98
