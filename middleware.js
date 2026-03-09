import { NextResponse } from 'next/server';

export const config = {
  matcher: '/:path*', 
};

export async function middleware(req) {
  const url = new URL(req.url);
  const targetHost = 'testdomainname.xyz'; // The actual blocked site
  const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

  const response = await fetch(targetUrl, {
    headers: { 'User-Agent': req.headers.get('user-agent') || '' }
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  // --- STEP 1: FIX ABSOLUTE LINKS ---
  html = html.replaceAll(targetHost, url.host); 
  
  // --- EXISTING HIDING CODE ---
  html = html.replace(/Games/gi, 'Classroom'); 
  html = html.replace(/<title>.*<\/title>/i, `<title>Educational Resources</title>`);

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
