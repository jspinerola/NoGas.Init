import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_DATABASE_URL;
console.log('Database URL:', url);

export default defineConfig({
  out: './drizzle',
  schema: './lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: url!,
  },
  schemaFilter: ["test"],
});