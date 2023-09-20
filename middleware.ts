import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { userAgent } from "next/server";

//import { withAuth } from "next-auth/middleware"
import { getToken } from "next-auth/jwt";

import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth/next";

// ez replaceli a next js middlewarejét és csak akkor futtatja ha be van jelentkezve a user
// export default withAuth(
// 	// `withAuth` augments your `Request` with the user's token.
// 	function middleware(req) {
// 	  console.log("req.nextauth.token")
// 	  console.log(req.nextauth.token)
// 	},
// 	{
// 	  callbacks: {
// 		authorized: () => true, // ({ token }) => token?.role === "admin",
// 	  },
// 	}
//   )

// Next JS middleware uses Edge as driver
// runs on page, api, file loads
// examples of Edge functions - https://github.com/vercel/examples/tree/main/edge-functions
export async function middleware(request: NextRequest) {
  const requestedPath = request.nextUrl.pathname;
  console.log("middleware call, requestedUrl: " + requestedPath);

  // Ignore files
  if (requestedPath.includes(".")) {
    //  || requestedPath.startsWith("/api")
    return NextResponse.next();
  }

  // get country code
  const country = request.geo?.country || "US";
  console.log("middleware call, country: " + country);

  // detect mobile users
  const { device } = userAgent(request);
  console.log("middleware call, device: " + JSON.stringify(device, null, 2));
  // ... && device.type === 'mobile'

  // get session user token
  const token = await getToken({
    req: request,
    //secret: process?.env?.NEXTAUTH_SECRET,
    //cookieName: ACCESS_TOKEN, // next-auth.session-token
  });

  // user logged in
  if (token) {
    console.log("JSON Web Token", JSON.stringify(token, null, 2));

    // ez nemigen kell a getToken-hez
    // user token expired
    // if (token?.token && Date.now() / 1000 < token?.accessTokenExpires) {
    // 	return NextResponse.redirect("/login");
    //   }

    // if logged in and '/' -> /notes
    if (requestedPath == "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/notes";
      return NextResponse.redirect(url);
    }

    // if login page -> notes
    if (requestedPath.startsWith("/api/auth/signin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/notes";
      return NextResponse.redirect(url);
    }
  }

  // user not logged in
  else {

  // sign out route -> "/"
  if (requestedPath.startsWith("/api/auth/signout")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

	// protected pages

	  // '/notes' -> login page
    if (requestedPath == "/notes") {
		const url = request.nextUrl.clone();
		url.pathname = "/api/auth/signin";
		return NextResponse.redirect(url);
	  }

  }

  return NextResponse.next();
}

//export const config = { matcher: ["/", "/other_page"] }  // only run this at these pages, ha ezt kivesszük minden oldalon lefut
// '/articles/:path*' - behind articles pages

/*
---------------- Middleware tasks --------------------------------

-------------------get header
const authorizationToken = req.headers.authorization;

-------------------modify headers
const requestHeaders = new Headers(request.headers)
requestHeaders.set('x-hello-from-middleware1', 'hello')
const response = NextResponse.next({
 	request: {
 	  // New request headers
 	  headers: requestHeaders,
 	},
   })
response.headers.set('x-hello-from-middleware2', 'hello')

-------------------access, modify cookies
Cookies are regular headers. On a Request, they are stored in the Cookie header. On a Response they are in the Set-Cookie header
// request
let cookie = request.cookies.get('nextjs')
console.log(cookie) // => { name: 'nextjs', value: 'fast', Path: '/' }
const allCookies = request.cookies.getAll()
console.log(allCookies) // => [{ name: 'nextjs', value: 'fast' }]
// response
const response = NextResponse.next()
response.cookies.set('vercel', 'fast')
response.cookies.set({
	name: 'vercel',
	value: 'fast',
	path: '/',
})
cookie = response.cookies.get('vercel')

-------------------set, get query parameters
loginUrl.searchParams.set('from', request.nextUrl.pathname)

-------------------clone url
By cloning nextUrl in this way, we can preserve any parts of the original URL that aren't being changed, such as query strings, or subdomains, and only modify what we need	
if (request.nextUrl.pathname === '/2019') {
	const url = request.nextUrl.clone()
	url.pathname = '/2022'
	return NextResponse.redirect(url)
}

-------------------rewrite
Rewrites allow you serve a page at one location, whilst displaying the URL of another. They're handy for tidying up messy URLs, or for using subdomains to separate different sections within the same website.
In this example, we're rewriting beta.example.com to example.com/beta
az url-t írom át de a content marad az eredeti url-é

checking for visits on the hostname beta.example.com, and then serving example.com/beta instead. We're doing this by once again modifying a cloned nextUrl, changing the hostname, and adding /beta to the start of the current pathname.
const hostname = request.headers.get('host')
if (hostname === 'beta.example.com') {
	const url = request.nextUrl.clone()
	url.hostname = 'example.com'
	url.pathname = '/beta' + url.pathname
	return NextResponse.rewrite(url)
}

-------------------access api with a header secret key

Preventing access to files and directories is very simple with edge functions. In this example, all API routes are blocked unless a custom secret-key header is passed
const secretKey = 'artichoke'
if (request.nextUrl.pathname === '/api/query') {
	const headerKey = request.headers.get('secret-key')

	// If secret keys match, allow access
	if (headerKey === secretKey) {
	  return NextResponse.next()
	}

	// Otherwise, redirect to your custom error page
	const url = request.nextUrl.clone()
	url.pathname = '/unauthorised'
	return NextResponse.redirect(url)
  }

call with header secret
const result = await fetch('https://example.com/api/query', {
headers: {
	'secret-key': 'artichoke'
}
})

-------------------count page loads
it will allow us to run asynchronous code after the rest of the function has completed. Put simply, we won't add any additional delay by the database call because we'll process it after the user has begun loading the page
event.waitUntil(
	(async () => {
	  // Add view to your database
	  // ...
	})()
)

-------------------set the theme by the location of the user
https://www.ctnicholas.dev/articles/dark-mode-by-sunlight
setting the current theme as a cookie, which we'll then retrieve client-side. We're also checking to see if the theme is already set, and skipping the function if it is
import SunCalc from 'suncalc'
Skip if theme already set
if (request.cookies.get('theme')) {
	return NextResponse.next()
  }
Get location
const { longitude = 0, latitude = 0 } = request.geo

Get theme (explanation in related article below)
const now = new Date()
const { sunrise, sunset } = SunCalc.getTimes(now, longitude, latitude)
let mode = ''
if (now < sunrise || now > sunset) {
  mode = 'dark'
} else {
  mode = 'light'
}

Set cookie and continue
const response = new NextResponse()
response.cookies.set('theme', mode)
return response

return NextResponse.redirect(new URL('/home', request.url))

*/
