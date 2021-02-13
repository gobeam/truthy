import { Column, Entity, Index } from 'typeorm';
import { UserStatusEnum } from '../user-status.enum';
import * as bcrypt from 'bcrypt';
import { CustomBaseEntity } from '../../custom-base.entity';

@Entity({ name: 'users' })
export class User extends CustomBaseEntity {
  @Index({ unique: true })
  @Column()
  username: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  password: string;

  @Index()
  @Column()
  name: string;

  @Column()
  status: UserStatusEnum;

  @Column()
  token: string;

  @Column()
  salt: string;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
