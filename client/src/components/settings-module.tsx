import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttributesDetailsSettings } from "./attributes-details-settings";
import { Plus, Trash2, Globe, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Competitor {
  id: string;
  name: string;
  url: string;
}

export function SettingsModule() {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { id: "1", name: "Amazon UK", url: "https://www.amazon.co.uk" },
    { id: "2", name: "Tesco UK", url: "https://www.tesco.com" },
    { id: "3", name: "Currys UK", url: "https://www.currys.co.uk" },
    { id: "4", name: "John Lewis UK", url: "https://www.johnlewis.com" },
    { id: "5", name: "Argos UK", url: "https://www.argos.co.uk" }
  ]);

  const addCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors([...competitors, { id: Math.random().toString(36).substr(2, 9), name: "", url: "" }]);
    }
  };

  const updateCompetitor = (id: string, field: keyof Competitor, value: string) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="attributes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="attributes">Attributes and details setting</TabsTrigger>
          <TabsTrigger value="competitor">Competitor setting</TabsTrigger>
        </TabsList>

        <TabsContent value="attributes">
          <AttributesDetailsSettings />
        </TabsContent>

        <TabsContent value="competitor">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Competitor Settings</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Manage up to 5 main competitors and their homepages</p>
              </div>
              <Button 
                onClick={addCompetitor} 
                disabled={competitors.length >= 5}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Competitor ({competitors.length}/5)
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {competitors.map((competitor, index) => (
                    <motion.div
                      key={competitor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 bg-gray-50/50 rounded-lg border border-gray-100 group transition-all hover:border-blue-200"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" />
                          Competitor Name
                        </label>
                        <Input
                          placeholder="e.g. Samsung"
                          value={competitor.name}
                          onChange={(e) => updateCompetitor(competitor.id, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 relative">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Globe className="w-3 h-3" />
                          Home Page URL
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://www.example.com"
                            value={competitor.url}
                            onChange={(e) => updateCompetitor(competitor.id, "url", e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCompetitor(competitor.id)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {competitors.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 border border-dashed rounded-lg">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No competitors added yet. Add up to 5 competitors to track.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}