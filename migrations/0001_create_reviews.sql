CREATE TABLE IF NOT EXISTS reviews (
  order_id TEXT PRIMARY KEY,
  review_date TEXT NOT NULL,
  review_time TEXT NOT NULL,
  restaurant TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
