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

// [nombre, descripcion, precio, categoria, tallas, colores, stock, imagen, exclusivo]
const SEED = [
  // ── Camisetas ──────────────────────────────────────────────────────────────
  ['Polo Phantom Obsidian', 'Supima japonés 240 hilos tinturado con añil puro y carbón vegetal activo. Costura francesa reforzada, cuello reforzado con entretela invisible. Cada pieza lleva su número de serie bordado en hilo de seda en el interior del cuello. Solo 8 unidades existen — nunca será reproducida.', 345000, 'Camisetas', '["S","M","L","XL"]', '["Negro Obsidian"]', 8,
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop&q=80', 1],

  ['Camiseta Oversized Blanca', 'Algodón pesado 240g, corte boxy con caída perfecta', 34900, 'Camisetas', '["XS","S","M","L","XL"]', '["Blanco","Crema"]', 40,
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=750&fit=crop&q=80', 0],
  ['Camiseta Gráfica Vintage', 'Estampado faded con ilustración de archivo exclusivo', 42900, 'Camisetas', '["S","M","L","XL"]', '["Negro","Gris pizarra"]', 25,
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop&q=80', 0],
  ['Camiseta Lino Verano', 'Tejido de lino ligero, ideal para temporadas cálidas', 38900, 'Camisetas', '["S","M","L"]', '["Beige","Blanco roto"]', 30,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop&q=80', 0],
  ['Camiseta Esencial Pima', 'Algodón Pima peruano 180g, cuello redondo reforzado', 39900, 'Camisetas', '["XS","S","M","L","XL","XXL"]', '["Negro","Blanco","Gris","Navy"]', 55,
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=750&fit=crop&q=80', 0],

  // ── Pantalones ─────────────────────────────────────────────────────────────
  ['Jeans Slim Dark Wash', 'Denim 12oz con lavado oscuro, corte slim moderno', 89900, 'Pantalones', '["28","30","32","34","36"]', '["Azul oscuro"]', 35,
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop&q=80', 0],
  ['Pantalón Cargo Técnico', 'Ripstop con bolsillos utilitarios, corte relajado', 95000, 'Pantalones', '["S","M","L","XL"]', '["Negro","Oliva","Beige"]', 20,
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=750&fit=crop&q=80', 0],
  ['Pantalón Pinzas Lino', 'Pantalón de lino con pinzas, elegante y cómodo', 78000, 'Pantalones', '["36","38","40","42"]', '["Beige","Blanco","Gris"]', 18,
    'https://images.unsplash.com/photo-1594938298603-e8548e6c61f7?w=600&h=750&fit=crop&q=80', 0],
  ['Jogger Fleece Premium', 'Felpa francesa 320g con puños de punto, corte tapered', 72000, 'Pantalones', '["S","M","L","XL"]', '["Negro","Gris medio","Crema"]', 28,
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop&q=80', 0],
  ['Pantalón Sastre Slim', 'Corte sastre slim en mezcla de lana, forrado en el 50%', 125000, 'Pantalones', '["36","38","40","42","44"]', '["Negro","Gris marengo","Beige arena"]', 15,
    'https://images.unsplash.com/photo-1519748771451-a94c596fad67?w=600&h=750&fit=crop&q=80', 0],

  // ── Vestidos ───────────────────────────────────────────────────────────────
  ['Vestido Minimal Negro', 'Corte recto, manga larga, tejido crepé fluido', 110000, 'Vestidos', '["XS","S","M","L"]', '["Negro"]', 15,
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=750&fit=crop&q=80', 0],
  ['Vestido Satén Midi', 'Escote en V con abertura lateral, acabado satinado', 135000, 'Vestidos', '["XS","S","M"]', '["Champagne","Vino","Negro"]', 10,
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=750&fit=crop&q=80', 0],
  ['Vestido Camisero Lino', 'Estilo camisero con cinturón, versátil día-noche', 88000, 'Vestidos', '["S","M","L"]', '["Beige","Azul claro"]', 20,
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=750&fit=crop&q=80', 0],
  ['Vestido Cut-Out Editorial', 'Punto elástico con recortes asimétricos, look red carpet', 168000, 'Vestidos', '["XS","S","M"]', '["Negro","Terracota"]', 7,
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=750&fit=crop&q=80', 0],

  // ── Chaquetas ──────────────────────────────────────────────────────────────
  ['Chaqueta Cuero Negro', 'Cuero genuino, forro satinado, cierre YKK', 280000, 'Chaquetas', '["S","M","L","XL"]', '["Negro"]', 8,
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop&q=80', 0],
  ['Chaqueta Denim Oversize', 'Denim desgastado con bordados artesanales, corte muy amplio', 120000, 'Chaquetas', '["S","M","L"]', '["Azul claro","Azul medio"]', 12,
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop&q=80', 0],
  ['Blazer Oversize Gris', 'Blazer sin forro, hombros caídos, look editorial', 155000, 'Chaquetas', '["XS","S","M","L"]', '["Gris","Beige","Negro"]', 14,
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=750&fit=crop&q=80', 0],
  ['Bomber Técnico Impermeable', 'Nylon ripstop 100% impermeable, bolsillos internos ocultos', 185000, 'Chaquetas', '["S","M","L","XL"]', '["Negro","Oliva oscuro"]', 10,
    'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&h=750&fit=crop&q=80', 0],

  // ── Sudaderas ──────────────────────────────────────────────────────────────
  ['Hoodie Premium Negro', 'Felpa 400g, capucha doble, bolsillo canguro', 75000, 'Sudaderas', '["S","M","L","XL","XXL"]', '["Negro","Gris antracita"]', 45,
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop&q=80', 0],
  ['Crewneck Essentials', 'Sudadera cuello redondo, logo tonal bordado', 68000, 'Sudaderas', '["S","M","L","XL"]', '["Beige","Gris","Negro"]', 38,
    'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&h=750&fit=crop&q=80', 0],
  ['Hoodie Acid Wash', 'Felpa pesada con efecto acid wash manual, cada pieza única', 88000, 'Sudaderas', '["S","M","L","XL"]', '["Gris lavado","Negro lavado"]', 18,
    'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&h=750&fit=crop&q=80', 0],
  ['Half-Zip Polar', 'Polar técnico 280g, cremallera metálica, cuello alto', 82000, 'Sudaderas', '["S","M","L","XL"]', '["Crema","Marrón","Gris"]', 22,
    'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=750&fit=crop&q=80', 0],

  // ── Camisas ────────────────────────────────────────────────────────────────
  ['Camisa Oxford Blanca', 'Oxford 120 hilos, botones nácar, corte regular', 65000, 'Camisas', '["S","M","L","XL"]', '["Blanco","Azul celeste"]', 30,
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&h=750&fit=crop&q=80', 0],
  ['Camisa Flanela Cuadros', 'Franela suave, cuadros tono sobre tono, oversized', 72000, 'Camisas', '["S","M","L","XL"]', '["Verde/Beige","Azul/Gris","Negro/Gris"]', 22,
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&h=750&fit=crop&q=80', 0],
  ['Camisa Manga Corta Resort', 'Viscosa fluida con estampado botánico, corte relaxed', 68000, 'Camisas', '["S","M","L","XL"]', '["Azul botanico","Beige botanico"]', 25,
    'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&h=750&fit=crop&q=80', 0],
  ['Camisa Formal Popelín', 'Popelín italiano 100% algodón, puños dobles para gemelos', 95000, 'Camisas', '["S","M","L","XL"]', '["Blanco","Azul oscuro","Negro"]', 20,
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop&q=80', 0],
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
        exclusivo INTEGER DEFAULT 0,
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
        exclusivo INTEGER DEFAULT 0,
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
  for (const [nombre, descripcion, precio, categoria, tallas, colores, stock, imagen, exclusivo] of SEED) {
    await sql`
      INSERT INTO productos (nombre, descripcion, precio, categoria, tallas, colores, stock, imagen, exclusivo)
      VALUES (${nombre}, ${descripcion}, ${precio}, ${categoria}, ${tallas}, ${colores}, ${stock}, ${imagen}, ${exclusivo ?? 0})
    `;
  }
}

function seedLocal(db) {
  const stmt = db.prepare(`
    INSERT INTO productos (nombre, descripcion, precio, categoria, tallas, colores, stock, imagen, exclusivo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const [nombre, descripcion, precio, categoria, tallas, colores, stock, imagen, exclusivo] of SEED)
    stmt.run(nombre, descripcion, precio, categoria, tallas, colores, stock, imagen, exclusivo ?? 0);
}
