import { randomUUIDv7 } from "bun";
import { db } from "@/server/db/connection";
import { usersTable } from "@/server/db/schema";

class AuthService {
  // 检查用户是否存在
  async userExists(email: string) {
    const user = await db.query.usersTable.findFirst({
      where: (usersTable, { eq }) => eq(usersTable.email, email),
    });
    return !!user;
  }

  // 使用邮箱注册用户
  async signUpWithEmail(email: string, name: string, image?: string) {
    // 先检查用户是否存在
    const exists = await this.userExists(email);
    if (exists) {
      return;
    }

    // ✅ 每次注册都生成新的 UUID v7
    const id = randomUUIDv7();

    const user = await db.insert(usersTable).values({
      id,
      name: name || email,
      email,
      emailVerified: false, // 不需要验证
      image: image || null,
    });

    console.log("User created:", user);
    return user;
  }
}

export const authService = new AuthService();
