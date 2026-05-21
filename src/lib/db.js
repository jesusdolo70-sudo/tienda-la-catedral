import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

let dbReady = null;

export async function getDb() {
  if (!dbReady) dbReady = initDb();
  return dbReady;
}

async function initDb() {
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
  if (Number(row.c) === 0) {
    await sql`
      INSERT INTO productos (nombre, descripcion, precio, categoria, tallas, colores, stock, imagen) VALUES
      ('Camiseta Básica', 'Camiseta de algodón 100% suave y cómoda', 29900, 'Camisetas', '["S","M","L","XL"]', '["Blanco","Negro","Gris"]', 50, '/images/camiseta.jpg'),
      ('Jeans Slim Fit', 'Jean de corte ajustado con strech premium', 89900, 'Pantalones', '["28","30","32","34"]', '["Azul","Negro"]', 30, '/images/jeans.jpg'),
      ('Vestido Floral', 'Vestido veraniego con estampado floral', 65000, 'Vestidos', '["XS","S","M","L"]', '["Rosa","Azul","Verde"]', 25, '/images/vestido.jpg'),
      ('Chaqueta Denim', 'Chaqueta de mezclilla clásica unisex', 120000, 'Chaquetas', '["S","M","L","XL"]', '["Azul claro","Azul oscuro"]', 20, '/images/chaqueta.jpg'),
      ('Sudadera Oversize', 'Sudadera oversized con capucha de felpa', 75000, 'Sudaderas', '["S","M","L","XL","XXL"]', '["Negro","Gris","Beige"]', 40, '/images/sudadera.jpg'),
      ('Camisa Lino', 'Camisa de lino fresca para verano', 55000, 'Camisas', '["S","M","L","XL"]', '["Blanco","Celeste","Beige"]', 35, '/images/camisa.jpg')
    `;
  }
}
