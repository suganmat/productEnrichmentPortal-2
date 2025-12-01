import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Plus, Save, Trash2, GripVertical } from "lucide-react";
import { motion } from "framer-motion";

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

export function AttributesDetailsSettings() {
  const [selectedParent, setSelectedParent] = useState<ParentCategory | null>(null);
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<number>>(new Set());
  const [selectedLeafCategory, setSelectedLeafCategory] = useState<SubCategory | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([
    { id: 1, name: "Color", description: "Product color options", sequence: 1 },
    { id: 2, name: "Size", description: "Available sizes", sequence: 2 },
    { id: 3, name: "Material", description: "Material composition", sequence: 3 }
  ]);
  const [keyFeaturesFormat, setKeyFeaturesFormat] = useState("grid");
  const [keyFeaturesInstructions, setKeyFeaturesInstructions] = useState("Display up to 5 key features with icons");

  // Mock data
  const parentCategories: ParentCategory[] = [
    { id: 1, name: "Electronics", subCategoryCount: 5 },
    { id: 2, name: "Fashion", subCategoryCount: 8 },
    { id: 3, name: "Home & Garden", subCategoryCount: 6 }
  ];

  const getSubCategories = (parentId: number): SubCategory[] => {
    const mockData: { [key: number]: SubCategory[] } = {
      1: [
        { id: 11, name: "Mobile Phones", hasChildren: true, level: 1 },
        { id: 12, name: "Laptops", hasChildren: true, level: 1 },
        { id: 13, name: "Accessories", hasChildren: false, level: 1 }
      ],
      2: [
        { id: 21, name: "Men's Clothing", hasChildren: true, level: 1 },
        { id: 22, name: "Women's Clothing", hasChildren: false, level: 1 }
      ]
    };
    return mockData[parentId] || [];
  };

  const getChildSubCategories = (parentId: number): SubCategory[] => {
    const mockData: { [key: number]: SubCategory[] } = {
      11: [
        { id: 111, name: "Smartphones", hasChildren: false, level: 2 },
        { id: 112, name: "Feature Phones", hasChildren: false, level: 2 }
      ],
      12: [
        { id: 121, name: "Gaming Laptops", hasChildren: false, level: 2 },
        { id: 122, name: "Ultrabooks", hasChildren: false, level: 2 }
      ]
    };
    return mockData[parentId] || [];
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

        {/* Right: Details when leaf selected */}
        {selectedLeafCategory && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{selectedLeafCategory.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-gray-600">Selected leaf category for configuration</p>
                <Button className="w-full" size="sm" data-testid="configure-leaf">
                  Configure Attributes & Features
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs for Attributes & Features */}
      {selectedLeafCategory && (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="attributes" data-testid="config-tabs">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="attributes">Product Attributes</TabsTrigger>
                <TabsTrigger value="features">Key Features</TabsTrigger>
              </TabsList>

              {/* Tab 1: Attributes */}
              <TabsContent value="attributes" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Product Attributes</h3>
                  <Button
                    size="sm"
                    onClick={addAttribute}
                    data-testid="add-attribute"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Attribute
                  </Button>
                </div>

                <div className="space-y-3 max-h-80 overflow-auto">
                  {attributes.map((attr, idx) => (
                    <motion.div
                      key={attr.id}
                      className="border rounded-lg p-3 bg-white"
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

                <div className="flex justify-end">
                  <Button data-testid="save-attributes">
                    <Save className="w-4 h-4 mr-2" />
                    Save Attributes
                  </Button>
                </div>
              </TabsContent>

              {/* Tab 2: Key Features */}
              <TabsContent value="features" className="space-y-4">
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

                <div className="flex justify-end">
                  <Button data-testid="save-features-config">
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
