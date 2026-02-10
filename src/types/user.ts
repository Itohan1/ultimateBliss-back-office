export interface User {
  userId: string;
  firstname?: string;
  lastname?: string;
  email: string;
  status: "Active" | "Suspended" | "Unknown";
  datejoined: string;
  lastlogin: string;
}
