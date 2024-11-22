import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface SessionState {
  cookies: string
}

const initialState: SessionState = {
  cookies: '',
}

const aliSessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCookies: (state, action: PayloadAction<string>) => {
      state.cookies = action.payload;
    },
    clearCookies: (state) => {
      state.cookies = '';
    }
  }
})

export const { setCookies, clearCookies } = aliSessionSlice.actions;
export default aliSessionSlice.reducer;