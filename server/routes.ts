import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Category Mappings API
  app.get("/api/category-mappings", async (req, res) => {
    try {
      const mappings = await storage.getCategoryMappings();
      res.json(mappings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category mappings" });
    }
  });

  app.patch("/api/category-mappings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { selectedCategory } = req.body;
      
      if (!selectedCategory) {
        return res.status(400).json({ message: "selectedCategory is required" });
      }
      
      const updated = await storage.updateCategoryMapping(id, selectedCategory);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category mapping" });
    }
  });

  app.post("/api/category-mappings/approve", async (req, res) => {
    try {
      await storage.approveCategoryMappings();
      res.json({ message: "Category mappings approved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve category mappings" });
    }
  });

  // Product Variants API
  app.get("/api/product-variants", async (req, res) => {
    try {
      const variants = await storage.getProductVariants();
      res.json(variants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product variants" });
    }
  });

  app.patch("/api/product-variants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { productTags } = req.body;
      
      if (!productTags) {
        return res.status(400).json({ message: "productTags is required" });
      }
      
      const updated = await storage.updateProductVariant(id, productTags);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product variant" });
    }
  });

  app.post("/api/product-variants/create-group", async (req, res) => {
    try {
      const { sourceVariantId, tagText } = req.body;
      
      if (!sourceVariantId || !tagText) {
        return res.status(400).json({ message: "sourceVariantId and tagText are required" });
      }
      
      const newVariant = await storage.createNewGroup(sourceVariantId, tagText);
      res.json(newVariant);
    } catch (error) {
      res.status(500).json({ message: "Failed to create new group" });
    }
  });

  app.post("/api/product-variants/approve", async (req, res) => {
    try {
      await storage.approveProductGroupings();
      res.json({ message: "Product groupings approved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve product groupings" });
    }
  });

  // Product SKUs API (Product enrichment)
  app.get("/api/product-skus", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'dateUploaded';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
      
      const filters = {
        seller: req.query.seller as string,
        brand: req.query.brand as string,
        category: req.query.category as string,
        status: req.query.status as string,
        availableOnBrandWebsite: req.query.availableOnBrandWebsite as string,
      };

      const result = await storage.getProductSKUs(page, limit, sortBy, sortOrder, filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product SKUs" });
    }
  });

  app.post("/api/product-skus", async (req, res) => {
    try {
      const productSKUSchema = z.object({
        mpn: z.string().min(1),
        productName: z.string().min(1),
        seller: z.string().min(1),
        brand: z.string().min(1),
        category: z.string().min(1),
        status: z.string().optional().default("Saved"),
      });
      
      const validatedData = productSKUSchema.parse(req.body);
      const newSKU = await storage.createProductSKU(validatedData);
      res.status(201).json(newSKU);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product SKU" });
    }
  });

  app.patch("/api/product-skus/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const updateSchema = z.object({
        mpn: z.string().min(1).optional(),
        productName: z.string().min(1).optional(),
        seller: z.string().min(1).optional(),
        brand: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        status: z.string().optional(),
      });
      
      const validatedUpdates = updateSchema.parse(req.body);
      const updated = await storage.updateProductSKU(id, validatedUpdates);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product SKU" });
    }
  });

  // Team Members API
  app.get("/api/team-members", async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post("/api/team-members", async (req, res) => {
    try {
      const memberSchema = z.object({
        email: z.string().email(),
        name: z.string().min(1),
        roles: z.array(z.enum(['admin', 'product_enrichment', 'product_grouping', 'category_mapping'])).min(1)
      });
      
      const validatedMember = memberSchema.parse(req.body);
      const member = await storage.addTeamMember(validatedMember);
      res.json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add team member" });
    }
  });

  app.delete("/api/team-members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      await storage.removeTeamMember(id);
      res.json({ message: "Team member removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove team member" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
