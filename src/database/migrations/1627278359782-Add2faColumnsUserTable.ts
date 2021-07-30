import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class Add2faColumnsUserTable1627278359782 implements MigrationInterface {
  tableName = 'user';
  columns = [
    new TableColumn({
      name: 'twoFASecret',
      type: 'varchar',
      isNullable: true
    }),
    new TableColumn({
      name: 'isTwoFAEnabled',
      type: 'boolean',
      default: false
    })
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
