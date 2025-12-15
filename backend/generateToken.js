import jwt from "jsonwebtoken";
import { Processor } from "postcss";

export function generateToken(userId) {
  const token = jwt.sign({ id: userId }, Process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}
