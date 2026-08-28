#!/bin/sh

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<EOF
-- Enable GIST support extension
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create GIST index on all tables in 'multi-chain' schema with a _block_range column
DO \$\$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE column_name = '_block_range'
      AND table_schema = 'multi-chain'
  LOOP
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I_block_range_idx ON "%I".%I USING GIST (_block_range);',
      r.table_name, r.table_schema, r.table_name
    );
  END LOOP;
END
\$\$;
EOF
