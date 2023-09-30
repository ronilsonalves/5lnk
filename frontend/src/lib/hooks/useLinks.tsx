export const userLinks = async (userAccessToken: string, setLinks: Function, setError: Function) => {
  try {
    const response = await fetch("/api/links", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAccessToken,
      },
    });
    const data = await response.json();
    setLinks(data);
  } catch (e) {
    if (e instanceof Error) {
      setError(e.message);
      setTimeout(() => {
        setError("");
      }, 1500);
    }
  }
};

export const getLinkStats = async (userAccessToken: string, setStats: Function, setError: Function) => {
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