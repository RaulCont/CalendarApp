
export const initialState = {
    status: 'checking', //authenticated not-authenticated
    user: {},
    errorMessage: undefined
}

export const authenticatedState = {
    status: 'authenticated', //authenticated not-authenticated
    user: {
        ui: 'abc',
        name: 'Camilo'
    },
    errorMessage: undefined
}

export const notAuthenticatedState = {
    status: 'not-authenticated', 
    user: {},
    errorMessage: undefined
}

