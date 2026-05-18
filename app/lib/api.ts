export const API_BASE_URL = "https://dinesh-sagel-backend.onrender.com";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  token?: string | null;
};

export async function apiRequest<T = Record<string, unknown>>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : "Something went wrong";
    throw new Error(message);
  }

  return data as T;
}

export function readToken(data: Record<string, unknown>) {
  const token =
    data.token ||
    data.accessToken ||
    (typeof data.data === "object" && data.data !== null && "token" in data.data ? data.data.token : null) ||
    (typeof data.data === "object" && data.data !== null && "accessToken" in data.data ? data.data.accessToken : null);

  return typeof token === "string" ? token : "";
}
