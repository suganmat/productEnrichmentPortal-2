import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Brain, BarChart3, Package, ShoppingCart, Home, Settings as SettingsIcon, Shield } from "lucide-react";
import { CategoryMappingTable } from "@/components/category-mapping-table";
import { ProductGroupingTable } from "@/components/product-grouping-table";
import { ProductEnrichmentTable } from "@/components/product-enrichment-table";
import { SettingsModule } from "@/components/settings-module";
import { AccessControl } from "@/components/access-control";
import { ProfileDropdown } from "@/components/profile-dropdown";

type TabType = "categoryMapping" | "productGrouping" | "productEnrichment" | "settings" | "accessControl";

export default function Dashboard() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("categoryMapping");
  
  // Extract tab from URL
  useEffect(() => {
    const pathParts = location.split('/');
    const tabFromUrl = pathParts[2] as TabType;
    if (tabFromUrl && ['categoryMapping', 'productGrouping', 'productEnrichment', 'settings', 'accessControl'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location]);
  
  const getModelConfidence = () => {
    switch (activeTab) {
      case "categoryMapping":
        return "94%";
      case "productGrouping":
        return "87%";
      case "productEnrichment":
        return "92%";
      case "settings":
        return "100%";
      case "accessControl":
        return "100%";
      default:
        return "94%";
    }
  };

  const sidebarItems = [
    {
      id: "categoryMapping" as TabType,
      label: "Category Mapping",
      icon: BarChart3,
      description: "AI-powered categorization"
    },
    {
      id: "productGrouping" as TabType,
      label: "Product-variant Grouping",
      icon: Package,
      description: "Organize product variants"
    },
    {
      id: "productEnrichment" as TabType,
      label: "Product Enrichment",
      icon: ShoppingCart,
      description: "Manage product SKUs"
    },
    {
      id: "settings" as TabType,
      label: "Settings",
      icon: SettingsIcon,
      description: "Manage platform settings"
    },
    {
      id: "accessControl" as TabType,
      label: "Access Control",
      icon: Shield,
      description: "Team member access management"
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "categoryMapping":
        return <CategoryMappingTable />;
      case "productGrouping":
        return <ProductGroupingTable />;
      case "productEnrichment":
        return <ProductEnrichmentTable />;
      case "settings":
        return <SettingsModule />;
      case "accessControl":
        return <AccessControl />;
      default:
        return <CategoryMappingTable />;
    }
  };

  const getActiveTabLabel = () => {
    const item = sidebarItems.find(item => item.id === activeTab);
    return item?.label || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            <Home className="w-6 h-6 mr-2 text-blue-600" />
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Category Management Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Link key={item.id} href={`/dashboard/${item.id}`}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start p-3 h-auto text-left",
                      isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    )}
                    onClick={() => setActiveTab(item.id)}
                    data-testid={`nav-${item.id}`}
                  >
                    <Icon className={cn("w-5 h-5 mr-3", isActive && "text-blue-600")} />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900" data-testid="page-title">
                  {getActiveTabLabel()}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200" data-testid="model-confidence">
                  <Brain className="w-4 h-4 mr-2" />
                  Model Confidence: {getModelConfidence()}
                </Badge>
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
