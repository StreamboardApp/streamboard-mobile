const initialState = {
    ip: '',
    port: 6840,
    firstRun: true
}

const applicationReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_IP": {
            return {
                ...state,
                ip: action.ip
            }
        }

        case "SET_PORT": {
            return {
                ...state,
                port: action.port
            }
        }

        case "SET_FIRST_RUN": {
            return {
                ...state,
                firstRun: action.firstRun
            }
        }

        default: {
            return state
        }
    }
}

export default applicationReducer