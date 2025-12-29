import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { NumericIdEntity } from '../../common/domain/base.entity';
import { User } from '../../user-accounts/domain/entities/user.entity';
import { GameSessionQuestion } from './game-session-questions.entity';
import { GameSessionParticipants } from './game-session-participants.entity';

export enum GameSessionStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

@Entity('GameSessions')
export class GameSession extends NumericIdEntity {
  @Column({ type: 'timestamp', nullable: true })
  session_started_at: Date | null;

  @Column({
    type: 'enum',
    enum: GameSessionStatus,
    default: GameSessionStatus.PendingSecondPlayer,
  })
  status: GameSessionStatus;

  @Column({ nullable: true })
  winner_id: number;

  @Column({ nullable: false })
  creator_user_id: number;

  @ManyToOne(() => User, (user) => user.createdGameSessions, { nullable: true })
  @JoinColumn({ name: 'creator_user_id' })
  creatorUser: User | null;

  @ManyToOne(() => User, (user) => user.wonSessions, { nullable: true })
  @JoinColumn({ name: 'winner_id' })
  winner: User | null;

  @OneToMany(() => GameSessionQuestion, (question) => question.gameSession)
  questions: GameSessionQuestion[];

  @OneToMany(() => GameSessionParticipants, (question) => question.gameSession)
  participants: GameSessionParticipants[];
}
