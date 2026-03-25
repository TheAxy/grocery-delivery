CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(120) NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delivery_address TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'created',
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

INSERT INTO users (name, email, password_hash, address, role)
VALUES (
  'Анна Смирнова',
  'anna@example.com',
  '$2b$10$1O20QAsdGfLwQ3Xq5szB8.rHg9JjM5a1T87Z0pniS3pSkeCZMt2nq',
  'Москва, ул. Пушкина, д. 10',
  'customer'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (name, description, category, price, image_url) VALUES
('Овощной набор', 'Свежие овощи для салатов и гарниров', 'Овощи', 499.00, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'),
('Фрукты на неделю', 'Набор яблок, бананов, апельсинов и груш', 'Фрукты', 690.00, 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80'),
('Молочный комплект', 'Молоко, кефир, йогурт и сыр', 'Молочные продукты', 830.00, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80'),
('Паста и соусы', 'Паста, томатный соус и специи для ужина', 'Бакалея', 540.00, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80'),
('Завтрак дома', 'Хлопья, мёд, хлеб и арахисовая паста', 'Готовые наборы', 760.00, 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80'),
('Фитнес-набор', 'Куриное филе, рис, брокколи и яйца', 'Готовые наборы', 980.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80')
ON CONFLICT DO NOTHING;
