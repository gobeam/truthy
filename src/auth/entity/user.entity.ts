import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserStatusEnum } from '../user-status.enum';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  name: string;

  @Column()
  status: UserStatusEnum;

  @Column()
  @Exclude({ toPlainOnly: true })
  salt: string;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
