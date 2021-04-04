import {
  BeforeInsert,
  BeforeUpdate,
  Column, CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne
} from 'typeorm';
import { UserStatusEnum } from '../user-status.enum';
import * as bcrypt from 'bcrypt';
import { CustomBaseEntity } from '../../common/entity/custom-base.entity';
import { RoleEntity } from '../../roles/entities/role.entity';
import { Exclude } from 'class-transformer';

/**
 * User Entity
 */
@Entity({ name: 'user' })
export class UserEntity extends CustomBaseEntity {
  @Index({ unique: true })
  @Column()
  username: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Index()
  @Column()
  name: string;

  @Column()
  status: UserStatusEnum;

  @Column()
  @Exclude({ toPlainOnly: true })
  token: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  tokenValidityDate: Date;

  @Column()
  @Exclude({ toPlainOnly: true })
  salt: string;

  @Exclude({ toPlainOnly: true })
  skipHashPassword = false;

  @OneToOne(() => RoleEntity)
  @JoinColumn()
  role: RoleEntity;

  @Column()
  roleId: number;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password && !this.skipHashPassword) {
      await this.hashPassword();
    }
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    if (this.password && !this.skipHashPassword) {
      await this.hashPassword();
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, this.salt);
  }
}
