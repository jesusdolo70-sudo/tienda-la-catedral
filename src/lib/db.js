// Local dev → SQLite | Production (Vercel) → Neon PostgreSQL
const IS_PROD = !!process.env.DATABASE_URL;

// ── Neon (producción) ─────────────────────────────────────────────────────────
let neonClient = null;
function getNeon() {
  if (!neonClient) {
    const { neon } = require('@neondatabase/serverless');
    neonClient = neon(process.env.DATABASE_URL);
  }
  return neonClient;
}

// ── SQLite (local dev) ────────────────────────────────────────────────────────
let sqliteDb = null;
function getSqlite() {
  if (!sqliteDb) {
    const Database = require('better-sqlite3');
    const path = require('path');
    sqliteDb = new Database(path.join(process.cwd(), 'tienda.db'));
    sqliteDb.pragma('journal_mode = WAL');
  }
  return sqliteDb;
}

// ── sql() universal — funciona con await igual que Neon ───────────────────────
export function sql(strings, ...values) {
  if (IS_PROD) return getNeon()(strings, ...values);

  let query = strings.reduce((acc, s, i) => acc + s + (i < values.length ? '?' : ''), '');
  query = query.replace(/\bILIKE\b/gi, 'LIKE').trim();

  const db = getSqlite();
  const upper = query.toUpperCase();
  const isWrite = upper.startsWith('INSERT') || upper.startsWith('UPDATE') || upper.startsWith('DELETE');

  if (isWrite && upper.includes('RETURNING')) {
    // SQLite 3.35+ soporta RETURNING
    return db.prepare(query).all(...values);
  } else if (isWrite) {
    db.prepare(query).run(...values);
    return [];
  } else {
    return db.prepare(query).all(...values);
  }
}

// ── Init DB ───────────────────────────────────────────────────────────────────
let dbReady = null;
export async function getDb() {
  if (!dbReady) dbReady = initDb();
  return dbReady;
}

