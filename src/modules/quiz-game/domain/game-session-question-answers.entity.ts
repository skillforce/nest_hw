import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { NumericIdEntity } from '../../common/domain/base.entity';
import { GameSessionParticipants } from './game-session-participants.entity';
import { GameSessionQuestion } from './game-session-questions.entity';

export enum AnswerStatus {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  PENDING = 'pending',
}

@Entity('GameSessionQuestionAnswers')
export class GameSessionQuestionAnswer extends NumericIdEntity {
  game_session_question_id: number;
  @Column({ nullable: true })
  answer: string;

  participant_id: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: AnswerStatus,
    default: AnswerStatus.PENDING,
  })
  answer_status: AnswerStatus;

  @ManyToOne(
    () => GameSessionParticipants,
    (gsp) => gsp.gameSessionQuestionAnswers,
    { nullable: true },
  )
  @JoinColumn({ name: 'participant_id' })
  participant: GameSessionParticipants;

  @ManyToOne(() => GameSessionQuestion, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_session_question_id' })
  gameSessionQuestion: GameSessionQuestion;
}
