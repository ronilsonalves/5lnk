export const useTokens = async (setTokenError: Function, setApiToken: Function) => {
    try {
        const response = await fetch("/api/tokens", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        if (response.status === 200) {
            setApiToken(data);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            setApiToken("");
            setTokenError(error.message);
            setTimeout(() => {
                setTokenError("");
            }, 1500);
        };
    };
};