import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, X, Plus } from "lucide-react";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CategoryMapping } from "@shared/schema";

export function CategoryMappingTable() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mappings, isLoading } = useQuery<CategoryMapping[]>({
    queryKey: ["/api/category-mappings"],
  });

  const updateMappingMutation = useMutation({
    mutationFn: async ({ id, selectedCategory }: { id: number; selectedCategory: string[] }) => {
      const response = await apiRequest("PATCH", `/api/category-mappings/${id}`, { selectedCategory });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/category-mappings"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/category-mappings/approve", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category mappings approved successfully!",
      });
      setShowConfirmation(false);
    },
  });

  const handleCategoryChange = (id: number, index: number, newValue: string, currentCategories: string[]) => {
    const updatedCategories = [...currentCategories];
    updatedCategories[index] = newValue;
    updateMappingMutation.mutate({ id, selectedCategory: updatedCategories });
  };

  const handleDeleteCategory = (id: number, index: number, currentCategories: string[]) => {
    const updatedCategories = currentCategories.filter((_, i) => i !== index);
    updateMappingMutation.mutate({ id, selectedCategory: updatedCategories });
  };

  const handleAddCategory = (id: number, currentCategories: string[]) => {
    const updatedCategories = [...currentCategories, "Mobile phones"];
    updateMappingMutation.mutate({ id, selectedCategory: updatedCategories });
  };

  const handleApprove = () => {
    approveMutation.mutate();
  };

  const categoryOptions = [
    "Mobile phones",
    "Smartphones", 
    "Feature phones",
    "Mobile accessories",
    "Mobile cases",
    "PlayStation accessories",
    "Gaming accessories",
    "Console accessories",
    "Gaming cases",
    "Controller accessories",
    "Audio equipment",
    "Headphones",
    "Earphones",
    "Audio accessories",
    "Wireless headphones"
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-20">Serial No.</TableHead>
                <TableHead className="w-64">Product Name</TableHead>
                <TableHead>Incoming Seller Category</TableHead>
                <TableHead>ML Suggested EE Category</TableHead>
                <TableHead>Change the ML Suggested Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings?.map((mapping) => (
                <TableRow key={mapping.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {mapping.serialNumber}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {mapping.productName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 items-center">
                      {mapping.incomingSellerCategory.map((category, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {category}
                          </Badge>
                          {index < mapping.incomingSellerCategory.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {mapping.mlSuggestedCategory.map((category, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-green-100 text-green-800"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {mapping.selectedCategory.map((selectedCat, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 min-w-[30px]">
                            {index + 1}.
                          </span>
                          <Select
                            value={selectedCat}
                            onValueChange={(value) => handleCategoryChange(mapping.id, index, value, mapping.selectedCategory)}
                          >
                            <SelectTrigger className="flex-1" data-testid={`select-category-${mapping.id}-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(mapping.id, index, mapping.selectedCategory)}
                            className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                            data-testid={`button-delete-category-${mapping.id}-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCategory(mapping.id, mapping.selectedCategory)}
                        className="w-full mt-2 border-dashed hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                        data-testid={`button-add-category-${mapping.id}`}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => setShowConfirmation(true)}
          className="bg-primary hover:bg-primary-dark"
          disabled={approveMutation.isPending}
          data-testid="button-approve"
        >
          <Check className="w-4 h-4 mr-2" />
          Approve Changes
        </Button>
      </div>

      <ConfirmationModal
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleApprove}
        title="Confirm Changes"
        description="Are you sure you want to approve all category mapping changes? This action cannot be undone."
        isLoading={approveMutation.isPending}
      />
    </>
  );
}
