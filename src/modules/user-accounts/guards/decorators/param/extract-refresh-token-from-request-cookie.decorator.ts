import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ExtractRefreshTokenFromCookie = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | null => {
    const request = context.switchToHttp().getRequest();

    const cookies = request.cookies;

    if (!cookies || !cookies.refreshToken) {
      return null;
    }

    return cookies.refreshToken;
  },
);
