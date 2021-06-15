import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserAgentRefreshTokenTable1623777103308
  implements MigrationInterface
{
  tableName = 'refresh_token';
  columns = [
    new TableColumn({
      name: 'ip',
      type: 'varchar',
      isNullable: true,
      length: '50'
    }),
    new TableColumn({
      name: 'userAgent',
      type: 'text',
      isNullable: true
    })
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
