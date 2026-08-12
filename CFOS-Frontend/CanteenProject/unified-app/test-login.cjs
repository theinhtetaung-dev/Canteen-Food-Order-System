
const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 8081,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Token:', json.token);
    const patchReq = http.request({
      hostname: 'localhost',
      port: 8081,
      path: '/api/orders/1/status?status=PREPARING',
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + json.token }
    }, (patchRes) => {
      let patchData = '';
      patchRes.on('data', d => patchData += d);
      patchRes.on('end', () => {
        console.log('Patch Status:', patchRes.statusCode);
        console.log('Patch Body:', patchData);
      });
    });
    patchReq.end();
  });
});
req.write(JSON.stringify({username: 'admin', password: 'password'}));
req.end();

