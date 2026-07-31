import { globals } from "@/config/globals";
import type {
  Recipe,
  RecipeListPage,
  RecipeSortOrder,
  RecipeWriteInput,
} from "@/lib/recipes";

export class BackendApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export interface RegisterPayload {
  username: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email?: string;
  phone_number?: string;
  agreed_to_terms: boolean;
  email_subscription_opt_in: boolean;
}

export interface BackendUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string | null;
  phone_number: string | null;
  email_subscription_opt_in: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

/** Friendly, user-facing message for non-validation backend/network failures. */
const GENERIC_ERROR_MESSAGE = "Something went wrong on our end. Please try again in a moment.";

async function parseErrorResponse(response: Response): Promise<BackendApiError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return new BackendApiError(response.status, GENERIC_ERROR_MESSAGE);
  }

  if (response.status === 422 && body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (Array.isArray(detail)) {
      const fieldErrors: Record<string, string> = {};
      for (const item of detail) {
        const loc = item?.loc as unknown[] | undefined;
        const field = Array.isArray(loc) ? loc[loc.length - 1] : undefined;
        if (typeof field === "string" && typeof item?.msg === "string") {
          fieldErrors[field] = item.msg.replace(/^Value error, /, "");
        }
      }
      return new BackendApiError(response.status, "Please fix the highlighted fields.", fieldErrors);
    }
  }

  if (body && typeof body === "object" && "detail" in body && typeof (body as { detail: unknown }).detail === "string") {
    return new BackendApiError(response.status, (body as { detail: string }).detail);
  }

  return new BackendApiError(response.status, GENERIC_ERROR_MESSAGE);
}

export async function backendRegister(payload: RegisterPayload): Promise<BackendUser> {
  const response = await fetch(`${globals.apiBaseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return response.json();
}

export async function backendLogin(username: string, password: string): Promise<TokenResponse> {
  const response = await fetch(`${globals.apiBaseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return response.json();
}

export async function backendGetCurrentUser(token: string): Promise<BackendUser | null> {
  const response = await fetch(`${globals.apiBaseUrl}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function backendListRecipes(
  token: string,
  params: { sort: RecipeSortOrder; offset: number; limit: number }
): Promise<RecipeListPage> {
  const query = new URLSearchParams({
    sort: params.sort,
    offset: String(params.offset),
    limit: String(params.limit),
  });
  const response = await fetch(`${globals.apiBaseUrl}/api/v1/recipes?${query}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return response.json();
}

export async function backendCreateRecipe(
  token: string,
  recipe: RecipeWriteInput
): Promise<Recipe> {
  const response = await fetch(`${globals.apiBaseUrl}/api/v1/recipes`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  });
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return response.json();
}

export async function backendGetRecipe(token: string, id: number): Promise<Recipe | null> {
  const response = await fetch(`${globals.apiBaseUrl}/api/v1/recipes/${id}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return response.json();
}

export async function backendUpdateRecipe(
  token: string,
  id: number,
  recipe: RecipeWriteInput
): Promise<Recipe> {
  const response = await fetch(`${globals.apiBaseUrl}/api/v1/recipes/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  });
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return response.json();
}

export async function backendDeleteRecipe(token: string, id: number): Promise<void> {
  const response = await fetch(`${globals.apiBaseUrl}/api/v1/recipes/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
}

export async function backendUploadRecipeImage(
  token: string,
  id: number,
  file: Blob
): Promise<Recipe> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${globals.apiBaseUrl}/api/v1/recipes/${id}/image`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return response.json();
}

export async function backendDeleteRecipeImage(token: string, id: number): Promise<Recipe> {
  const response = await fetch(`${globals.apiBaseUrl}/api/v1/recipes/${id}/image`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  return response.json();
}
