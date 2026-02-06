import sequelize from '../config/database.js';

const deduplicateIndexes = async () => {
  const [rows] = await sequelize.query(`
    SELECT
      TABLE_NAME,
      INDEX_NAME,
      NON_UNIQUE,
      INDEX_TYPE,
      GROUP_CONCAT(
        CONCAT(COALESCE(COLUMN_NAME, ''), ':', COALESCE(SUB_PART, 0))
        ORDER BY SEQ_IN_INDEX
        SEPARATOR ','
      ) AS index_signature
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND INDEX_NAME <> 'PRIMARY'
    GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE, INDEX_TYPE
  `);

  const grouped = new Map();
  for (const row of rows) {
    const key = `${row.TABLE_NAME}|${row.NON_UNIQUE}|${row.INDEX_TYPE}|${row.index_signature}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row.INDEX_NAME);
  }

  const pickKeeper = (names) => {
    const named = names.filter((name) => /^idx_/.test(name));
    const stable = names.filter((name) => !/_\\d+$/.test(name));
    const pool = named.length > 0 ? named : (stable.length > 0 ? stable : names);
    return pool.sort((a, b) => a.length - b.length || a.localeCompare(b))[0];
  };

  const queryInterface = sequelize.getQueryInterface();
  let removed = 0;

  for (const [key, names] of grouped.entries()) {
    if (names.length <= 1) continue;

    const tableName = key.split('|')[0];
    const keep = pickKeeper(names);
    const duplicates = names.filter((name) => name !== keep);

    for (const indexName of duplicates) {
      try {
        await queryInterface.removeIndex(tableName, indexName);
        removed += 1;
        console.log(`Dropped index ${tableName}.${indexName}`);
      } catch (error) {
        console.warn(`Skip ${tableName}.${indexName}: ${error.message}`);
      }
    }
  }

  return removed;
};

const run = async () => {
  try {
    const removed = await deduplicateIndexes();
    console.log(`Done. Removed ${removed} duplicated indexes.`);
  } catch (error) {
    console.error('Failed to deduplicate indexes:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

run();
