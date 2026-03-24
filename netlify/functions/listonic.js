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

  const path = (event.queryStringParameters || {}).path || '/projects';
  const auth = event.headers.authorization || '';

  const options = {
    hostname: 'api.todoist.com',
    path: '/rest/v2' + path,
    method: event.httpMethod,
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: cors,
          body: data
        });
      });
    });
    req.on('error', (e) => {
      resolve({ statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) });
    });
    if (event.body) req.write(event.body);
    req.end();
  });
};
