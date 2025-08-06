export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare class QueryProductsDto {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
    minPrice?: number;
    maxPrice?: number;
}
