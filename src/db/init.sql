-- Users
CREATE TABLE users (
  user TEXT PRIMARY KEY,
  pass TEXT,
  name TEXT,
  role TEXT
);

-- Orders
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  datetime TEXT,
  name TEXT,
  tel TEXT,
  address TEXT,
  status TEXT,
  service TEXT,
  units INTEGER,
  comment TEXT,
  employee TEXT,
  price REAL DEFAULT 0,
  geo TEXT,
  order_time TEXT
);

-- Insert sample users
INSERT INTO users(user, pass, name, role)
VALUES ('admin', '1234', 'Administrator', 'admin');

-- Sample orders
INSERT INTO orders(id, datetime, name, tel, address, status, service, units, comment, employee, price, geo, order_time)
VALUES (1, '2025-11-20', 'Test User', '123456', 'Test Address', 'new', 'Cleaning', 1, 'None', 'Admin', 0, 'None', '10:00');
