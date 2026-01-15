import { NextResponse } from 'next/server'
 
export function middleware(request) {
  const token = request.cookies.get('token') || request.headers.get('Authorization')
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isPublicPage = request.nextUrl.pathname === '/'
  
  // Need to implement a real token check? 
  // For now, client-side often holds the token in localStorage, which middleware can't read directly unless in cookie.
  // Assuming the app uses localStorage for token (based on api.js seen earlier).
  // If so, middleware can't block easily without cookies.
  // API.js uses localStorage. Current architectural gap: Middleware runs on server/edge, localStorage is client.
  // We can't strictly protect routes via middleware if token is only in localStorage without an extra cookie.
  // However, I can use a client-side HOC or checking in layout.
  
  // Strategy Change: Since I saw api.js uses localStorage, I should rely on Client Component protection or migrate to cookies.
  // Migrating to cookies is better for security but might break existing flows if not careful.
  // Given user wants "security bagus", cookies are better. 
  // But let's check if the user is open to that. It's a "Significant design decision".
  // The user approved the plan which said "Protect routes requiring authentication", did not specify method.
  
  // For now, I will create the middleware but comment on the limitation or try to implement a cookie-based approach if easy.
  // Actually, 'api.js' shows: `localStorage.getItem('token')`.
  
  // Decision: I will stick to Client-Side protection for now in `layout.js` or individual pages, 
  // OR strictly for this task, I will leave middleware empty or simple logging, and improve `dashboard/layout.js` (if exists) or `dashboard/page.js` to check auth.
  // Wait, the plan said "Ensure `layout.js` or middleware properly redirects".
  // I'll stick to client side check for simplicity unless I refactor auth to cookies.
  // Refactoring to cookies involves backend changes (sending Set-Cookie).
  // I'll skip middleware for now and check `dashboard/page.js` to see if it checks auth.
  
  return NextResponse.next()
}

// See config
export const config = {
  matcher: '/dashboard/:path*',
}
