export interface UpdateUserRequest {
  userId: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  password?: string;
  currentPassword?: string;
}
