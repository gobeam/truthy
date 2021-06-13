import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class EmailTemplate1622305543735 implements MigrationInterface {
  tableName = 'email_templates';
  index = 'IDX_EMAIL_TEMPLATES_TITLE';

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
            name: 'title',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
            length: '200'
          },
          {
            name: 'slug',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
            length: '200'
          },
          {
            name: 'sender',
            type: 'varchar',
            isNullable: false,
            length: '200'
          },
          {
            name: 'subject',
            type: 'text',
            isNullable: true
          },
          {
            name: 'body',
            type: 'text',
            isNullable: true
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false
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
        name: `${this.index}`,
        columnNames: ['title']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(this.tableName);
    const nameIndex = table.indices.find(
      (ik) => ik.name.indexOf(this.index) !== -1
    );
    if (nameIndex) {
      await queryRunner.dropIndex(this.tableName, nameIndex);
    }
    await queryRunner.dropTable(this.tableName);
  }
}
