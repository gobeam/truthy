import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class UserTable1612960824811 implements MigrationInterface {
  indexFields = ['name', 'email', 'username'];
  tableName = 'user';

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
            name: 'username',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
            length: '100'
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
            length: '100'
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
            isNullable: true
          },
          {
            name: 'salt',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'token',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'status',
            type: 'varchar',
            default: `'active'`
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
          name: `IDX_USER_${field.toUpperCase()}`,
          columnNames: [field]
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    for (const field of this.indexFields) {
      const index = `IDX_USER_${field.toUpperCase()}`;
      const keyIndex = table.indices.find(
        (fk) => fk.name.indexOf(index) !== -1
      );
      await queryRunner.dropIndex(this.tableName, keyIndex);
    }
    await queryRunner.query(`DROP TABLE ${this.tableName}`);
  }
}
