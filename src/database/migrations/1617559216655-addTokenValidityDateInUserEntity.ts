import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addTokenValidityDateInUserEntity1617559216655
  implements MigrationInterface
{
  tableName = 'user';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'tokenValidityDate',
        type: 'timestamp',
        default: 'now()'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      this.tableName,
      new TableColumn({
        name: 'tokenValidityDate',
        type: 'timestamp',
        default: 'now()'
      })
    );
  }
}
