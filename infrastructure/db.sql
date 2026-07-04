CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  coins INT NOT NULL DEFAULT 100 CHECK (coins >= 0),
  last_login_date DATE
);

CREATE TABLE IF NOT EXISTS user_pokemons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  api_id INT NOT NULL,
  type VARCHAR(100),
  image VARCHAR(255),
  source VARCHAR(50) NOT NULL DEFAULT 'starter',
  purchase_price INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_pokemons_user_id (user_id),
  UNIQUE KEY uq_user_pokemons_user_api (user_id, api_id),
  CONSTRAINT fk_user_pokemons_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS shop_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  api_id INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  price INT NOT NULL CHECK (price >= 0),
  rarity VARCHAR(50) NOT NULL DEFAULT 'common',
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shop_items_active (is_active),
  INDEX idx_shop_items_rarity (rarity)
);

CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  status ENUM('pending', 'sent', 'error') NOT NULL DEFAULT 'pending',
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email_logs_user_email (user_email)
);
