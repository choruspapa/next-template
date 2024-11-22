import NextAuth, { NextAuthConfig, Profile, Session, User } from 'next-auth';
// import GitHub from 'next-auth/providers/github';
import Keycloak from 'next-auth/providers/keycloak';
import { JWT } from 'next-auth/jwt';
import { jwtDecode } from 'jwt-decode';

const getRefreshedToken = async (token : JWT) : Promise<JWT> => {
  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: `${token.refreshToken}`,
      client_id: `${process.env.AUTH_KEYCLOAK_ID}`,
      client_secret: `${process.env.AUTH_KEYCLOAK_SECRET}`,
    });
    const url = `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    });

    const refreshedTokens = await response.json();
    if (!response.ok) throw refreshedTokens;

    return {
      ...refreshedTokens,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
};

const getRoles = (accessToken: string) : string[] => {
  let roles : string[] = [];
  const decoded = jwtDecode(accessToken);
  const profile = decoded as Profile;
  if (profile?.resource_access?.[`${process.env.AUTH_KEYCLOAK_ID}`]?.roles) {
    roles = profile.resource_access[`${process.env.AUTH_KEYCLOAK_ID}`].roles;
  }
  return roles;
}

export const getUser = (accessToken: string) : User => {
  const decoded = jwtDecode(accessToken);
  const profile = decoded as Profile;
  if (profile?.preferred_username) {
    return {
      name: profile.preferred_username,
      id: profile.sub!,
    }
  }
  return {};
}

export const authOptions: NextAuthConfig = {
  providers:[Keycloak({
    clientId: process.env.AUTH_KEYCLOAK_ID,
    clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
    issuer: process.env.AUTH_KEYCLOAK_ISSUER,
    checks: ["none"],
  })],
  secret: process.env.AUTH_SECRET,
  // custom login page
  // pages: {
  //   signIn: '/singin',
  // }
  // Keycloak Access Token, Refresh Token을 jwt.token에 저장
  callbacks: {
      async jwt({ token, account, profile, user }) {
        if (account) {
          token.accessToken = account.access_token ?? "";
          token.refreshToken = account.refresh_token ?? "";
          token.accessTokenExpires = Date.now() + account.expires_in! * 1000;
          token.roles = getRoles(account.access_token!);
        }

        if (Date.now() < Number(token.accessTokenExpires)) {
          return token;
        }
        
        const refreshed = await getRefreshedToken(token);
        return refreshed;
      },
      async session({session, token}: {session : Session, token: JWT}) {
        session.accessToken = token.accessToken;
        session.error = token.error;
        session.roles = token.roles;
        session.expired = Date.now() >= Number(token.accessTokenExpires);
        if (!session.expired && (!session.user?.name))
          session.user = getUser(token.accessToken as string);
        return session;
      }
  },
   
  // Keycloak Sign Out시에 Keycloak Session Delete 처리를 위한 함수 재정의
  events: {
      signOut: async (message : any) => {
        const uri: string = `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout`
 
        const encodedData = Buffer.from(
          `${process.env.AUTH_KEYCLOAK_ID}:${process.env.AUTH_KEYCLOAK_SECRET}`).toString("base64");
        const headers = {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", 
          "Authorization": `Basic ${encodedData}`,
        };
 
        await fetch(uri, {
            method: "POST",
            body: `refresh_token=${message.token.refreshToken}`,
            headers: headers,
        }).catch((reason: any) => {
          console.error("Sign out failed");
        });
      }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
