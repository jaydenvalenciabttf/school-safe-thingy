import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/:path*', 
};

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  // REPLACE 'testdomainname.xyz' with the actual site you want to mirror
  const targetHost = 'testdomainname.xyz'; 
  const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

  const response = await fetch(targetUrl, {
    headers: { 'User-Agent': req.headers.get('user-agent') || '' }
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  // This changes the text to hide from school filters
  html = html.replace(new RegExp(targetHost, 'gi'), url.host); 
  html = html.replace(/Games/gi, 'Classroom'); // Hides "Games"
  html = html.replace(/<title>.*<\/title>/i, `<title>Educational Resources</title>`);

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
