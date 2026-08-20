const puppeteer = require('puppeteer');
const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
  request.url = request.url.replace(/^\/AI-Trip-Planner/, '');
  if (request.url === '') request.url = '/';
  return handler(request, response, { public: 'dist' });
});

server.listen(8081, async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating...');
  await page.goto('http://localhost:8081/AI-Trip-Planner/', { waitUntil: 'networkidle0' });
  console.log('Done.');
  
  await browser.close();
  server.close();
});
