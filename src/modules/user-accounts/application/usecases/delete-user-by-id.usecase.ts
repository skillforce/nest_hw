import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class DeleteUserByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserByIdCommand)
export class DeleteUserByIdUseCase
  implements ICommandHandler<DeleteUserByIdCommand, void>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute({ id }: DeleteUserByIdCommand): Promise<void> {
    const userToDelete = await this.usersRepository.findOrNotFoundFail(id);

    userToDelete.makeDeleted();

    await this.usersRepository.save(userToDelete);
  }
}
