import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
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
        id: string;
        updatedAt: Date;
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
            id: string;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    findById(id: string): Promise<{
        name: string;
        description: string | null;
        price: number;
        discountPrice: number | null;
        sku: string;
        imageUrl: string | null;
        createdAt: Date;
        id: string;
        updatedAt: Date;
    } | null>;
    update(id: string, data: UpdateProductDto): Promise<{
        name: string;
        description: string | null;
        price: number;
        discountPrice: number | null;
        sku: string;
        imageUrl: string | null;
        createdAt: Date;
        id: string;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        name: string;
        description: string | null;
        price: number;
        discountPrice: number | null;
        sku: string;
        imageUrl: string | null;
        createdAt: Date;
        id: string;
        updatedAt: Date;
    }>;
    private buildWhereClause;
}
