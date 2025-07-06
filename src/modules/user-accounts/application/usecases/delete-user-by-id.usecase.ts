import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';

export class DeleteUserByIdCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeleteUserByIdCommand)
export class DeleteUserByIdUseCase
  implements ICommandHandler<DeleteUserByIdCommand, void>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute({ id }: DeleteUserByIdCommand): Promise<void> {
    const userToDelete = await this.usersRepository.findByIdOrNotFoundFail(id);

    const deletedAt = new Date();
    const deletedUser = { ...userToDelete, deletedAt };

    await this.usersRepository.save(deletedUser);
  }
}