const SEED = [
  // Camisetas
  ['Camiseta Oversized Blanca', 'Algodón pesado 240g, corte boxy con caída perfecta', 34900, 'Camisetas', '["XS","S","M","L","XL"]', '["Blanco","Crema"]', 40,
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=750&fit=crop&q=80'],
  ['Camiseta Gráfica Vintage', 'Estampado faded con ilustración de archivo', 42900, 'Camisetas', '["S","M","L","XL"]', '["Negro","Gris pizarra"]', 25,
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop&q=80'],
  ['Camiseta Lino Verano', 'Tejido de lino ligero, ideal para temporadas cálidas', 38900, 'Camisetas', '["S","M","L"]', '["Beige","Blanco roto"]', 30,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop&q=80'],

  // Pantalones
  ['Jeans Slim Dark Wash', 'Denim 12oz con lavado oscuro, corte slim moderno', 89900, 'Pantalones', '["28","30","32","34","36"]', '["Azul oscuro"]', 35,
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop&q=80'],
  ['Pantalón Cargo Técnico', 'Ripstop con bolsillos utilitarios, corte relajado', 95000, 'Pantalones', '["S","M","L","XL"]', '["Negro","Oliva","Beige"]', 20,
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=750&fit=crop&q=80'],
  ['Pantalón Pinzas Lino', 'Pantalón de lino con pinzas, elegante y cómodo', 78000, 'Pantalones', '["36","38","40","42"]', '["Beige","Blanco","Gris"]', 18,
    'https://images.unsplash.com/photo-1594938298603-e8548e6c61f7?w=600&h=750&fit=crop&q=80'],

  // Vestidos
  ['Vestido Minimal Negro', 'Corte recto, manga larga, tejido crepé fluido', 110000, 'Vestidos', '["XS","S","M","L"]', '["Negro"]', 15,
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=750&fit=crop&q=80'],
  ['Vestido Satén Midi', 'Escote en V con abertura lateral, acabado satinado', 135000, 'Vestidos', '["XS","S","M"]', '["Champagne","Vino","Negro"]', 10,
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=750&fit=crop&q=80'],
  ['Vestido Camisero Lino', 'Estilo camisero con cinturón, versátil día-noche', 88000, 'Vestidos', '["S","M","L"]', '["Beige","Azul claro"]', 20,
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=750&fit=crop&q=80'],

  // Chaquetas
  ['Chaqueta Cuero Negro', 'Cuero genuino, forro satinado, cierre YKK', 280000, 'Chaquetas', '["S","M","L","XL"]', '["Negro"]', 8,
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop&q=80'],
  ['Chaqueta Denim Oversize', 'Denim desgastado con bordados, corte muy amplio', 120000, 'Chaquetas', '["S","M","L"]', '["Azul claro","Azul medio"]', 12,
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop&q=80'],
  ['Blazer Oversize Gris', 'Blazer sin forro, hombros caídos, look editorial', 155000, 'Chaquetas', '["XS","S","M","L"]', '["Gris","Beige","Negro"]', 14,
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=750&fit=crop&q=80'],

  // Sudaderas
  ['Hoodie Premium Negro', 'Felpa 400g, capucha doble, bolsillo canguro', 75000, 'Sudaderas', '["S","M","L","XL","XXL"]', '["Negro","Gris antracita"]', 45,
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop&q=80'],
  ['Crewneck Essentials', 'Sudadera cuello redondo, logo tonal bordado', 68000, 'Sudaderas', '["S","M","L","XL"]', '["Beige","Gris","Negro"]', 38,
    'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&h=750&fit=crop&q=80'],

  // Camisas
  ['Camisa Oxford Blanca', 'Oxford 120 hilos, botones nácar, corte regular', 65000, 'Camisas', '["S","M","L","XL"]', '["Blanco","Azul celeste"]', 30,
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&h=750&fit=crop&q=80'],
  ['Camisa Flanela Cuadros', 'Franela suave, cuadros tono sobre tono, oversized', 72000, 'Camisas', '["S","M","L","XL"]', '["Verde/Beige","Azul/Gris","Negro/Gris"]', 22,
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&h=750&fit=crop&q=80'],
];

async function initDb() {
  if (IS_PROD) {
    await sql`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT DEFAULT '',
        precio DECIMAL(10,2) NOT NULL,
        categoria TEXT NOT NULL,
        tallas TEXT DEFAULT '[]',
        colores TEXT DEFAULT '[]',
        imagen TEXT DEFAULT '/placeholder.jpg',
        stock INTEGER DEFAULT 0,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        cliente_nombre TEXT NOT NULL,
        cliente_email TEXT NOT NULL,
        cliente_telefono TEXT DEFAULT '',
        direccion TEXT DEFAULT '',
        items TEXT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        estado TEXT DEFAULT 'pendiente',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    const [row] = await sql`SELECT COUNT(*) as c FROM productos`;
    if (Number(row.c) === 0) await seedProd();
  } else {
    const db = getSqlite();
    db.exec(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT DEFAULT '',
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
        cliente_telefono TEXT DEFAULT '',
        direccion TEXT DEFAULT '',
        items TEXT NOT NULL,
        total REAL NOT NULL,
        estado TEXT DEFAULT 'pendiente',
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const row = db.prepare('SELECT COUNT(*) as c FROM productos').get();
    if (row.c === 0) seedLocal(db);
  }
}

async function seedProd() {
  for (const [nombre, descripcion, precio, categoria, tallas, colores, stock, imagen] of SEED) {
    await sql`
      INSERT INTO productos (nombre, descripcion, precio, categoria, tallas, colores, stock, imagen)
      VALUES (${nombre}, ${descripcion}, ${precio}, ${categoria}, ${tallas}, ${colores}, ${stock}, ${imagen})
    `;
  }
}

function seedLocal(db) {
  const stmt = db.prepare(`
    INSERT INTO productos (nombre, descripcion, precio, categoria, tallas, colores, stock, imagen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const row of SEED) stmt.run(...row);
}
