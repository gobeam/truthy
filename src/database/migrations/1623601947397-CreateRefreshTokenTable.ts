import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey
} from 'typeorm';

export class CreateRefreshTokenTable1623601947397
  implements MigrationInterface
{
  foreignKeysArray = [
    {
      table: 'user',
      field: 'userId',
      reference: 'id'
    }
  ];
  tableName = 'refresh_token';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'isRevoked',
            type: 'boolean',
            default: false
          },
          {
            name: 'expires',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }),
      false
    );

    for (const foreignKey of this.foreignKeysArray) {
      await queryRunner.addColumn(
        this.tableName,
        new TableColumn({
          name: foreignKey.field,
          type: 'int'
        })
      );

      await queryRunner.createForeignKey(
        this.tableName,
        new TableForeignKey({
          columnNames: [foreignKey.field],
          referencedColumnNames: [foreignKey.reference],
          referencedTableName: foreignKey.table,
          onDelete: 'CASCADE'
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    for (const key of this.foreignKeysArray) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf(key.field) !== -1
      );
      await queryRunner.dropForeignKey(this.tableName, foreignKey);
      await queryRunner.dropColumn(this.tableName, key.field);
    }
    await queryRunner.dropTable(this.tableName);
  }
}
