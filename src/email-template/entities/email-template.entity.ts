import { CustomBaseEntity } from '../../common/entity/custom-base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({
  name: 'email_templates'
})
export class EmailTemplateEntity extends CustomBaseEntity {
  @Column()
  @Index({
    unique: true
  })
  title: string;

  @Column()
  slug: string;

  @Column()
  sender: string;

  @Column()
  subject: string;

  @Column()
  body: string;

  @Column()
  isDefault: boolean;
}
