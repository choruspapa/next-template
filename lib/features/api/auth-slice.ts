import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getSession } from 'next-auth/react';
import type { Action, PayloadAction } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper';
import { RootState } from '@/lib/store';

const baseQuery = fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}`,
    prepareHeaders: async (headers, { getState }) => {
        const session = await getSession();
        if (session) {
            headers.set('Authorization', `Bearer ${session.accessToken}`);
        }
        return headers;
    }
});

function isHydrateAction(action: Action): action is PayloadAction<RootState> {
    return action.type === HYDRATE
  }

export const authSlice = createApi({
    reducerPath: 'auth',
    baseQuery,
    extractRehydrationInfo(action, { reducerPath }): any {
      if (isHydrateAction(action))
        return action.payload[reducerPath];
    },
    endpoints: (builder) => ({
        getUserInfo: builder.query<UserInfo, void>({
            query: () => '/protocol/openid-connect/userinfo',
            transformResponse: (result: any, meta) => {
                return {
                    displayName: result.displayName,
                    preferredUsername: result.preferred_username,
                    employeeId: result.employeeID,
                }
            }
        }),
    })
});

export const { useGetUserInfoQuery, endpoints } = authSlice;
