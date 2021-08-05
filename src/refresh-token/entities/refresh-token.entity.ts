import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'refresh_token'
})
export class RefreshToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  ip: string;

  @Column()
  userAgent: string;

  @Column()
  isRevoked: boolean;

  @Column()
  expires: Date;
}
