import { PrismaClient } from '../../node_modules/.pnpm/@prisma+client@4.5.0_prisma@4.5.0/node_modules/.prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    // const data = await prisma.$queryRaw`SELECT 1`;
  } catch (error: any) {
    // log error
    console.log(error);
    console.log('keys: ', Object.keys(error));
    console.log('error.errorCode: ', error.errorCode);
    console.log('error.code: ', error.code);
    console.error(JSON.stringify(error, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default prisma;
