import NextAuth from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    // you can be more specific here with your types.
    account: any
    profile: any
    accessToken: any
    error: any
    // While we added the roles on profile, maybe you want an easier way to access? Group all realm/client roles?
    // You could ignore this completly.
    user: User
    roles: any
    expired?: boolean
  }

  interface Profile {
    // Could be realm, client, etc.
    realm_access: any
    resource_access: any
  }

  interface User {
    id: string
    name: string
  }
}

declare module 'next-auth/react' {
  interface RefreshableSession extends Session {
    accessToken?: string;
    error?: string;
  }
}
