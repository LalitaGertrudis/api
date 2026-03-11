# Managing Database: Prisma & PostgreSQL

**Description**: Strict rules and workflows for modifying database schemas, writing queries, and handling migrations using Prisma ORM and PostgreSQL.
**Freedom Level**: Low (Strict adherence to avoid data loss and migration conflicts).

## Best Practices
- **Schema Management**: All database shape changes must be made in `schema.prisma`. Never manually modify the SQL schema.
- **Client Instantiation**: Ensure a single PrismaClient instance exists across the application. In development with hot-reloading, cache the client in `globalThis` to prevent connection exhaustion.
- **Performance**: Use `.select` or `.include` explicitly to avoid over-fetching large text/json fields. 

## Workflow: Creating a Database Migration
1. Modify `prisma/schema.prisma` with the necessary model changes.
2. Run `bunx prisma format` to ensure syntax formatting.
3. Generate the migration file by running `bunx prisma migrate dev --name <descriptive_name_of_change>`.
4. Review the generated `.sql` file inside the `prisma/migrations` folder to verify correctness.
5. Never delete or modify past migration files.

*Note: For complex seed data requirements, refer to `reference/database-seeding.md`.*
