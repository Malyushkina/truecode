"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsRepository = class ProductsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.product.create({ data });
    }
    async findMany(query) {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', minPrice, maxPrice, } = query;
        const skip = (page - 1) * limit;
        const where = this.buildWhereClause(search, minPrice, maxPrice);
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.product.count({ where }),
        ]);
        return { products, total };
    }
    async findById(id) {
        return this.prisma.product.findUnique({ where: { id } });
    }
    async update(id, data) {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.prisma.product.delete({ where: { id } });
    }
    buildWhereClause(search, minPrice, maxPrice) {
        const conditions = [];
        if (search) {
            conditions.push({
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                ],
            });
        }
        if (minPrice || maxPrice) {
            const priceCondition = {};
            if (minPrice && !isNaN(minPrice))
                priceCondition.gte = Number(minPrice);
            if (maxPrice && !isNaN(maxPrice))
                priceCondition.lte = Number(maxPrice);
            conditions.push({ price: priceCondition });
        }
        return conditions.length > 0 ? { AND: conditions } : {};
    }
};
exports.ProductsRepository = ProductsRepository;
exports.ProductsRepository = ProductsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsRepository);
//# sourceMappingURL=products.repository.js.map