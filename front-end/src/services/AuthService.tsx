import type { UserProfileToken } from "../models/User";

const api = "http://localhost/Interconnected/backend/api/";

export const loginAPI = async (
  email: string, 
  password: string
): Promise<UserProfileToken> => {

  const response = await fetch(api + "login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error("Login failed: " + response.status);
  }

  const data: UserProfileToken = await response.json();
  return data;
};

export const registerAPI = async (
  username: string,
  email: string, 
  password: string
): Promise<UserProfileToken> => {

  const response = await fetch(api + "login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username,email, password })
  });

  if (!response.ok) {
    throw new Error("Registration failed: " + response.status);
  }

  const data: UserProfileToken = await response.json();
  return data;
};
