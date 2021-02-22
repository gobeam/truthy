import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class PermissionTable1613912635232 implements MigrationInterface {
  tableName = 'permission';
  indexFields = ['resource', 'path'];

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
            name: 'resource',
            type: 'varchar',
            length: '100'
          },
          {
            name: 'path',
            type: 'varchar',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'method',
            type: 'varchar',
            default: `'get'`,
            length: '20'
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

    for (const field of this.indexFields) {
      await queryRunner.createIndex(
        this.tableName,
        new TableIndex({
          name: `IDX_PERMISSION_${field.toUpperCase()}`,
          columnNames: [field]
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    for (const field of this.indexFields) {
      const index = `IDX_PERMISSION_${field.toUpperCase()}`;
      const keyIndex = table.indices.find(
        (fk) => fk.name.indexOf(index) !== -1
      );
      await queryRunner.dropIndex(this.tableName, keyIndex);
    }
    await queryRunner.query(`DROP TABLE ${this.tableName}`);
  }
}
