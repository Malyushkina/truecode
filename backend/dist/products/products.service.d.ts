import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
type UploadedFileInfo = {
    filename: string;
};
export declare class ProductsService {
    private repository;
    constructor(repository: ProductsRepository);
    create(createProductDto: CreateProductDto): Promise<{
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
    findAll(query: QueryProductsDto): Promise<{
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
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    findOne(uid: string): Promise<{
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
    update(uid: string, updateProductDto: UpdateProductDto): Promise<{
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
    remove(uid: string): Promise<{
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
    attachImage(uid: string, file: UploadedFileInfo): Promise<{
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
    detachImage(uid: string): Promise<{
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
    private deleteLocalImageFileIfExists;
}
export {};
