import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { NumericIdEntity } from '../../common/domain/base.entity';
import { GameSession } from './game-session.entity';
import { User } from '../../user-accounts/domain/entities/user.entity';
import { GameSessionQuestionAnswer } from './game-session-question-answers.entity';

@Entity('GameSessionParticipants')
export class GameSessionParticipants extends NumericIdEntity {
  @Column({ nullable: true })
  finished_at: Date;
  @Column({ nullable: true })
  score: number;

  user_id: number;
  game_session_id: number;

  @ManyToOne(() => GameSession, (session) => session.participants, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_session_id' })
  gameSession: GameSession;

  @ManyToOne(() => User, (user) => user.gameSessionParticipants, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => GameSessionQuestionAnswer, (gsq) => gsq.participant)
  gameSessionQuestionAnswers: GameSessionQuestionAnswer[];
}
