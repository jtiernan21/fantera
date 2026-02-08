export function createAuthFetch(getAccessToken: () => Promise<string | null>) {
  return async (url: string, options?: RequestInit) => {
    const token = await getAccessToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: { message: "Request failed" } }));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  };
}
