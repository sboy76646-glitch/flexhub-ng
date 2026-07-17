const environmentApiUrl =
  import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = (
  environmentApiUrl ||
  (import.meta.env.PROD
    ? "https://flexhub-ng.onrender.com"
    : "http://localhost:5000")
).replace(/\/+$/, "");

const DEFAULT_TIMEOUT = 30000;

export async function apiRequest(
  path,
  {
    token = "",
    timeout = DEFAULT_TIMEOUT,
    ...options
  } = {}
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    timeout
  );

  try {
    const normalizedPath = path.startsWith("/")
      ? path
      : `/${path}`;

    const response = await fetch(
      `${API_BASE_URL}${normalizedPath}`,
      {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
          ...options.headers,
        },
      }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        data.message ||
          `Request failed with status ${response.status}.`
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "The server took too long to respond. Please wait a moment and try again."
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Check your internet connection and try again."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}