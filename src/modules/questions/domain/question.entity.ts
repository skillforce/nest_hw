import { Column, Entity } from 'typeorm';
import { NumericIdEntity } from '../../common/domain/base.entity';
import { Length } from 'class-validator';

export const questionBodyConstraint = { minLength: 10, maxLength: 500 };

@Entity('Questions')
export class Question extends NumericIdEntity {
  @Column({ nullable: false })
  @Length(questionBodyConstraint.minLength, questionBodyConstraint.maxLength)
  questionBody: string;
  @Column('json', { nullable: false, array: true })
  answers: string[];
  @Column({ default: false })
  isPublished: boolean;
}
