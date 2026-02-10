import type { User } from "../types/user.ts";

export interface RegisterUserRequest {
  email: string;
  password: string;
}

export interface RegisterUserResponse {
  message: string;
  token: string;
  user: Pick<User, "userId" | "email" | "status">;
}
