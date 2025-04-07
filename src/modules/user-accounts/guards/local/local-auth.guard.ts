import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      const extensions =
        info === 'Missing Credentials'
          ? [
              {
                field: 'loginOrEmail',
                message: 'field is required',
              },
            ]
          : [
              {
                field: 'loginOrEmail',
                message: 'Invalid username or password',
              },
              {
                field: 'password',
                message: 'Invalid username or password',
              },
            ];

      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions,
        message: '',
      });
    }
    return user;
  }
}
