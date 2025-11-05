import { users, type User, type UpsertUser, categoryMappings, type CategoryMapping, type InsertCategoryMapping, productVariants, type ProductVariant, type InsertProductVariant, productSKUs, type ProductSKU, type InsertProductSKU } from "@shared/schema";

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getCategoryMappings(): Promise<CategoryMapping[]>;
  updateCategoryMapping(id: number, selectedCategory: string[]): Promise<CategoryMapping>;
  approveCategoryMappings(): Promise<void>;
  
  getProductVariants(): Promise<ProductVariant[]>;
  updateProductVariant(id: number, productTags: Array<{text: string, type: 'group' | 'product', color: 'blue' | 'red'}>): Promise<ProductVariant>;
  createNewGroup(sourceVariantId: number, tagText: string): Promise<ProductVariant>;
  approveProductGroupings(): Promise<void>;
  
  // Product enrichment operations
  getProductSKUs(page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc', filters?: { seller?: string; brand?: string; category?: string; status?: string }): Promise<{ data: ProductSKU[], total: number }>;
  createProductSKU(productSKU: InsertProductSKU): Promise<ProductSKU>;
  updateProductSKU(id: number, updates: Partial<ProductSKU>): Promise<ProductSKU>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categoryMappings: Map<number, CategoryMapping>;
  private productVariants: Map<number, ProductVariant>;
  private productSKUs: Map<number, ProductSKU>;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentSKUId: number;

  constructor() {
    this.users = new Map();
    this.categoryMappings = new Map();
    this.productVariants = new Map();
    this.productSKUs = new Map();
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentSKUId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize category mappings with sample data
    const categoryData: Omit<CategoryMapping, 'id'>[] = [
      {
        serialNumber: 1,
        productName: "Samsung Galaxy S24 Ultra 256GB",
        incomingSellerCategory: ["Mobile", "Mobile", "Smartphone", "Android"],
        mlSuggestedCategory: ["Mobile phones", "Smartphones", "Mobile accessories"],
        selectedCategory: ["Mobile phones", "Smartphones", "Mobile accessories"]
      },
      {
        serialNumber: 2,
        productName: "PlayStation 5 DualSense Controller",
        incomingSellerCategory: ["Home", "Gaming", "Accessories", "Cases"],
        mlSuggestedCategory: ["PlayStation accessories", "Gaming accessories"],
        selectedCategory: ["PlayStation accessories", "Gaming accessories"]
      },
      {
        serialNumber: 3,
        productName: "Sony WH-1000XM5 Wireless Headphones",
        incomingSellerCategory: ["Electronics", "Audio", "Headphones"],
        mlSuggestedCategory: ["Audio equipment", "Headphones", "Wireless headphones"],
        selectedCategory: ["Audio equipment", "Headphones", "Wireless headphones"]
      }
    ];

    categoryData.forEach(data => {
      const mapping: CategoryMapping = { ...data, id: this.currentCategoryId++ };
      this.categoryMappings.set(mapping.id, mapping);
    });

    // Initialize product variants with sample data
    const productData: Omit<ProductVariant, 'id'>[] = [
      {
        serialNumber: 1,
        seller: "Westcoast",
        eeCategory: "TV",
        brand: "Samsung",
        productTags: [
          { text: "Samsung QLED TV | QLED43XYZ | 43 inch", type: "product", color: "blue" },
          { text: "Samsung QLED TV | QLED55XYZ | 55 inch", type: "product", color: "blue" },
          { text: "Samsung QLED TV | QLED55XYZ | 55 inch", type: "product", color: "red" }
        ],
        groupingLogic: "Screen size"
      },
      {
        serialNumber: 2,
        seller: "Exertis",
        eeCategory: "Audio~Earbuds",
        brand: "Atp",
        productTags: [
          { text: "atp-beats-solo-buds | ABC1234 | Matte black", type: "product", color: "blue" },
          { text: "atp-beats-solo-buds pro | ABCX1234 | Artic purple", type: "product", color: "blue" },
          { text: "atp-beats-solo-buds | ABC1234 | Artic purple", type: "product", color: "red" }
        ],
        groupingLogic: "Colour"
      }
    ];

    productData.forEach(data => {
      const variant: ProductVariant = { ...data, id: this.currentProductId++ };
      this.productVariants.set(variant.id, variant);
    });

    // Initialize product SKUs with sample data
    const skuData: Omit<ProductSKU, 'id' | 'dateUploaded'>[] = [
      {
        mpn: "MPN-001",
        productName: "Samsung Galaxy S24 Ultra",
        seller: "Westcoast",
        brand: "Samsung",
        category: "Mobile phones",
        status: "To be reviewed",
        availableOnBrandWebsite: true
      },
      {
        mpn: "MPN-002",
        productName: "Sony WH-1000XM4 Headphones",
        seller: "Exertis",
        brand: "Sony",
        category: "Audio equipment",
        status: "Under review",
        availableOnBrandWebsite: true
      },
      {
        mpn: "MPN-003",
        productName: "Dell XPS 13 Laptop",
        seller: "TechTrade",
        brand: "Dell",
        category: "Computers",
        status: "Reviewed",
        availableOnBrandWebsite: false
      },
      {
        mpn: "27US550-W.AEK",
        productName: "LG UltraFine 27US550-W Monitor",
        seller: "Westcoast",
        brand: "LG",
        category: "Monitors",
        status: "To be reviewed",
        availableOnBrandWebsite: true
      },
      {
        mpn: "MPN-005",
        productName: "iPhone 15 Pro Max",
        seller: "Exertis",
        brand: "Apple",
        category: "Mobile phones",
        status: "Under review",
        availableOnBrandWebsite: true
      },
      {
        mpn: "MPN-006",
        productName: "MacBook Pro 16-inch",
        seller: "TechTrade",
        brand: "Apple",
        category: "Computers",
        status: "Reviewed",
        availableOnBrandWebsite: false
      }
    ];

    skuData.forEach(data => {
      const sku: ProductSKU = { ...data, id: this.currentSKUId++, dateUploaded: new Date() };
      this.productSKUs.set(sku.id, sku);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id || crypto.randomUUID(),
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      createdAt: userData.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getCategoryMappings(): Promise<CategoryMapping[]> {
    return Array.from(this.categoryMappings.values());
  }

  async updateCategoryMapping(id: number, selectedCategory: string[]): Promise<CategoryMapping> {
    const mapping = this.categoryMappings.get(id);
    if (!mapping) {
      throw new Error("Category mapping not found");
    }
    
    const updated = { ...mapping, selectedCategory };
    this.categoryMappings.set(id, updated);
    return updated;
  }

  async approveCategoryMappings(): Promise<void> {
    // In a real application, this would persist the approved mappings
    console.log("Category mappings approved");
  }

  async getProductVariants(): Promise<ProductVariant[]> {
    return Array.from(this.productVariants.values());
  }

  async updateProductVariant(id: number, productTags: Array<{text: string, type: 'group' | 'product', color: 'blue' | 'red'}>): Promise<ProductVariant> {
    const variant = this.productVariants.get(id);
    if (!variant) {
      throw new Error("Product variant not found");
    }
    
    // If no tags remain, delete the variant
    if (productTags.length === 0) {
      this.productVariants.delete(id);
      return variant; // Return the deleted variant for confirmation
    }
    
    const updated = { ...variant, productTags };
    this.productVariants.set(id, updated);
    return updated;
  }

  async createNewGroup(sourceVariantId: number, tagText: string): Promise<ProductVariant> {
    const sourceVariant = this.productVariants.get(sourceVariantId);
    if (!sourceVariant) {
      throw new Error("Source variant not found");
    }

    // Remove the tag from source variant
    const updatedSourceTags = sourceVariant.productTags.filter(tag => tag.text !== tagText);
    
    // If source variant has no tags left, delete it
    if (updatedSourceTags.length === 0) {
      this.productVariants.delete(sourceVariantId);
    } else {
      const updatedSource = { ...sourceVariant, productTags: updatedSourceTags };
      this.productVariants.set(sourceVariantId, updatedSource);
    }

    // Create new variant with the same seller, category, brand but only the moved tag
    const newVariant: ProductVariant = {
      id: this.currentProductId++,
      serialNumber: Math.max(...Array.from(this.productVariants.values()).map(v => v.serialNumber)) + 1,
      seller: sourceVariant.seller,
      eeCategory: sourceVariant.eeCategory,
      brand: sourceVariant.brand,
      productTags: [{ text: tagText, type: "product", color: "blue" }],
      groupingLogic: "New group"
    };

    this.productVariants.set(newVariant.id, newVariant);
    return newVariant;
  }

  async approveProductGroupings(): Promise<void> {
    // In a real application, this would persist the approved product groupings
    console.log("Product groupings approved");
  }

  async getProductSKUs(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'dateUploaded',
    sortOrder: 'asc' | 'desc' = 'desc',
    filters?: { seller?: string; brand?: string; category?: string; status?: string }
  ): Promise<{ data: ProductSKU[], total: number }> {
    let skus = Array.from(this.productSKUs.values());
    
    // Apply filters
    if (filters) {
      if (filters.seller) {
        skus = skus.filter(sku => sku.seller.toLowerCase().includes(filters.seller!.toLowerCase()));
      }
      if (filters.brand) {
        skus = skus.filter(sku => sku.brand.toLowerCase().includes(filters.brand!.toLowerCase()));
      }
      if (filters.category) {
        skus = skus.filter(sku => sku.category.toLowerCase().includes(filters.category!.toLowerCase()));
      }
      if (filters.status) {
        skus = skus.filter(sku => sku.status === filters.status);
      }
    }

    // Sort
    skus.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'dateUploaded') {
        aValue = a.dateUploaded!.getTime();
        bValue = b.dateUploaded!.getTime();
      } else {
        aValue = (a as any)[sortBy];
        bValue = (b as any)[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    const total = skus.length;
    const offset = (page - 1) * limit;
    const data = skus.slice(offset, offset + limit);

    return { data, total };
  }

  async createProductSKU(productSKUData: InsertProductSKU): Promise<ProductSKU> {
    const productSKU: ProductSKU = {
      ...productSKUData,
      id: this.currentSKUId++,
      dateUploaded: new Date(),
      status: productSKUData.status || "Saved",
    };
    this.productSKUs.set(productSKU.id, productSKU);
    return productSKU;
  }

  async updateProductSKU(id: number, updates: Partial<ProductSKU>): Promise<ProductSKU> {
    const sku = this.productSKUs.get(id);
    if (!sku) {
      throw new Error("Product SKU not found");
    }
    
    const updated = { ...sku, ...updates };
    this.productSKUs.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
