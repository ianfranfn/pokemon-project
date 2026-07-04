SET @schema_name = DATABASE();

SET @source_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @schema_name
    AND table_name = 'user_pokemons'
    AND column_name = 'source'
);
SET @source_column_sql = IF(
  @source_column_exists = 0,
  'ALTER TABLE user_pokemons ADD COLUMN source VARCHAR(50) NOT NULL DEFAULT ''starter''',
  'SELECT 1'
);
PREPARE source_column_stmt FROM @source_column_sql;
EXECUTE source_column_stmt;
DEALLOCATE PREPARE source_column_stmt;

SET @purchase_price_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @schema_name
    AND table_name = 'user_pokemons'
    AND column_name = 'purchase_price'
);
SET @purchase_price_column_sql = IF(
  @purchase_price_column_exists = 0,
  'ALTER TABLE user_pokemons ADD COLUMN purchase_price INT NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE purchase_price_column_stmt FROM @purchase_price_column_sql;
EXECUTE purchase_price_column_stmt;
DEALLOCATE PREPARE purchase_price_column_stmt;

SET @user_api_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'user_pokemons'
    AND index_name = 'idx_user_pokemons_user_api'
);
SET @user_api_index_sql = IF(
  @user_api_index_exists = 0,
  'ALTER TABLE user_pokemons ADD INDEX idx_user_pokemons_user_api (user_id, api_id)',
  'SELECT 1'
);
PREPARE user_api_index_stmt FROM @user_api_index_sql;
EXECUTE user_api_index_stmt;
DEALLOCATE PREPARE user_api_index_stmt;

CREATE TABLE IF NOT EXISTS purchase_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pokemon_id INT NULL,
  api_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price INT NOT NULL,
  rarity VARCHAR(50) NOT NULL DEFAULT 'common',
  source VARCHAR(50) NOT NULL DEFAULT 'shop',
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_purchase_history_user_id (user_id),
  CONSTRAINT fk_purchase_history_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_purchase_history_pokemon
    FOREIGN KEY (pokemon_id) REFERENCES user_pokemons(id)
    ON DELETE SET NULL
);
