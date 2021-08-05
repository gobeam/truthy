import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAvatarColumnUserTable1626924978575
  implements MigrationInterface
{
  tableName = 'user';
  columns = [
    new TableColumn({
      name: 'avatar',
      type: 'varchar',
      isNullable: true,
      length: '200'
    })
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
