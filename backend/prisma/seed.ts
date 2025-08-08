import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Очищаем существующие данные
  await prisma.product.deleteMany();
  console.log('✅ Очистили существующие данные');

  // Создаем тестовые продукты
  const products = [
    {
      name: 'iPhone 15 Pro Max',
      description: 'Смартфон с камерой 48 Мп, процессор A17 Pro, 256GB',
      price: 149999,
      discountPrice: 129999,
      sku: 'IPHONE-15-PRO-MAX-256GB',
      imageUrl: null,
    },
    {
      name: 'MacBook Pro 14',
      description: 'Ноутбук с процессором M3 Pro, 512GB SSD, 18GB RAM',
      price: 249999,
      discountPrice: 229999,
      sku: 'MACBOOK-PRO-14-M3',
      imageUrl: null,
    },
    {
      name: 'AirPods Pro 2',
      description: 'Беспроводные наушники с активным шумоподавлением',
      price: 29999,
      discountPrice: 24999,
      sku: 'AIRPODS-PRO-2',
      imageUrl: null,
    },
    {
      name: 'iPad Air',
      description: 'Планшет с процессором M1, 256GB, Wi-Fi + Cellular',
      price: 89999,
      discountPrice: 79999,
      sku: 'IPAD-AIR-256GB',
      imageUrl: null,
    },
    {
      name: 'Apple Watch Series 9',
      description: 'Умные часы с Always-On Retina дисплеем',
      price: 49999,
      discountPrice: 44999,
      sku: 'APPLE-WATCH-SERIES-9',
      imageUrl: null,
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Смартфон с S Pen, камера 200 Мп, 512GB',
      price: 159999,
      discountPrice: 139999,
      sku: 'SAMSUNG-S24-ULTRA-512GB',
      imageUrl: null,
    },
    {
      name: 'Dell XPS 13 Plus',
      description: 'Ультрабук с процессором Intel i7, 16GB RAM, 512GB SSD',
      price: 189999,
      discountPrice: 169999,
      sku: 'DELL-XPS-13-PLUS',
      imageUrl: null,
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Беспроводные наушники с премиальным звуком',
      price: 39999,
      discountPrice: 34999,
      sku: 'SONY-WH-1000XM5',
      imageUrl: null,
    },
  ];

  // Добавляем продукты в базу данных
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`✅ Добавлено ${products.length} продуктов`);

  // Проверяем количество продуктов
  const count = await prisma.product.count();
  console.log(`📊 Всего продуктов в базе: ${count}`);

  console.log('🎉 Заполнение базы данных завершено!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
