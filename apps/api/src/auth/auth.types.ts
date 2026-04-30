import { UserRole } from '@prisma/client';
import type { Request } from 'express';

export type AuthenticatedUser = {
  id: string;
  username: string;
  role: UserRole;
  companyId: string | null;
};

export type RequestWithUser = Request & {
  user?: AuthenticatedUser;
  cookies?: Record<string, string | undefined>;
};
