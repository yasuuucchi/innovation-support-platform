import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

      const user = result[0];
      if (!user) {
        return done(null, false, { message: "ユーザーが見つかりません" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: "パスワードが正しくありません" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await db.select().from(users).where(eq(users.id, id));
    const user = result[0];
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;