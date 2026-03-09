import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/:path*', // Apply to every page and asset
};

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const targetHost = 'testdomainname.xyz'; // The site you want to mirror
  const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': req.headers.get('user-agent') || '' }
    });

    // Handle non-HTML files (images, JS, CSS) normally
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    // Process HTML to hide keywords and fix links
    let html = await response.text();

    // 1. Hide the original site name from filters
    html = html.replace(new RegExp(targetHost, 'gi'), url.host); 
    
    // 2. Change "Red Flag" words to "Safe" words
    html = html.replace(/Games/gi, 'Projects');
    html = html.replace(/Unblocked/gi, 'Education');
    html = html.replace(/<title>.*<\/title>/i, `<title>Class Assignment - ${url.host}</title>`);

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (e) {
    return new NextResponse('Mirror Error', { status: 500 });
  }
}
