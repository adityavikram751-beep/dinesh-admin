export const API_BASE_URL =
  "https://dinesh-sagel-backend.onrender.com";

// ================= TYPES =================

export type ApiOptions = {
  method?:
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";

  body?:
    | Record<
        string,
        unknown
      >
    | FormData;

  token?: string | null;
};

// ================= API REQUEST =================

export async function apiRequest<
  T = Record<
    string,
    unknown
  >
>(
  path: string,

  options: ApiOptions = {}
): Promise<T> {
  // ================= TOKEN =================

  const savedToken =
    typeof window !==
    "undefined"
      ? localStorage.getItem(
          "fitadmin_token"
        )
      : null;

  const token =
    options.token ||
    savedToken;

  // ================= CHECK FORMDATA =================

  const isFormData =
    options.body instanceof
    FormData;

  // ================= HEADERS =================

  const headers: HeadersInit =
    {};

  // JSON only if NOT FormData

  if (!isFormData) {
    headers[
      "Content-Type"
    ] =
      "application/json";
  }

  // TOKEN

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // ================= BODY =================

  let requestBody:
    | BodyInit
    | undefined;

  if (isFormData) {
    requestBody =
      options.body as FormData;
  } else if (
    options.body
  ) {
    requestBody =
      JSON.stringify(
        options.body
      );
  }

  // ================= FETCH =================

  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        method:
          options.method ||
          "GET",

        headers,

        body: requestBody,
      }
    );

  // ================= RESPONSE =================

  const text =
    await response.text();

  // IMPORTANT 😄
  console.log(
    "RAW RESPONSE =>",
    text
  );

  let data: any = {};

  // ================= SAFE JSON =================

  try {
    data = text
      ? JSON.parse(text)
      : {};
  } catch {
    data = {
      message:
        text ||
        "Server error",
    };
  }

  // ================= ERROR =================

  if (!response.ok) {
    console.log(
      "API ERROR =>",
      data
    );

    throw new Error(
      data?.message ||
        "Server error"
    );
  }

  return data as T;
}