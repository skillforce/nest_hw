import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { NumericIdEntity } from '../../common/domain/base.entity';
import { User } from '../../user-accounts/domain/entities/user.entity';
import { GameSessionQuestion } from './game-session-questions.entity';
import { GameSessionParticipants } from './game-session-participants.entity';

@Entity('GameSessions')
export class GameSession extends NumericIdEntity {
  @Column({ nullable: true })
  session_started_at: Date;

  @ManyToOne(() => User, (user) => user.wonSessions, { nullable: true })
  @JoinColumn({ name: 'winner_id' })
  winner: User | null;

  @OneToMany(() => GameSessionQuestion, (question) => question.gameSession)
  questions: GameSessionQuestion[];

  @OneToMany(() => GameSessionParticipants, (question) => question.gameSession)
  participants: GameSessionParticipants[];
}
