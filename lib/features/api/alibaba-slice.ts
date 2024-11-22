import { BaseQueryFn, FetchArgs, FetchBaseQueryError, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AppDispatch, RootState } from '@/lib/store';
import { setCookies } from './session-slice';
import type { Action, PayloadAction } from '@reduxjs/toolkit'
import { HYDRATE } from 'next-redux-wrapper';

const baseMainQuery = fetchBaseQuery({
  baseUrl: 'https://www.1688.com',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;    
    const cookies = state.alibabaSession.cookies;
    if (cookies) {
      headers.set('Cookie', cookies);
    }
    return headers;
  },
  credentials: 'include', // 쿠키를 포함하도록 설정
});

const baseQueryWithSession: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
 = async (arg, api, options) => {
  const result = await baseMainQuery(arg, api, options);
  if (result.meta?.response?.headers) {
    const cookies = result.meta.response.headers.get('set-cookie');
    if (cookies)
      (api.dispatch as AppDispatch)(setCookies(cookies));
  }
  return result;
}

function isHydrateAction(action: Action): action is PayloadAction<RootState> {
  return action.type === HYDRATE
}

export const alibabaSlice = createApi({
  reducerPath: 'alibaba',
  baseQuery: baseQueryWithSession,
  extractRehydrationInfo(action, { reducerPath }): any {
    if (isHydrateAction(action))
      return action.payload[reducerPath];
  },
  endpoints: (builder) => ({
    getData: builder.query<any, void>({
      query: () => ({
        url: '/',
        method: 'GET'
      }),
    }),
  })
});

export const { useGetDataQuery, endpoints } = alibabaSlice;