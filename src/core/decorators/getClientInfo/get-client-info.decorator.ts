import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ClientInfo {
  ip: string;
  userAgent: string;
}

export const GetClientInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ip: request.ip || request.headers['x-forwarded-for'],
      userAgent: request.headers['user-agent'] || 'Unknown',
    } as ClientInfo;
  },
);
