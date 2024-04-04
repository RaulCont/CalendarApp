import { act, renderHook, waitFor } from "@testing-library/react";
import { authSlice } from "../../src/store";
import { initialState, notAuthenticatedState } from "../fixtures/authStates";
import { useAuthStore } from "../../src/hooks/useAuthStore";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { testUserCredentials } from "../fixtures/testUser";
import { calendarApi } from "../../src/api";

const getMockStore = (intialState) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
    preloadedState: {
      auth: { ...intialState },
    },
  });
};

describe("Pruebas en useAuthStore", () => {

    beforeEach( () => localStorage.clear() );

    test("debe de regresar los valores por defecto", () => {
        const mockStore = getMockStore({ ...initialState });

        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        });

        expect(result.current).toEqual({
            errorMessage: undefined,
            status: "checking",
            user: {},
            startLogin: expect.any(Function),
            startRegister: expect.any(Function),
            checkAuthToken: expect.any(Function),
            startLogout: expect.any(Function),
        });
    });

    test("satarLogin debe de realizar el login correctamente", async () => {
    
        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook(() => useAuthStore(), {
        wrapper: ({ children }) => (
            <Provider store={mockStore}>{children}</Provider>
        ),
        });

        await act(async () => {
            await result.current.startLogin(testUserCredentials);
        });

        const { errorMessage, status, user } = result.current;

        expect({ errorMessage, status, user }).toEqual({
        errorMessage: undefined,
        status: "authenticated",
        user: { name: "Test User", uid: "65fe0b60c0e70b851f35af23" },
        });

        expect(localStorage.getItem("token")).toEqual(expect.any(String));
        expect(localStorage.getItem("token-init-date")).toEqual(expect.any(String));
    
    });

    test("startLogin debe de fallar la autenticacion", async () => {
               
        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        });

        await act(async () => {
            await result.current.startLogin({
                email: "algo@google.com",
                password: "123456",
            });
        });
        const { errorMessage, status, user } = result.current;
        expect(localStorage.getItem('token')).toBe(null);
        expect({errorMessage, status, user}).toEqual({
            errorMessage: 'Credenciales incorrectas',
            status: 'not-authenticated',
            user: {}
        });

        await waitFor( 
            () => expect( result.current.errorMessage).toBe(undefined)
        );        

    });

    test('startRegister debe de crear un usuario', async() => {
        
        const newUser = {email: 'algo@google.com', password: '123456', name: 'Test User2'};

        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        });

        const spy = jest.spyOn( calendarApi, 'post' ).mockReturnValue({
            data: {
                ok: true,
                uid: "123456",
                name: 'Test User',
                token: 'algun token'
            }
        });

        await act(async () => {
            await result.current.startRegister(newUser);
        });
        
        const { errorMessage, status, user } = result.current;


        expect({errorMessage, status, user}).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: {name: 'Test User', uid: '123456', email: undefined, password: undefined}
        });

        spy.mockRestore();        
    });

    test('startRegister debe de fallar la creacion', async() => {
                
        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        });
       
        await act(async () => {
            await result.current.startRegister(testUserCredentials);
        });
        
        const { errorMessage, status, user } = result.current;

        expect({errorMessage, status, user}).toEqual({
            errorMessage: 'Un usuario ya existe con ese correo',
            status: 'not-authenticated',
            user: {}
        });
        
    });

    test('checkAuthToken debe de fallar si no hay token', async() => {
        
        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        });
       
        await act(async () => {
            await result.current.checkAuthToken();
        });

        
        const { errorMessage, status, user } = result.current;
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'not-authenticated',
            user: {}
        });

        
    });

    test('checkAuthToken debe de autenticar el usuario si hay un token', async() => {
        
        const { data } = await calendarApi.post('/auth', testUserCredentials);
        localStorage.setItem('token', data.token);

        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        });

        await act(async () => {
            await result.current.checkAuthToken();
        });
        
        const {errorMessage, status, user} = result.current;        
        
        expect({errorMessage, status, user}).toEqual({
            "errorMessage": undefined,
            "status": "authenticated",
            "user": {
                "name": "Test User",
                "email": undefined,
                "name": undefined,
                "password": undefined,
                "uid": "65fe0b60c0e70b851f35af23",
            }
        });
    });
});
