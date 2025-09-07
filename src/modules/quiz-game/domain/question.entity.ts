import { Column, Entity, OneToMany } from 'typeorm';
import { NumericIdEntity } from '../../common/domain/base.entity';
import { Length } from 'class-validator';
import { GameSessionQuestion } from './game-session-questions.entity';

export const questionBodyConstraint = { minLength: 10, maxLength: 500 };

@Entity('Questions')
export class Question extends NumericIdEntity {
  @Column({ nullable: false })
  @Length(questionBodyConstraint.minLength, questionBodyConstraint.maxLength)
  questionBody: string;
  @Column('text', { array: true, nullable: false })
  answers: string[];
  @Column({ default: false })
  isPublished: boolean;

  @OneToMany(() => GameSessionQuestion, (gsq) => gsq.question)
  gameSessionQuestions: GameSessionQuestion[];
}
