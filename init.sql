
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
INSERT INTO users(user, pass, name, role) VALUES('alexander','1234','Alexander','admin');
INSERT INTO users(user, pass, name, role) VALUES('tech1','1111','Tech One','tech');
INSERT INTO users(user, pass, name, role) VALUES('tech2','2222','Tech Two','tech');

-- Sample orders
INSERT INTO orders(id, datetime, name, tel, address, status, service, units, comment, employee, price, geo, order_time) VALUES(13680,'2025-11-20 09:00','Eleanor Lujan-Toves','(671)787-4318','Terry''s Laundromat','yellow','Cleaning',2,'','alexander',0,'13.5129593,144.8432034','2025-11-15 16:25');
INSERT INTO orders(id, datetime, name, tel, address, status, service, units, comment, employee, price, geo, order_time) VALUES(13691,'2025-11-19 15:30','Carlos G','1671-988-3810','133 Chalan Jaime','green','Diagnostic',1,'Diagnostics 40','alexander',40,'13.5,144.8','2025-11-17 19:59');
INSERT INTO orders(id, datetime, name, tel, address, status, service, units, comment, employee, price, geo, order_time) VALUES(13705,'2025-11-24 09:00','Matthew Grillo','(609)513-7602','113 Benny Lane','yellow','Cleaning',3,'','alexander',0,'','2025-11-19 09:40');
INSERT INTO orders(id, datetime, name, tel, address, status, service, units, comment, employee, price, geo, order_time) VALUES(13561,'2025-11-20 14:30','Hide','1671..','Guam, Hide Yakitori','yellow','Cleaning',1,'may need ladder','tech1',0,'','2025-11-12 13:22');
