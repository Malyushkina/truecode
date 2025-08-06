import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
export declare class ProductsRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: CreateProductDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        discountPrice: number | null;
        sku: string;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findMany(query: QueryProductsDto): Promise<{
        products: {
            id: string;
            name: string;
            description: string | null;
            price: number;
            discountPrice: number | null;
            sku: string;
            imageUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    findById(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        discountPrice: number | null;
        sku: string;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: string, data: UpdateProductDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        discountPrice: number | null;
        sku: string;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        discountPrice: number | null;
        sku: string;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private buildWhereClause;
}
