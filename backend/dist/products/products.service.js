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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const products_repository_1 = require("./products.repository");
const fs_1 = require("fs");
const path_1 = require("path");
let ProductsService = class ProductsService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(createProductDto) {
        return this.repository.create(createProductDto);
    }
    async findAll(query) {
        const { page = 1, limit = 10 } = query;
        const { products, total } = await this.repository.findMany(query);
        return {
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(uid) {
        const product = await this.repository.findByUid(uid);
        if (!product) {
            throw new common_1.NotFoundException(`Товар с UID ${uid} не найден`);
        }
        return product;
    }
    async update(uid, updateProductDto) {
        await this.findOne(uid);
        return this.repository.updateByUid(uid, updateProductDto);
    }
    async remove(uid) {
        await this.findOne(uid);
        return this.repository.deleteByUid(uid);
    }
    async attachImage(uid, file) {
        const product = await this.findOne(uid);
        await this.deleteLocalImageFileIfExists(product.imageUrl);
        const baseUrl = process.env.BASE_URL ?? 'http://localhost:3002';
        const imageUrl = `${baseUrl}/uploads/${file.filename}`;
        return this.repository.updateByUid(uid, { imageUrl });
    }
    async detachImage(uid) {
        const product = await this.findOne(uid);
        await this.deleteLocalImageFileIfExists(product.imageUrl);
        return this.repository.updateByUid(uid, { imageUrl: null });
    }
    async deleteLocalImageFileIfExists(imageUrl) {
        if (!imageUrl)
            return;
        const uploadsMarker = '/uploads/';
        const markerIndex = imageUrl.indexOf(uploadsMarker);
        if (markerIndex === -1)
            return;
        const filename = imageUrl.substring(markerIndex + uploadsMarker.length);
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', filename);
        try {
            await fs_1.promises.unlink(filePath);
        }
        catch {
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_repository_1.ProductsRepository])
], ProductsService);
//# sourceMappingURL=products.service.js.map