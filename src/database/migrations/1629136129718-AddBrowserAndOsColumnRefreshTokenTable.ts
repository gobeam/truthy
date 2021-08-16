import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex
} from 'typeorm';

export class AddBrowserAndOsColumnRefreshTokenTable1629136129718
  implements MigrationInterface
{
  tableName = 'refresh_token';
  indexFields = ['browser', 'os'];
  columns = [
    new TableColumn({
      name: 'browser',
      type: 'varchar',
      isNullable: true,
      length: '200'
    }),
    new TableColumn({
      name: 'os',
      type: 'varchar',
      isNullable: true,
      length: '200'
    })
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.tableName, this.columns);
    for (const field of this.indexFields) {
      await queryRunner.createIndex(
        this.tableName,
        new TableIndex({
          name: `IDX_REFRESH_TOKEN_${field.toUpperCase()}`,
          columnNames: [field]
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    for (const field of this.indexFields) {
      const index = `IDX_REFRESH_TOKEN_${field.toUpperCase()}`;
      const keyIndex = await table.indices.find(
        (fk) => fk.name.indexOf(index) !== -1
      );
      await queryRunner.dropIndex(this.tableName, keyIndex);
    }
    await queryRunner.dropColumns(this.tableName, this.columns);
  }
}
