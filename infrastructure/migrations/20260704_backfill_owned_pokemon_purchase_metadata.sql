UPDATE user_pokemons owned
INNER JOIN (
  SELECT user_id, api_id, MAX(id) AS purchase_history_id
  FROM purchase_history
  GROUP BY user_id, api_id
) latest_purchase
  ON latest_purchase.user_id = owned.user_id
  AND latest_purchase.api_id = owned.api_id
INNER JOIN purchase_history history
  ON history.id = latest_purchase.purchase_history_id
SET
  owned.source = 'shop',
  owned.purchase_price = history.price
WHERE owned.purchase_price = 0
  OR owned.source = 'starter';

UPDATE user_pokemons owned
INNER JOIN shop_items shop_item
  ON shop_item.api_id = owned.api_id
SET
  owned.source = 'shop',
  owned.purchase_price = shop_item.price
WHERE owned.api_id NOT IN (1, 4)
  AND owned.purchase_price = 0
  AND owned.source = 'starter';
