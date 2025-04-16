import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable, Scope } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable({ scope: Scope.REQUEST })
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(): Promise<void> {
    throw new DomainException({
      code: DomainExceptionCode.TooManyRequests,
      message: 'You have exceeded the rate limit. Please try again later.',
      extensions: [],
    });
  }
}
