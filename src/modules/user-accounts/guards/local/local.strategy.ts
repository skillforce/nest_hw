import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { UserContextDto } from '../dto/user-context.dto';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(username: string, password: string): Promise<UserContextDto> {
    const userId = await this.authService.validateUser(username, password);
    if (!userId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [
          {
            field: 'loginOrEmail',
            message: 'Invalid username or password',
          },
          {
            field: 'password',
            message: 'Invalid username or password',
          },
        ],
        message: 'Invalid username or password',
      });
    }

    return userId;
  }
}
