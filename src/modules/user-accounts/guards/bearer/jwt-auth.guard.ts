import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    console.log(info);
    if (err || !user) {
      // здесь можно выбросить любую свою ошибку
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [
          {
            field: 'token',
            message: 'Invalid token',
          },
        ],
        message: 'Unauthorized',
      });
    }
    return user;
  }
}
