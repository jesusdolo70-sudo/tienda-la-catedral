import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'tienda.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initDb(db);
  }
  return db;
}

function initDb(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL,
      categoria TEXT NOT NULL,
      tallas TEXT DEFAULT '[]',
      colores TEXT DEFAULT '[]',
      imagen TEXT DEFAULT '/placeholder.jpg',
      stock INTEGER DEFAULT 0,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_nombre TEXT NOT NULL,
      cliente_email TEXT NOT NULL,
      cliente_telefono TEXT,
      direccion TEXT,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      estado TEXT DEFAULT 'pendiente',
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed data if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM productos').get();
  if (count.c === 0) {
    const insert = db.prepare(`
      INSERT INTO productos (nombre, descripcion, precio, categoria, tallas, colores, stock, imagen)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const productos = [
      ['Camiseta Básica', 'Camiseta de algodón 100% suave y cómoda', 29900, 'Camisetas', '["S","M","L","XL"]', '["Blanco","Negro","Gris"]', 50, '/images/camiseta.jpg'],
      ['Jeans Slim Fit', 'Jean de corte ajustado con strech premium', 89900, 'Pantalones', '["28","30","32","34"]', '["Azul","Negro"]', 30, '/images/jeans.jpg'],
      ['Vestido Floral', 'Vestido veraniego con estampado floral', 65000, 'Vestidos', '["XS","S","M","L"]', '["Rosa","Azul","Verde"]', 25, '/images/vestido.jpg'],
      ['Chaqueta Denim', 'Chaqueta de mezclilla clásica unisex', 120000, 'Chaquetas', '["S","M","L","XL"]', '["Azul claro","Azul oscuro"]', 20, '/images/chaqueta.jpg'],
      ['Sudadera Oversize', 'Sudadera oversized con capucha de felpa', 75000, 'Sudaderas', '["S","M","L","XL","XXL"]', '["Negro","Gris","Beige"]', 40, '/images/sudadera.jpg'],
      ['Camisa Lino', 'Camisa de lino fresca para verano', 55000, 'Camisas', '["S","M","L","XL"]', '["Blanco","Celeste","Beige"]', 35, '/images/camisa.jpg'],
    ];
    productos.forEach(p => insert.run(...p));
  }
}

export default getDb;
