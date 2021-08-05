import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTwoSecretGenerateThrottleTime1627736950484
  implements MigrationInterface
{
  tableName = 'user';
  columns = [
    new TableColumn({
      name: 'twoFAThrottleTime',
      type: 'timestamp',
      default: 'now()'
    })
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
