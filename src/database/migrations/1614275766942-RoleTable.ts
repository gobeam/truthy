import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class RoleTable1614275766942 implements MigrationInterface {
  tableName = 'role';

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
            name: 'name',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
            length: '100'
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
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
        name: `IDX_ROLE_NAME`,
        columnNames: ['name']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    const index = `IDX_ROLE_NAME`;
    const nameIndex = table.indices.find((fk) => fk.name.indexOf(index) !== -1);
    if (nameIndex) {
      await queryRunner.dropIndex(this.tableName, nameIndex);
    }
    await queryRunner.dropTable(this.tableName);
  }
}
