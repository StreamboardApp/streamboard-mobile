export const setIP = (ip) => ({
    type: 'SET_IP',
    ip
})

export const setPort = (port) => ({
    type: 'SET_PORT',
    port
})

export const setFirstRun = (trueFalse) => ({
    type: 'SET_FIRST_RUN',
    firstRun: trueFalse
})