import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateNewTokensCommand } from './generate-new-tokens.usecase';

export class LoginUserCommand {
  constructor(
    public userId: number,
    public userAgent: string,
    public ipAddress: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
  implements
    ICommandHandler<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >
{
  constructor(private commandBus: CommandBus) {}

  async execute({
    userId,
    ipAddress,
    userAgent,
  }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken, accessToken } = await this.commandBus.execute<
      GenerateNewTokensCommand,
      { accessToken: string; refreshToken: string }
    >(new GenerateNewTokensCommand(userId, ipAddress, userAgent));

    return { accessToken, refreshToken };
  }
}
