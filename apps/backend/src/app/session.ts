import { z } from 'zod';
import { User } from './user.model';

export type Session = z.infer<typeof sessionSchema>;
const sessionSchema = z.object({
  user: z.object({ id: z.string(), email: z.string() }),
});

export function createSession(user: User): Session {
  return {
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

export function isSession(value: unknown): value is Session {
  const session = sessionSchema.safeParse(value);
  return session.success;
}
