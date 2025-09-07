import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { NumericIdEntity } from '../../common/domain/base.entity';
import { GameSession } from './game-session.entity';
import { Question } from './question.entity';

@Entity('GameSessionQuestions')
export class GameSessionQuestion extends NumericIdEntity {
  @Column({ nullable: false })
  order_index: number;

  @ManyToOne(() => Question, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => GameSession, (session) => session.questions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_session_id' })
  gameSession: GameSession;
}
