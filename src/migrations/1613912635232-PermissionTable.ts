import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class PermissionTable1613912635232 implements MigrationInterface {
  tableName = 'permission';

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
            name: 'key',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
            length: '200'
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'group',
            type: 'varchar',
            default: `'Custom'`
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }),
      false
    );

    await queryRunner.createIndex(
      this.tableName,
      new TableIndex({
        name: `IDX_PERMISSION_KEY`,
        columnNames: ['key']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    const index = `IDX_PERMISSION_KEY`;
    const keyIndex = table.indices.find((fk) => fk.name.indexOf(index) !== -1);
    await queryRunner.dropIndex(this.tableName, keyIndex);
    await queryRunner.query(`DROP TABLE ${this.tableName}`);
  }
}
