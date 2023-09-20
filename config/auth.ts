import SequelizeAdapter, { models } from "@next-auth/sequelize-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { CookiesOptions, NextAuthOptions } from "next-auth";

import { sequelizeAdapter } from "@/db";

const nextAuthSeqAdapter = SequelizeAdapter(sequelizeAdapter, {
  models: {
    User: sequelizeAdapter.define("user", {
      ...models.User,
      //phoneNumber: DataTypes.STRING,
    }),
  },
});

// const authCookies: Partial<CookiesOptions> = {

//   // to store the JWT token
//   sessionToken: {
//     name: "next-auth.session-token",
//     options: {​
//       httpOnly: true,​
//       sameSite: "none",​
//       path: "/",​
//       domain: process.env.NEXT_PUBLIC_DOMAIN,​
//       secure: true,​
//   },
//   },

//   // default callback where you will be redirected after signIn/signOut
//   callbackUrl: {​
//     name: `next-auth.callback-url`,​
//     options: {​
//         ...​
//     },
// },​
// csrfToken: {​
//     name: "next-auth.csrf-token",​
//     options: {​
//     ...​
//     },​
// },
// }

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
const authOptions: NextAuthOptions = {

	adapter: nextAuthSeqAdapter,
	session: {
	  strategy: "jwt",
	},
	debug: false,
	// https://next-auth.js.org/providers/overview
	providers: [
	  GoogleProvider({
		clientId: process.env.GOOGLE_ID!,
		clientSecret: process.env.GOOGLE_SECRET!,
	  }),
	  // username pw auth
	// is intended to support use cases where you have an existing system you need to authenticate users against
	// can only be used if JSON Web Tokens are enabled for sessions
	// több CredentialsProvider is megadható []-ként
	// signIn -> authorize -> jwt -> session
	  CredentialsProvider({
	  id: "cred-1",
		  name: "Credentials",
		  credentials: {
			username: { label: "Username", type: "text", placeholder: "Enter your username" },
			password: { label: "Password", type: "password", placeholder: "Enter your password"},
		  },
		  async authorize(credentials, req) {
		// You need to provide your own logic here that takes the credentials
		// submitted and returns either a object representing a user or value
		// that is false/null if the credentials are invalid.
		// e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
		// You can also use the `req` object to obtain additional parameters
		// (i.e., the request IP address)
  
		//   const response = await fetch('...', {​
		//     ...​
		//     variables: {​
		//         email: credentials?.email,​
		//         password: credentials?.password,​
		//     },​
		// });
  
		// const res = await fetch("http://localhost:3000/api/auth/getuser", {
		//     method: 'POST',
		//     body: JSON.stringify(credentials),
		//     headers: { "Content-Type": "application/json" }
		//   })
		//   const user = await res.json()
		// if (res.ok && user) {
			 // Any object returned will be saved in `user` property of the JWT
		//   return user;
		// }
		// // If you return null then an error will be displayed advising the user to check their details.
		// return null
  
		// You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
		// return Promise.reject(new Error(data?.errors));
  
		// const {username,password} = credentials    
		//       const user = await api.auth({
		//           username,
		//           password,
		//       })
		// if (user) {
		//   return user
		// } else {
		//   return null
		   
		  // db user
		  const user = { id: "1", name: "testuser", password: "testpw", role: "admin" };
	
		  // check for credentials
			if (credentials?.username == user.name && credentials.password == user.password) {
			  return user;
			} else {
			  return null; // throw new Error("Invalid credentials")
			}
  
		  },
		}),
	],
  //   pages: {
  // 	signIn:"/auth/signin"  
  //   },
  // cookies: authCookies,
  //callbacks: {
  
	// to control if a user is allowed to sign in
	// When using the Credentials Provider the user object is the response returned from the authorize callback and the profile object is the raw body of the HTTP POST submission
	// async signIn({ user, account, profile, email, credentials }) {
	//   const isAllowedToSignIn = true
	//   if (isAllowedToSignIn) {
	//     return true
	//   } else {
	//     // Return false to display a default error message
	//     return false
	//     // Or you can return a URL to redirect to:
	//     // return '/unauthorized'
	//   }
	// }
  
	// is called anytime the user is redirected to a callback URL (e.g. on signin or signout)
	// By default only URLs on the same URL as the site are allowed, you can use the redirect callback to customise that behaviou
	// async redirect({ url, baseUrl }) {
	//   // Allows relative callback URLs
	//   if (url.startsWith("/")) return `${baseUrl}${url}`
	//   // Allows callback URLs on the same origin
	//   else if (new URL(url).origin === baseUrl) return url
	//   return baseUrl
	// }
  
	// is called whenever a JSON Web Token is created (i.e. at sign in) or updated (i.e whenever a session is accessed in the client)
	// Requests to /api/auth/signin, /api/auth/session and calls to getSession(), getServerSession(), useSession() will invoke this function, but only if you are using a JWT session
	// token expiry time is extended whenever a session is active
	// The arguments user, account, profile and isNewUser are only passed the first time this callback is called on a new session, after the user signs in. In subsequent calls, only token will be available
	// You can persist data such as User ID, OAuth Access Token in this token 
	// When using JSON Web Tokens the jwt() callback is invoked before the session() callback, so anything you add to the JSON Web Token will be immediately available in the session callback
	// async jwt({token, user, account}) {
	//   if (token || user) {
	//     token.userRole = "admin";
	//     return {...token};
  
	//  // Persist the OAuth access_token and or the user id to the token right after signin
	//  if (account) {
	//    token.accessToken = account.access_token
	//    token.id = profile.id
	//  }
  
	//   }
  
	  // if (account && success) {
	  //   return {
	  //   ...token,
	  //   user : user ,
	  //   accessToken: user.id            
	  // };  
	  // }
	  // return token;
  
	  // // first call of jwt function just user object is provided
	  // if (user?.email) {
	  //   return { ...token, ...user };
	  // }
	  // // on subsequent calls, token is provided and we need to check if it's expired
	  // if (token?.accessTokenExpires) {
	  //   if (Date.now() / 1000 < token?.accessTokenExpires) return { ...token, ...user };
	  // } else if (token?.refreshToken) return refreshAccessToken(token);
	  // return { ...token, ...user };
  
	//},
	// is called whenever a session is checked
	// By default, only a subset of the token is returned for increased security
	// If you want to make something available you added to the token, you have to explicitly forward it here to make it available to the client
	// getSession(), useSession(), /api/auth/session
	// db session -> user, jwt session -> token input
	// The session object is not persisted server side, even when using database sessions
	// async session({ session, token, user }) {   
  
	// if (Date.now() / 1000 > token?.accessTokenExpires && token?.refreshTokenExpires && Date.now() / 1000 > token?.refreshTokenExpires) {
	//   return Promise.reject({
	//     error: new Error("Refresh token has expired. Please log in again to get a new refresh token."),
	//   });
	// }
	// const accessTokenData = JSON.parse(atob(token.token.split(".")?.at(1)));
	// session.user = accessTokenData;
	// token.accessTokenExpires = accessTokenData.exp;
	// session.token = token?.token;
	// return Promise.resolve(session);
  
	
	// Send properties to the client, like an access_token and user id from a provider.
	// session.accessToken = token.accessToken
	// session.user.id = token.id
	
	//   session.user = token;  
	//   return session;
	// },
  //},
  };
  
  export { nextAuthSeqAdapter, authOptions };
  