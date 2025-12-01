import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Plus, Save, Trash2, GripVertical, X, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ParentCategory {
  id: number;
  name: string;
  subCategoryCount: number;
}

interface SubCategory {
  id: number;
  name: string;
  hasChildren: boolean;
  level: number;
}

interface Attribute {
  id: number;
  name: string;
  description: string;
  sequence: number;
}

interface SampleAttribute {
  id: number;
  name: string;
  description: string;
}

export function AttributesDetailsSettings() {
  const [selectedParent, setSelectedParent] = useState<ParentCategory | null>(null);
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<number>>(new Set());
  const [selectedLeafCategory, setSelectedLeafCategory] = useState<SubCategory | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([
    { id: 1, name: "Color", description: "Product color options", sequence: 1 },
    { id: 2, name: "Size", description: "Available sizes", sequence: 2 },
    { id: 3, name: "Material", description: "Material composition", sequence: 3 }
  ]);
  const [keyFeaturesFormat, setKeyFeaturesFormat] = useState("grid");
  const [keyFeaturesInstructions, setKeyFeaturesInstructions] = useState("Display up to 5 key features with icons");

  // Mock data - 18 parent categories with deep hierarchies
  const parentCategories: ParentCategory[] = [
    { id: 1, name: "Electronics", subCategoryCount: 10 },
    { id: 2, name: "Fashion & Apparel", subCategoryCount: 10 },
    { id: 3, name: "Home & Garden", subCategoryCount: 9 },
    { id: 4, name: "Sports & Outdoors", subCategoryCount: 10 },
    { id: 5, name: "Beauty & Personal Care", subCategoryCount: 8 },
    { id: 6, name: "Toys & Games", subCategoryCount: 9 },
    { id: 7, name: "Books & Media", subCategoryCount: 7 },
    { id: 8, name: "Food & Beverages", subCategoryCount: 9 },
    { id: 9, name: "Automotive", subCategoryCount: 10 },
    { id: 10, name: "Industrial & Supplies", subCategoryCount: 8 },
    { id: 11, name: "Pet Supplies", subCategoryCount: 9 },
    { id: 12, name: "Baby & Kids", subCategoryCount: 10 },
    { id: 13, name: "Furniture", subCategoryCount: 9 },
    { id: 14, name: "Office Equipment", subCategoryCount: 8 },
    { id: 15, name: "Luggage & Travel", subCategoryCount: 7 },
    { id: 16, name: "Jewelry & Watches", subCategoryCount: 8 },
    { id: 17, name: "Tools & Hardware", subCategoryCount: 10 },
    { id: 18, name: "Art & Craft", subCategoryCount: 9 }
  ];

  const getSubCategories = (parentId: number): SubCategory[] => {
    const mockData: { [key: number]: SubCategory[] } = {
      1: [
        { id: 11, name: "Mobile Phones", hasChildren: true, level: 1 },
        { id: 12, name: "Laptops & Computers", hasChildren: true, level: 1 },
        { id: 13, name: "Tablets", hasChildren: true, level: 1 },
        { id: 14, name: "Audio Devices", hasChildren: true, level: 1 },
        { id: 15, name: "Cameras", hasChildren: true, level: 1 },
        { id: 16, name: "Gaming Consoles", hasChildren: true, level: 1 },
        { id: 17, name: "Smart Home", hasChildren: true, level: 1 },
        { id: 18, name: "Wearables", hasChildren: false, level: 1 },
        { id: 19, name: "TV & Displays", hasChildren: false, level: 1 },
        { id: 20, name: "Cables & Adapters", hasChildren: false, level: 1 }
      ],
      2: [
        { id: 21, name: "Men's Clothing", hasChildren: true, level: 1 },
        { id: 22, name: "Women's Clothing", hasChildren: true, level: 1 },
        { id: 23, name: "Children's Clothing", hasChildren: true, level: 1 },
        { id: 24, name: "Footwear", hasChildren: true, level: 1 },
        { id: 25, name: "Bags & Backpacks", hasChildren: false, level: 1 },
        { id: 26, name: "Accessories", hasChildren: true, level: 1 },
        { id: 27, name: "Sports Wear", hasChildren: false, level: 1 },
        { id: 28, name: "Formal Wear", hasChildren: false, level: 1 },
        { id: 29, name: "Casual Wear", hasChildren: false, level: 1 },
        { id: 30, name: "Activewear", hasChildren: false, level: 1 }
      ],
      3: [
        { id: 31, name: "Furniture", hasChildren: true, level: 1 },
        { id: 32, name: "Bedding", hasChildren: true, level: 1 },
        { id: 33, name: "Kitchenware", hasChildren: true, level: 1 },
        { id: 34, name: "Decorations", hasChildren: true, level: 1 },
        { id: 35, name: "Lighting", hasChildren: false, level: 1 },
        { id: 36, name: "Rugs & Carpets", hasChildren: false, level: 1 },
        { id: 37, name: "Plants & Gardening", hasChildren: true, level: 1 },
        { id: 38, name: "Outdoor Furniture", hasChildren: false, level: 1 },
        { id: 39, name: "Storage Solutions", hasChildren: false, level: 1 }
      ]
    };
    return mockData[parentId] || [];
  };

  const getChildSubCategories = (parentId: number): SubCategory[] => {
    const mockData: { [key: number]: SubCategory[] } = {
      11: [
        { id: 111, name: "Android Smartphones", hasChildren: true, level: 2 },
        { id: 112, name: "iPhones", hasChildren: true, level: 2 },
        { id: 113, name: "Budget Phones", hasChildren: false, level: 2 },
        { id: 114, name: "Premium Phones", hasChildren: false, level: 2 }
      ],
      12: [
        { id: 121, name: "Gaming Laptops", hasChildren: true, level: 2 },
        { id: 122, name: "Ultrabooks", hasChildren: true, level: 2 },
        { id: 123, name: "Business Laptops", hasChildren: false, level: 2 },
        { id: 124, name: "Chromebooks", hasChildren: false, level: 2 }
      ],
      13: [
        { id: 131, name: "iPad Pro", hasChildren: false, level: 2 },
        { id: 132, name: "Android Tablets", hasChildren: true, level: 2 },
        { id: 133, name: "Budget Tablets", hasChildren: false, level: 2 }
      ],
      21: [
        { id: 211, name: "T-Shirts", hasChildren: true, level: 2 },
        { id: 212, name: "Shirts", hasChildren: true, level: 2 },
        { id: 213, name: "Pants", hasChildren: false, level: 2 },
        { id: 214, name: "Jackets", hasChildren: true, level: 2 }
      ],
      22: [
        { id: 221, name: "Tops", hasChildren: true, level: 2 },
        { id: 222, name: "Dresses", hasChildren: true, level: 2 },
        { id: 223, name: "Skirts", hasChildren: false, level: 2 },
        { id: 224, name: "Sarees", hasChildren: false, level: 2 }
      ],
      31: [
        { id: 311, name: "Sofas", hasChildren: true, level: 2 },
        { id: 312, name: "Beds", hasChildren: true, level: 2 },
        { id: 313, name: "Chairs", hasChildren: false, level: 2 },
        { id: 314, name: "Tables", hasChildren: false, level: 2 }
      ],
      111: [
        { id: 1111, name: "Android Budget (Under 15K)", hasChildren: true, level: 3 },
        { id: 1112, name: "Android Mid-Range (15K-40K)", hasChildren: true, level: 3 },
        { id: 1113, name: "Android Premium (40K+)", hasChildren: false, level: 3 }
      ],
      112: [
        { id: 1121, name: "iPhone 13 & Below", hasChildren: true, level: 3 },
        { id: 1122, name: "iPhone 14 Series", hasChildren: true, level: 3 },
        { id: 1123, name: "iPhone 15 Series", hasChildren: false, level: 3 }
      ],
      121: [
        { id: 1211, name: "Entry Level Gaming", hasChildren: true, level: 3 },
        { id: 1212, name: "Mid-Range Gaming", hasChildren: true, level: 3 },
        { id: 1213, name: "High-End Gaming", hasChildren: false, level: 3 }
      ],
      211: [
        { id: 2111, name: "Casual T-Shirts", hasChildren: true, level: 3 },
        { id: 2112, name: "Formal T-Shirts", hasChildren: false, level: 3 },
        { id: 2113, name: "Sports T-Shirts", hasChildren: false, level: 3 }
      ],
      311: [
        { id: 3111, name: "2-Seater Sofas", hasChildren: true, level: 3 },
        { id: 3112, name: "3-Seater Sofas", hasChildren: true, level: 3 },
        { id: 3113, name: "Sectional Sofas", hasChildren: false, level: 3 }
      ],
      1111: [
        { id: 11111, name: "Xiaomi Budget Phones", hasChildren: true, level: 4 },
        { id: 11112, name: "Realme Budget Phones", hasChildren: false, level: 4 },
        { id: 11113, name: "Motorola Budget Phones", hasChildren: false, level: 4 }
      ],
      1121: [
        { id: 11211, name: "iPhone 13", hasChildren: true, level: 4 },
        { id: 11212, name: "iPhone 13 Pro", hasChildren: false, level: 4 },
        { id: 11213, name: "iPhone 13 Pro Max", hasChildren: false, level: 4 }
      ],
      1211: [
        { id: 12111, name: "RTX 2060 Gaming Laptops", hasChildren: true, level: 4 },
        { id: 12112, name: "RTX 3050 Gaming Laptops", hasChildren: false, level: 4 },
        { id: 12113, name: "GTX 1650 Gaming Laptops", hasChildren: false, level: 4 }
      ],
      2111: [
        { id: 21111, name: "Cotton Casual T-Shirts", hasChildren: true, level: 4 },
        { id: 21112, name: "Printed Casual T-Shirts", hasChildren: false, level: 4 },
        { id: 21113, name: "Solid Casual T-Shirts", hasChildren: false, level: 4 }
      ],
      3111: [
        { id: 31111, name: "Fabric 2-Seater Sofas", hasChildren: true, level: 5 },
        { id: 31112, name: "Leather 2-Seater Sofas", hasChildren: false, level: 5 }
      ],
      11111: [
        { id: 111111, name: "Xiaomi Redmi Note Series", hasChildren: false, level: 5 },
        { id: 111112, name: "Xiaomi Poco Series", hasChildren: false, level: 5 },
        { id: 111113, name: "Xiaomi A Series", hasChildren: false, level: 5 }
      ],
      12111: [
        { id: 121111, name: "MSI RTX 2060 Laptops", hasChildren: false, level: 5 },
        { id: 121112, name: "ASUS RTX 2060 Laptops", hasChildren: false, level: 5 },
        { id: 121113, name: "Dell RTX 2060 Laptops", hasChildren: false, level: 5 }
      ],
      21111: [
        { id: 211111, name: "100% Cotton White T-Shirts", hasChildren: false, level: 5 },
        { id: 211112, name: "100% Cotton Colored T-Shirts", hasChildren: false, level: 5 },
        { id: 211113, name: "100% Cotton Striped T-Shirts", hasChildren: false, level: 5 }
      ],
      31111: [
        { id: 311111, name: "Velvet Fabric 2-Seater Sofas", hasChildren: false, level: 5 },
        { id: 311112, name: "Linen Fabric 2-Seater Sofas", hasChildren: false, level: 5 }
      ]
    };
    return mockData[parentId] || [];
  };

  const getSampleAttributes = (leafCategoryId?: number): SampleAttribute[] => {
    const categoryAttributes: { [key: number]: SampleAttribute[] } = {
      113: [
        { id: 1, name: "Screen Size", description: "Display diagonal in inches" },
        { id: 2, name: "Battery Capacity", description: "Battery mAh rating" },
        { id: 3, name: "Processor", description: "CPU chipset brand and model" },
        { id: 4, name: "RAM", description: "Random Access Memory in GB" },
        { id: 5, name: "Storage", description: "Internal storage capacity" }
      ],
      114: [
        { id: 1, name: "Processor", description: "CPU model and generation" },
        { id: 2, name: "RAM", description: "System memory in GB" },
        { id: 3, name: "Storage", description: "SSD/HDD capacity" },
        { id: 4, name: "Display", description: "Screen size and refresh rate" },
        { id: 5, name: "GPU", description: "Graphics card model" }
      ],
      213: [
        { id: 1, name: "Fabric", description: "Material composition" },
        { id: 2, name: "Size", description: "Clothing size (S, M, L, XL)" },
        { id: 3, name: "Color", description: "Available color options" },
        { id: 4, name: "Fit", description: "Fit type (Slim, Regular, Loose)" },
        { id: 5, name: "Care", description: "Washing and care instructions" }
      ],
      313: [
        { id: 1, name: "Material", description: "Upholstery fabric type" },
        { id: 2, name: "Dimensions", description: "Length x Width x Height" },
        { id: 3, name: "Seating Capacity", description: "Number of seats" },
        { id: 4, name: "Color", description: "Available colors" },
        { id: 5, name: "Assembly", description: "Assembly required status" }
      ],
      131: [
        { id: 1, name: "Screen Size", description: "Display diagonal in inches" },
        { id: 2, name: "Storage", description: "Internal storage capacity" },
        { id: 3, name: "RAM", description: "System memory" },
        { id: 4, name: "Camera", description: "Rear camera megapixels" },
        { id: 5, name: "Battery Life", description: "Estimated hours of usage" }
      ]
    };
    return categoryAttributes[leafCategoryId ?? 0] || [
      { id: 1, name: "Attribute 1", description: "Sample attribute description" },
      { id: 2, name: "Attribute 2", description: "Sample attribute description" },
      { id: 3, name: "Attribute 3", description: "Sample attribute description" },
      { id: 4, name: "Attribute 4", description: "Sample attribute description" },
      { id: 5, name: "Attribute 5", description: "Sample attribute description" }
    ];
  };

  const toggleSubCategory = (id: number) => {
    const newExpanded = new Set(expandedSubCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSubCategories(newExpanded);
  };

  const addAttribute = () => {
    const newAttribute: Attribute = {
      id: Date.now(),
      name: "New Attribute",
      description: "Description",
      sequence: attributes.length + 1
    };
    setAttributes([...attributes, newAttribute]);
  };

  const deleteAttribute = (id: number) => {
    setAttributes(attributes.filter(attr => attr.id !== id).map((attr, idx) => ({ ...attr, sequence: idx + 1 })));
  };

  const updateAttribute = (id: number, field: string, value: string) => {
    setAttributes(attributes.map(attr =>
      attr.id === id ? { ...attr, [field]: value } : attr
    ));
  };

  const moveAttribute = (id: number, direction: 'up' | 'down') => {
    const index = attributes.findIndex(a => a.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < attributes.length - 1)) {
      const newAttrs = [...attributes];
      const swap = direction === 'up' ? index - 1 : index + 1;
      [newAttrs[index], newAttrs[swap]] = [newAttrs[swap], newAttrs[index]];
      setAttributes(newAttrs.map((attr, idx) => ({ ...attr, sequence: idx + 1 })));
    }
  };

  const renderSubCategoryTree = (categories: SubCategory[], parentId?: number) => {
    return categories.map(category => (
      <div key={category.id}>
        <motion.div
          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
          onClick={() => {
            if (category.hasChildren) {
              toggleSubCategory(category.id);
            } else {
              setSelectedLeafCategory(category);
            }
          }}
          whileHover={{ x: 4 }}
        >
          {category.hasChildren && (
            <ChevronRight
              className={`w-4 h-4 transform transition-transform ${expandedSubCategories.has(category.id) ? 'rotate-90' : ''}`}
            />
          )}
          {!category.hasChildren && <div className="w-4" />}
          <span className={`text-sm ${!category.hasChildren ? 'font-semibold text-blue-600' : ''}`}>
            {category.name}
          </span>
          {!category.hasChildren && (
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Leaf
            </span>
          )}
        </motion.div>
        {category.hasChildren && expandedSubCategories.has(category.id) && (
          <div className="ml-4 space-y-1">
            {renderSubCategoryTree(getChildSubCategories(category.id), category.id)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Parent Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parent Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parentCategories.map(category => (
                <motion.button
                  key={category.id}
                  onClick={() => {
                    setSelectedParent(category);
                    setSelectedLeafCategory(null);
                    setExpandedSubCategories(new Set());
                  }}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    selectedParent?.id === category.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  whileHover={{ x: 4 }}
                  data-testid={`parent-category-${category.id}`}
                >
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs text-gray-500">{category.subCategoryCount} subcategories</div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Middle: Sub Categories */}
        {selectedParent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subcategories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-auto">
                {renderSubCategoryTree(getSubCategories(selectedParent.id))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Right: Sample Attributes Display */}
        {selectedLeafCategory && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{selectedLeafCategory.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 font-semibold">Sample Attributes ({getSampleAttributes(selectedLeafCategory.id).length})</p>
                
                <div className="space-y-3 max-h-80 overflow-auto">
                  {getSampleAttributes(selectedLeafCategory.id).map((attr) => (
                    <motion.div
                      key={attr.id}
                      className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-transparent hover:shadow-md transition-shadow"
                      whileHover={{ x: 4 }}
                      data-testid={`sample-attr-${attr.id}`}
                    >
                      <div className="text-sm font-medium text-gray-900">{attr.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{attr.description}</div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  onClick={() => setIsConfiguring(true)}
                  className="w-full mt-auto p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid="configure-leaf"
                >
                  <Edit2 className="w-4 h-4" />
                  Configure Attributes & Features
                </motion.button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configuration Modal/Section */}
      <AnimatePresence>
        {isConfiguring && selectedLeafCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-testid="config-modal"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Configure Attributes & Features</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedLeafCategory.name}</p>
                </div>
                <motion.button
                  onClick={() => setIsConfiguring(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="close-modal"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Modal Content - Tabs */}
              <div className="p-6">
                <Tabs defaultValue="attributes" data-testid="config-tabs">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="attributes">Product Attributes</TabsTrigger>
                    <TabsTrigger value="features">Key Features</TabsTrigger>
                  </TabsList>

                  {/* Tab 1: Attributes */}
                  <TabsContent value="attributes" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Edit Product Attributes</h3>
                      <Button
                        size="sm"
                        onClick={addAttribute}
                        data-testid="add-attribute"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Attribute
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-auto">
                      {attributes.map((attr) => (
                        <motion.div
                          key={attr.id}
                          className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
                          layout
                          data-testid={`attribute-${attr.id}`}
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 mt-1 text-gray-400" />
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Attribute name"
                                value={attr.name}
                                onChange={(e) => updateAttribute(attr.id, 'name', e.target.value)}
                                className="text-sm"
                                data-testid={`attr-name-${attr.id}`}
                              />
                              <Textarea
                                placeholder="Description"
                                value={attr.description}
                                onChange={(e) => updateAttribute(attr.id, 'description', e.target.value)}
                                className="text-sm resize-none"
                                rows={2}
                                data-testid={`attr-desc-${attr.id}`}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAttribute(attr.id)}
                              data-testid={`delete-attr-${attr.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button data-testid="save-attributes">
                        <Save className="w-4 h-4 mr-2" />
                        Save Attributes
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Tab 2: Key Features */}
                  <TabsContent value="features" className="space-y-4 mt-4">
                    <h3 className="font-semibold">Key Features Configuration</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Display Format</label>
                        <select
                          value={keyFeaturesFormat}
                          onChange={(e) => setKeyFeaturesFormat(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                          data-testid="features-format"
                        >
                          <option value="grid">Grid Layout</option>
                          <option value="list">List Layout</option>
                          <option value="carousel">Carousel Layout</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Instructions for End Users</label>
                        <Textarea
                          value={keyFeaturesInstructions}
                          onChange={(e) => setKeyFeaturesInstructions(e.target.value)}
                          placeholder="Describe how key features should be displayed..."
                          rows={4}
                          className="mt-1 text-sm"
                          data-testid="features-instructions"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button data-testid="save-features-config">
                        <Save className="w-4 h-4 mr-2" />
                        Save Configuration
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
