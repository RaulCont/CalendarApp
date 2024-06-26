import { createSlice } from '@reduxjs/toolkit';
export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        status: 'checking', //authenticated not-authenticated
        user: {},
        errorMessage: undefined
    },
    reducers: {
        onChecking:  ( state ) => {
            state.status = 'checking',
            state.user = {},
            state.errorMessage = undefined;
        },
        onLogin: ( state, { payload } ) => {
            state.status = 'authenticated';
            // console.log(payload);
            state.user.name = payload.name;
            state.user.uid = payload.uid;
            state.user.email = payload.email;
            state.user.password = payload.password;
            state.errorMessage = undefined;
        },
        onLogout: ( state, { payload } ) => {
            state.status = 'not-authenticated',
            state.user = {},
            state.errorMessage = payload;
        },
        clearErrorMessage: (state) => {
            state.errorMessage = undefined;            
        }
    }
});
// Action creators are generated for each case reducer function
export const { onChecking, onLogin, onLogout, clearErrorMessage } = authSlice.actions;