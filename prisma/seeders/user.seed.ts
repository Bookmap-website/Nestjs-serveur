import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

/* seeders for the user table */
export async function seedUsers(prisma: PrismaClient) {
  await prisma.user.createMany({
    data: [
      {
        email: '7Vt7I@example.com',
        hash: await argon2.hash('7Vt7I'),
        isAdmin: false,
      },
      {
        email: 'LzI8o@example.com',
        hash: await argon2.hash('LzI8o'),
        isAdmin: false,
      },
      {
        email: 'admin@admin.com',
        hash: await argon2.hash('admin1234'),
        isAdmin: true,
      },
      {
        id: '1',
        email: 'test_subject@test.com',
        hash: await argon2.hash('test_subject'),
        isAdmin: false,
      },
    ],
  });
}
