import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./features/api/auth-slice";
import { alibabaSlice } from "./features/api/alibaba-slice";
import sessionReducer from './features/api/session-slice';

export const buildStore = () => {
    return configureStore({
        reducer: {
            [authSlice.reducerPath]: authSlice.reducer,
            [alibabaSlice.reducerPath]: alibabaSlice.reducer,
            alibabaSession: sessionReducer,
        },
        middleware: (defaultMiddleware) => 
            defaultMiddleware().concat(authSlice.middleware)
                .concat(alibabaSlice.middleware),
    });
}

export type AppStore = ReturnType<typeof buildStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];