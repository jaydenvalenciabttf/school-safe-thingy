import { NextResponse } from 'next/server';

export const config = {
  matcher: '/:path*', 
};

export async function middleware(req) {
  const url = new URL(req.url);
  
  // REPLACE 'testdomainname.xyz' with the actual site you want to mirror
  const targetDomain = 'testdomainname.xyz'; 
  
  // This fixes the "invalid URL parse error" by building a clean URL
  const targetUrl = new URL(url.pathname + url.search, `https://${targetDomain}`).toString();

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': req.headers.get('user-agent') || '',
      }
    });

    const contentType = response.headers.get('content-type') || '';

    // If it's NOT a webpage (like an image or a game file), just pass it through
    if (!contentType.includes('text/html')) {
      return response;
    }

    // If it IS a webpage, we modify the text to hide from school filters
    let html = await response.text();

    // 1. Fix Absolute Links (Stops the "Error from testdomain.xyz" on iPad)
    html = html.replaceAll(targetDomain, url.host);
    html = html.replaceAll(`https://${targetDomain}`, `https://${url.host}`);

    // 2. Hide "Red Flag" words from the iPad's filter
    html = html.replace(/Games/gi, 'Projects');
    html = html.replace(/Unblocked/gi, 'Educational');
    
    // 3. Change the Tab Title
    html = html.replace(/<title>.*<\/title>/i, `<title>Classroom Resources - ${url.host}</title>`);

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (err) {
    return new NextResponse(`Mirror Error: ${err.message}`, { status: 500 });
  }
}
