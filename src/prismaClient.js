const { PrismaClient } = require("@prisma/client");

// Create a single Prisma instance and reuse it
const prisma = new PrismaClient();

module.exports = prisma;
