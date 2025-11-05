import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Search, Filter, ArrowUpDown, ArrowLeft, Upload, MessageCircle, Plus, Undo, Save, RotateCcw, X, Move, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { ProductSKU } from "@shared/schema";
import { UploadDialog } from "@/components/upload-dialog";

interface ProductSKUResponse {
  data: ProductSKU[];
  total: number;
}

export function ProductEnrichmentTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('dateUploaded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    seller: 'all',
    brand: 'all',
    category: 'all',
    status: 'all',
    availableOnBrandWebsite: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductSKU | null>(null);
  const [activeTab, setActiveTab] = useState('specs');
  const [chatMessages, setChatMessages] = useState<{id: number, text: string, sender: 'user' | 'system'}[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedFilesByProduct, setUploadedFilesByProduct] = useState<Map<string, {id: number, name: string, type: string, source: 'local' | 'onedrive' | 'url', url?: string, uploadedAt: Date}[]>>(new Map());

  const { data, isLoading, error } = useQuery<ProductSKUResponse>({
    queryKey: ['/api/product-skus', currentPage, pageSize, sortBy, sortOrder, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy,
        sortOrder,
        ...(filters.seller && filters.seller !== 'all' && { seller: filters.seller }),
        ...(filters.brand && filters.brand !== 'all' && { brand: filters.brand }),
        ...(filters.category && filters.category !== 'all' && { category: filters.category }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.availableOnBrandWebsite && filters.availableOnBrandWebsite !== 'all' && { availableOnBrandWebsite: filters.availableOnBrandWebsite }),
      });
      const response = await fetch(`/api/product-skus?${params}`);
      if (!response.ok) throw new Error('Failed to fetch product SKUs');
      return response.json();
    },
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ seller: 'all', brand: 'all', category: 'all', status: 'all', availableOnBrandWebsite: 'all' });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To be reviewed':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Under review':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Reviewed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        text: newMessage,
        sender: 'user'
      }]);
      setNewMessage('');
      
      // Auto-response simulation
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: "Thank you for your message. How can I assist you with this product?",
          sender: 'system'
        }]);
      }, 1000);
    }
  };

  const handleFileUpload = (file: { name: string; type: string; source: 'local' | 'onedrive' | 'url'; url?: string }) => {
    if (!selectedProduct) return;
    
    const newFile = {
      id: Date.now(),
      ...file,
      uploadedAt: new Date()
    };
    
    setUploadedFilesByProduct(prev => {
      const newMap = new Map(prev);
      const productFiles = newMap.get(selectedProduct.mpn) || [];
      newMap.set(selectedProduct.mpn, [...productFiles, newFile]);
      return newMap;
    });
  };

  const handleDeleteFile = (fileId: number) => {
    if (!selectedProduct) return;
    
    setUploadedFilesByProduct(prev => {
      const newMap = new Map(prev);
      const productFiles = newMap.get(selectedProduct.mpn) || [];
      newMap.set(selectedProduct.mpn, productFiles.filter(file => file.id !== fileId));
      return newMap;
    });
  };

  // Get uploaded files for current product
  const currentProductFiles = selectedProduct 
    ? (uploadedFilesByProduct.get(selectedProduct.mpn) || [])
    : [];

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-red-600">Failed to load product SKUs</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedProduct) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedProduct(null)}
                data-testid="back-to-list"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
              <span>{selectedProduct.productName}</span>
            </div>
            <Badge className={getStatusColor(selectedProduct.status)}>
              {selectedProduct.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 h-[800px]">
            {/* Left Layout - Larger */}
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="grid w-full grid-cols-6" data-testid="product-detail-tabs">
                  <TabsTrigger value="specs" data-testid="tab-specs">Product Specs</TabsTrigger>
                  <TabsTrigger value="features" data-testid="tab-features">Key Features</TabsTrigger>
                  <TabsTrigger value="faqs" data-testid="tab-faqs">FAQs</TabsTrigger>
                  <TabsTrigger value="images" data-testid="tab-images">Images</TabsTrigger>
                  <TabsTrigger value="html" data-testid="tab-html">HTML Assets</TabsTrigger>
                  <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
                </TabsList>
                
                <TabsContent value="specs" className="h-full mt-4">
                  <ProductSpecsSection product={selectedProduct} />
                </TabsContent>
                
                <TabsContent value="features" className="h-full mt-4">
                  <KeyFeaturesSection product={selectedProduct} />
                </TabsContent>
                
                <TabsContent value="faqs" className="h-full mt-4">
                  <FAQsSection product={selectedProduct} />
                </TabsContent>
                
                <TabsContent value="images" className="h-full mt-4">
                  <ImagesSection product={selectedProduct} />
                </TabsContent>
                
                <TabsContent value="html" className="h-full mt-4">
                  <HTMLAssetsSection product={selectedProduct} />
                </TabsContent>
                
                <TabsContent value="summary" className="h-full mt-4">
                  <SummarySection product={selectedProduct} />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right Layout - Smaller */}
            <div className="w-80 border-l border-gray-200 pl-6">
              <div className="space-y-4 h-full flex flex-col">
                {/* File Upload Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setUploadDialogOpen(true)}
                  data-testid="upload-files"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
                
                {/* Uploaded Files List */}
                {currentProductFiles.length > 0 && (
                  <div className="border rounded-lg">
                    <div className="p-3 border-b bg-gray-50 font-medium text-sm" data-testid="uploaded-files-header">
                      Uploaded Files ({currentProductFiles.length})
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {currentProductFiles.map((file) => (
                        <div 
                          key={file.id} 
                          className="p-3 border-b last:border-b-0 hover:bg-gray-50 flex items-center justify-between"
                          data-testid={`uploaded-file-${file.id}`}
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {file.source === 'url' ? 'URL' : file.source === 'onedrive' ? 'OneDrive' : 'Local'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                            data-testid={`delete-file-${file.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Chat Feature */}
                <div className="flex-1 flex flex-col border rounded-lg">
                  <div className="p-3 border-b bg-gray-50 font-medium flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat Support
                  </div>
                  
                  <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-96">
                    {chatMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-2 rounded text-sm ${
                          message.sender === 'user' 
                            ? 'bg-blue-100 text-blue-900 ml-4' 
                            : 'bg-gray-100 text-gray-900 mr-4'
                        }`}
                        data-testid={`chat-message-${message.id}`}
                      >
                        {message.text}
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        data-testid="chat-input"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleSendMessage}
                        data-testid="send-message"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upload Dialog */}
            <UploadDialog
              open={uploadDialogOpen}
              onClose={() => setUploadDialogOpen(false)}
              onUpload={handleFileUpload}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Product Enrichment</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-normal text-gray-500">
              {data ? `${data.data.length} of ${data.total} products` : 'Loading...'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-products"
              />
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters} data-testid="clear-filters">
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.seller} onValueChange={(value) => handleFilterChange('seller', value === "all" ? "" : value)}>
              <SelectTrigger data-testid="filter-seller">
                <SelectValue placeholder="Filter by Seller" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sellers</SelectItem>
                <SelectItem value="Westcoast">Westcoast</SelectItem>
                <SelectItem value="Exertis">Exertis</SelectItem>
                <SelectItem value="TechTrade">TechTrade</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.brand} onValueChange={(value) => handleFilterChange('brand', value === "all" ? "" : value)}>
              <SelectTrigger data-testid="filter-brand">
                <SelectValue placeholder="Filter by Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="Samsung">Samsung</SelectItem>
                <SelectItem value="Sony">Sony</SelectItem>
                <SelectItem value="Dell">Dell</SelectItem>
                <SelectItem value="LG">LG</SelectItem>
                <SelectItem value="Apple">Apple</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value === "all" ? "" : value)}>
              <SelectTrigger data-testid="filter-category">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Mobile phones">Mobile phones</SelectItem>
                <SelectItem value="Audio equipment">Audio equipment</SelectItem>
                <SelectItem value="Computers">Computers</SelectItem>
                <SelectItem value="Monitors">Monitors</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value === "all" ? "" : value)}>
              <SelectTrigger data-testid="filter-status">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="To be reviewed">To be reviewed</SelectItem>
                <SelectItem value="Under review">Under review</SelectItem>
                <SelectItem value="Reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.availableOnBrandWebsite} onValueChange={(value) => handleFilterChange('availableOnBrandWebsite', value === "all" ? "" : value)}>
              <SelectTrigger data-testid="filter-available-on-brand-website">
                <SelectValue placeholder="Available on Website" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('mpn')}
                    className="h-auto p-0 font-semibold"
                    data-testid="sort-mpn"
                  >
                    MPN
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('productName')}
                    className="h-auto p-0 font-semibold"
                    data-testid="sort-product-name"
                  >
                    Product Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('dateUploaded')}
                    className="h-auto p-0 font-semibold"
                    data-testid="sort-date-uploaded"
                  >
                    Date Uploaded
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('status')}
                    className="h-auto p-0 font-semibold"
                    data-testid="sort-status"
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('availableOnBrandWebsite')}
                    className="h-auto p-0 font-semibold"
                    data-testid="sort-available-on-brand-website"
                  >
                    Available on Brand Website
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((product) => (
                  <TableRow 
                    key={product.id} 
                    data-testid={`product-row-${product.id}`}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <TableCell className="font-mono text-sm" data-testid={`mpn-${product.id}`}>
                      {product.mpn}
                    </TableCell>
                    <TableCell data-testid={`product-name-${product.id}`}>
                      {product.productName}
                    </TableCell>
                    <TableCell data-testid={`date-uploaded-${product.id}`}>
                      {product.dateUploaded ? format(new Date(product.dateUploaded), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell data-testid={`seller-${product.id}`}>
                      {product.seller}
                    </TableCell>
                    <TableCell data-testid={`brand-${product.id}`}>
                      {product.brand}
                    </TableCell>
                    <TableCell data-testid={`category-${product.id}`}>
                      {product.category}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={getStatusColor(product.status)}
                        data-testid={`status-${product.id}`}
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`available-on-brand-website-${product.id}`}>
                      <Badge 
                        className={product.availableOnBrandWebsite 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }
                      >
                        {product.availableOnBrandWebsite ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger className="w-16" data-testid="page-size-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                data-testid="previous-page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                data-testid="next-page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Product Specs Section Component
function ProductSpecsSection({ product }: { product: ProductSKU }) {
  const [specs, setSpecs] = useState([
    { key: 'Brand', value: product.brand, editable: false },
    { key: 'Type', value: 'LED', editable: true },
    { key: 'Screen Size', value: '27 inch', editable: true },
    { key: 'Display Features', value: '4K Ultra HD, 3840x2160, 60Hz, 300 cd/m²', editable: true },
    { key: 'Ports', value: '2 x HDMI, DisplayPort 1.4, Headphones (mini-jack)', editable: true },
    { key: 'What\'s In The Box', value: 'LG UltraFine 27US550-W, HDMI cable, Screws, stand base, Software', editable: true },
    { key: 'Product Dimensions (H/W/D)', value: '36.35 cm x 61.35 cm x 4.54 cm', editable: true },
    { key: 'Weight', value: '6.8 kg', editable: true },
    { key: 'MPN', value: product.mpn, editable: false }
  ]);
  const [history, setHistory] = useState<typeof specs[]>([]);

  const addRow = () => {
    setHistory(prev => [...prev, [...specs]]);
    setSpecs(prev => [...prev, { key: '', value: '', editable: true }]);
  };

  const removeRow = (index: number) => {
    setHistory(prev => [...prev, [...specs]]);
    setSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    setSpecs(prev => prev.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    ));
  };

  const undo = () => {
    if (history.length > 0) {
      setSpecs(history[history.length - 1]);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const moveRow = (fromIndex: number, toIndex: number) => {
    setHistory(prev => [...prev, [...specs]]);
    const newSpecs = [...specs];
    const [movedSpec] = newSpecs.splice(fromIndex, 1);
    newSpecs.splice(toIndex, 0, movedSpec);
    setSpecs(newSpecs);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Product Specifications</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0} data-testid="undo-specs">
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={addRow} data-testid="add-spec-row">
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
        </div>
      </div>
      
      <div className="flex-1 border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-4"></TableHead>
              <TableHead>Product Attribute</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specs.map((spec, index) => (
              <TableRow key={index} data-testid={`spec-row-${index}`}>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="cursor-move"
                    data-testid={`move-spec-${index}`}
                  >
                    <Move className="w-4 h-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  {spec.editable ? (
                    <Input
                      value={spec.key}
                      onChange={(e) => updateSpec(index, 'key', e.target.value)}
                      placeholder="Attribute name"
                      data-testid={`spec-key-${index}`}
                    />
                  ) : (
                    <span className="font-medium" data-testid={`spec-key-readonly-${index}`}>{spec.key}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    value={spec.value}
                    onChange={(e) => updateSpec(index, 'value', e.target.value)}
                    placeholder="Detail value"
                    data-testid={`spec-value-${index}`}
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeRow(index)}
                    data-testid={`remove-spec-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button data-testid="save-specs">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}

// Key Features Section Component
function KeyFeaturesSection({ product }: { product: ProductSKU }) {
  const [content, setContent] = useState(
    `High-Quality Display:
• 4K Ultra HD resolution (3840x2160) delivers crisp, clear images
• 60Hz refresh rate ensures smooth video playback
• 300 cd/m² brightness provides excellent visibility

Connectivity Options:
• Multiple HDMI ports for versatile device connections
• DisplayPort 1.4 for high-bandwidth digital content
• Headphone jack for personal audio experience

Complete Package:
• Includes all necessary cables and mounting hardware
• Professional stand with adjustable height
• Software suite for display optimization`
  );
  const [history, setHistory] = useState<string[]>([]);

  const rewrite = () => {
    setHistory(prev => [...prev, content]);
    setContent(
      `Enhanced Visual Experience:
• Superior 4K display technology for professional use
• Optimized color accuracy for creative professionals
• Anti-glare coating reduces eye strain

Advanced Connectivity:
• Future-proof DisplayPort technology
• Multiple input options for flexibility
• Plug-and-play compatibility

Value-Added Features:
• Energy-efficient LED backlight technology
• Ergonomic design for extended use
• Comprehensive warranty coverage`
    );
  };

  const undo = () => {
    if (history.length > 0) {
      setContent(history[history.length - 1]);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Key Features</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0} data-testid="undo-features">
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={rewrite} data-testid="rewrite-features">
            <RotateCcw className="w-4 h-4 mr-2" />
            Re-write
          </Button>
        </div>
      </div>
      
      <div className="flex-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-full resize-none"
          placeholder="Enter key features..."
          data-testid="features-content"
        />
      </div>
      
      <div className="flex justify-end mt-4">
        <Button data-testid="save-features">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}

// FAQs Section Component
function FAQsSection({ product }: { product: ProductSKU }) {
  const [faqs, setFaqs] = useState([
    { question: 'What is the screen size?', answer: '27 inches' },
    { question: 'What resolution does it support?', answer: '4K Ultra HD (3840x2160)' },
    { question: 'What ports are available?', answer: '2x HDMI, DisplayPort 1.4, Headphone jack' },
    { question: 'What is included in the box?', answer: 'Monitor, HDMI cable, screws, stand base, software' }
  ]);
  const [history, setHistory] = useState<typeof faqs[]>([]);

  const generateMoreFAQs = () => {
    setHistory(prev => [...prev, [...faqs]]);
    const newFAQs = [
      { question: 'Is this monitor suitable for gaming?', answer: 'Yes, with 60Hz refresh rate it provides smooth gaming experience' },
      { question: 'Does it support HDR?', answer: 'Please check the technical specifications for HDR support details' },
      { question: 'What is the warranty period?', answer: 'Standard manufacturer warranty applies - please check with seller' }
    ];
    setFaqs(prev => [...prev, ...newFAQs]);
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqs(prev => prev.map((faq, i) => 
      i === index ? { ...faq, [field]: value } : faq
    ));
  };

  const undo = () => {
    if (history.length > 0) {
      setFaqs(history[history.length - 1]);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0} data-testid="undo-faqs">
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button variant="outline" size="sm" data-testid="upload-faq-assets">
            <Upload className="w-4 h-4 mr-2" />
            Upload Assets
          </Button>
          <Button variant="outline" size="sm" onClick={generateMoreFAQs} data-testid="generate-faqs">
            <Plus className="w-4 h-4 mr-2" />
            Generate More FAQs
          </Button>
        </div>
      </div>
      
      <div className="flex-1 border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Answer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.map((faq, index) => (
              <TableRow key={index} data-testid={`faq-row-${index}`}>
                <TableCell className="font-medium">
                  <span data-testid={`faq-question-${index}`}>{faq.question}</span>
                </TableCell>
                <TableCell>
                  <Input
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                    data-testid={`faq-answer-${index}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-start mt-4">
        <Button data-testid="save-faqs">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}

// Images Section Component
function ImagesSection({ product }: { product: ProductSKU }) {
  const [images, setImages] = useState([
    { id: 1, url: '/api/placeholder/300/200', alt: 'Product main view' },
    { id: 2, url: '/api/placeholder/300/200', alt: 'Product side view' },
    { id: 3, url: '/api/placeholder/300/200', alt: 'Product back view' }
  ]);

  const addImage = () => {
    const newImage = {
      id: Date.now(),
      url: '/api/placeholder/300/200',
      alt: `Product image ${images.length + 1}`
    };
    setImages(prev => [...prev, newImage]);
  };

  const removeImage = (id: number) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Product Images</h3>
        <Button variant="outline" size="sm" onClick={addImage} data-testid="add-image">
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>
      
      <div className="flex-1 grid grid-cols-3 gap-4 overflow-auto">
        {images.map((image) => (
          <div key={image.id} className="relative border rounded-lg p-2" data-testid={`image-block-${image.id}`}>
            <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
              <span className="text-gray-500 text-sm">Image Placeholder</span>
            </div>
            <Input 
              value={image.alt} 
              onChange={(e) => setImages(prev => 
                prev.map(img => img.id === image.id ? { ...img, alt: e.target.value } : img)
              )}
              placeholder="Image description"
              className="text-xs"
              data-testid={`image-alt-${image.id}`}
            />
            <Button 
              variant="destructive" 
              size="sm" 
              className="absolute top-1 right-1"
              onClick={() => removeImage(image.id)}
              data-testid={`remove-image-${image.id}`}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end mt-4">
        <Button data-testid="save-images">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}

// HTML Assets Section Component
function HTMLAssetsSection({ product }: { product: ProductSKU }) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        ${product.productName}
      </h2>
      <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #007bff;">Key Specifications</h3>
        <ul style="line-height: 1.6;">
          <li><strong>Brand:</strong> ${product.brand}</li>
          <li><strong>Category:</strong> ${product.category}</li>
          <li><strong>MPN:</strong> ${product.mpn}</li>
          <li><strong>Seller:</strong> ${product.seller}</li>
        </ul>
      </div>
      <div style="background: white; padding: 15px; border-radius: 8px;">
        <h3 style="color: #007bff;">Features</h3>
        <p style="line-height: 1.6; color: #666;">
          This premium product offers exceptional quality and performance. 
          Designed for professionals and enthusiasts alike.
        </p>
      </div>
    </div>
  `;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">HTML Assets Preview</h3>
      </div>
      
      <div className="flex-1 border rounded-lg overflow-auto" data-testid="html-preview">
        <div 
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          className="h-full"
        />
      </div>
    </div>
  );
}

// Summary Section Component
function SummarySection({ product }: { product: ProductSKU }) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  const confirmSubmission = () => {
    setShowConfirmation(false);
    // Handle final submission
    alert('Product information submitted successfully!');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Summary</h3>
      </div>
      
      <div className="flex-1 overflow-auto space-y-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Product Information</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <p><strong>Name:</strong> {product.productName}</p>
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>MPN:</strong> {product.mpn}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Status:</strong> {product.status}</p>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Product Specifications</h4>
          <p className="text-sm text-gray-600">9 attributes configured with detailed specifications including dimensions, connectivity, and features.</p>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Key Features</h4>
          <p className="text-sm text-gray-600">Comprehensive feature description with bullet points covering display quality, connectivity options, and package contents.</p>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">FAQs</h4>
          <p className="text-sm text-gray-600">4 frequently asked questions covering technical specifications and product details.</p>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Images</h4>
          <p className="text-sm text-gray-600">3 product images configured with descriptive alt text.</p>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">HTML Assets</h4>
          <p className="text-sm text-gray-600">Formatted HTML content ready for web display with styling and structured information.</p>
        </div>
      </div>
      
      <div className="flex justify-center mt-6">
        <Button 
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700"
          data-testid="submit-final"
        >
          Submit Final Product Information
        </Button>
      </div>
      
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Submission</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to submit this product information? 
              This action cannot be reversed after confirmation.
            </p>
            <div className="text-sm text-red-600 mb-6 p-2 bg-red-50 rounded">
              Note: Changes cannot be reversed after clicking confirmation.
            </div>
            <div className="flex space-x-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)}
                data-testid="cancel-submission"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmSubmission}
                className="bg-green-600 hover:bg-green-700"
                data-testid="confirm-submission"
              >
                Confirm Submission
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}