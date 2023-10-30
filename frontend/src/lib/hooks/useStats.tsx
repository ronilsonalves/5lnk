export const getUserOverviewStats = async (userAccessToken: string, setStats: Function, setError: Function) => {
    try {
        const response = await fetch("/api/stats", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + userAccessToken,
        },
        });
        const data = await response.json();
        setStats(data);
    } catch (e) {
        if (e instanceof Error) {
        setError(e.message);
        setTimeout(() => {
            setError("");
        }, 1500);
        }
    }
};