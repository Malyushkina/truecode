import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<{
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
    findAll(query: QueryProductsDto): Promise<{
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
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<{
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
    update(id: string, updateProductDto: UpdateProductDto): Promise<{
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
    remove(id: string): Promise<{
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
}
