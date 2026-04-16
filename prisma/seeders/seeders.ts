import { seedUsers } from './user.seed';
import { seedBookmarks } from './bookmark.seed';

import { prisma } from '../../lib/prisma';

async function main() {
  console.log('Start seeding...');

  await seedUsers(prisma);
  console.log('- Users seeded successfully.');
  await seedBookmarks(prisma);
  console.log('- Bookmarks seeded successfully.');

  console.log('Seeding finished');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
