// netlify/functions/listonic.js
// Proxy voor Listonic API — lost CORS op zodat de browser app werkt

const https = require('https');

const LISTONIC_BASE = 'api.listonic.com';

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // Haal het pad op uit de query parameter
  // bijv. /api/listonic?path=/v3/user/login
  const params = event.queryStringParameters || {};
  const listonicPath = params.path || '/v3/lists';

  const options = {
    hostname: LISTONIC_BASE,
    path: listonicPath,
    method: event.httpMethod,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Listonic/5.0 (Android)',
      'Accept': 'application/json',
    }
  };

  // Stuur Authorization header door als die er is
  if (event.headers.authorization) {
    options.headers['Authorization'] = event.headers.authorization;
  }

  try {
    const body = event.body || null;
    const result = await httpsRequest(options, body);

    return {
      statusCode: result.status,
      headers: corsHeaders,
      body: typeof result.body === 'string' ? result.body : JSON.stringify(result.body)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Proxy fout: ' + err.message })
    };
  }
};
