import { NextResponse } from 'next/server';

export const config = {
  matcher: '/:path*', 
};

export async function middleware(req) {
  const url = new URL(req.url);
  
  // REPLACE 'testdomainname.xyz' with the actual site you want to mirror
  const targetDomain = 'testdomainname.xyz'; 
  const targetUrl = new URL(url.pathname + url.search, `https://${targetDomain}`).toString();

  try {
    // --- STEP 2: STEALTH HEADERS ---
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': `https://${targetDomain}/`,
      }
    });

    const contentType = response.headers.get('content-type') || '';

    // If it's NOT a webpage (like an image), just pass it through
    if (!contentType.includes('text/html')) {
      return response;
    }

    // If it IS a webpage, modify the text to hide from school filters
    let html = await response.text();

    // Fix Absolute Links & Hide "Red Flag" words
    html = html.replaceAll(targetDomain, url.host);
    html = html.replaceAll(`https://${targetDomain}`, `https://${url.host}`);
    html = html.replace(/Games/gi, 'Projects');
    html = html.replace(/<title>.*<\/title>/i, `<title>Classroom Resources - ${url.host}</title>`);

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (err) {
    return new NextResponse(`Mirror Error: ${err.message}`, { status: 500 });
  }
}
