const https = require('https');
const qs = require('querystring');
const { promises: { readFile, writeFile } } = require('fs');

const fetch = (options, data) => new Promise((resolve, reject) => {
  const req = https.request(options, res => {
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
    res.on('error', reject);
  });
  if (data) req.write(data);
  req.end();
});

(async () => {
  const { access_token } = await fetch({
    method: 'POST',
    hostname: 'account.withings.com',
    path: '/oauth2/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  }, qs.stringify({
    'grant_type': 'refresh_token',
    'client_id': process.env.WITHINGS_CLIENT,
    'client_secret': process.env.WITHINGS_SECRET,
    'refresh_token': process.env.WITHINGS_REFRESH_TOKEN,
  }));
  const data = await fetch({
    method: 'GET',
    hostname: 'wbsapi.withings.net',
    path: '/measure?meastype=1&category=1&action=getmeas&startdate=1592807353',
    headers: {
      Authorization: `Bearer ${access_token}`
    },
  });
  const html = await readFile('./build/index.html', 'utf8');

  const values = data.body.measuregrps.map(group => group.measures[0].value).reverse();
  const max = Math.max(...values);
  const min = Math.min(...values) - 10000;
  console.log(values);
  const polygon = ['0 0', ...values.map((value, index) => `${index / (values.length - 1) * 100}% ${(value - min) / (max - min) * 100}%`), '100% 0'];
  await writeFile('./build/index.html', html.replace('\'%WITHINGS%\'', polygon.join()));
})();
