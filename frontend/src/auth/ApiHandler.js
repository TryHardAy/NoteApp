import keycloak from "./keycloak";

const backendURL = process.env.REACT_APP_BACKEND_URL;

const RefreshToken = async () => {
    try {
        // Spróbuj odświeżyć token
        await keycloak.updateToken(60);
    } catch (error) {
        // Jeśli token nie może zostać odświeżony, wyloguj i zaloguj ponownie
        await keycloak.logout();
        await keycloak.login();
    }
};

export const ApiCall = async (options) => {
    console.log(`${options.method} ${options.url}`);
    await RefreshToken();
    const token = keycloak.token;
    const data = options.data ? JSON.stringify(options.data) : undefined;

    const response = await fetch(`${backendURL}${options.url}`, {
        method: options.method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: data,
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
};