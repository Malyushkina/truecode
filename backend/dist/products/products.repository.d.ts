import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { Prisma } from '@prisma/client';
export declare class ProductsRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: CreateProductDto): Promise<{
        name: string;
        description: string | null;
        price: number;
        discountPrice: number | null;
        sku: string;
        imageUrl: string | null;
        createdAt: Date;
        uid: string;
        updatedAt: Date;
        id: number;
    }>;
    findMany(query: QueryProductsDto): Promise<{
        products: {
            name: string;
            description: string | null;
            price: number;
            discountPrice: number | null;
            sku: string;
            imageUrl: string | null;
            createdAt: Date;
            uid: string;
            updatedAt: Date;
            id: number;
        }[];
        total: number;
    }>;
    findByUid(uid: string): Promise<{
        name: string;
        description: string | null;
        price: number;
        discountPrice: number | null;
        sku: string;
        imageUrl: string | null;
        createdAt: Date;
        uid: string;
        updatedAt: Date;
        id: number;
    } | null>;
    updateByUid(uid: string, data: Prisma.ProductUpdateInput): Promise<{
        name: string;
        description: string | null;
        price: number;
        discountPrice: number | null;
        sku: string;
        imageUrl: string | null;
        createdAt: Date;
        uid: string;
        updatedAt: Date;
        id: number;
    }>;
    deleteByUid(uid: string): Promise<{
        name: string;
        description: string | null;
        price: number;
        discountPrice: number | null;
        sku: string;
        imageUrl: string | null;
        createdAt: Date;
        uid: string;
        updatedAt: Date;
        id: number;
    }>;
    private buildWhereClause;
}
