import { PrismaClient } from '@prisma/client';

export async function seedBookmarks(prisma: PrismaClient) {
  // récupérer un user existant
  const user = await prisma.user.findFirst();

  if (!user) {
    throw new Error('No user found. Seed users first.');
  }

  await prisma.bookmark.createMany({
    data: [
      {
        title: 'NestJS Docs',
        description: 'Official NestJS documentation',
        link: 'https://docs.nestjs.com',
        userId: user.id,
      },
      {
        title: 'Prisma Docs',
        description: 'Official Prisma documentation',
        link: 'https://www.prisma.io/docs',
        userId: user.id,
      },
    ],
  });
}