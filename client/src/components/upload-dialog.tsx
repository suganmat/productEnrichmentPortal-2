import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: { name: string; type: string; source: 'local' | 'onedrive' | 'url'; url?: string }) => void;
}

export function UploadDialog({ open, onClose, onUpload }: UploadDialogProps) {
  const [urlInput, setUrlInput] = useState("");
  const { toast } = useToast();

  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      onUpload({
        name: file.name,
        type: file.type || 'unknown',
        source: 'local'
      });
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
      onClose();
    }
  };

  const handleOneDriveUpload = () => {
    toast({
      title: "OneDrive Integration",
      description: "Please set up OneDrive integration to upload files from OneDrive.",
    });
  };

  const handleUrlUpload = () => {
    if (!urlInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }

    const fileName = urlInput.split('/').pop() || 'URL Document';
    onUpload({
      name: fileName,
      type: 'url',
      source: 'url',
      url: urlInput
    });
    
    toast({
      title: "URL added",
      description: `${fileName} has been added successfully.`,
    });
    
    setUrlInput("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Choose how you want to upload your file
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="local" data-testid="tab-local-upload">
              <Upload className="w-4 h-4 mr-2" />
              Local Device
            </TabsTrigger>
            <TabsTrigger value="onedrive" data-testid="tab-onedrive-upload">
              <Cloud className="w-4 h-4 mr-2" />
              OneDrive
            </TabsTrigger>
            <TabsTrigger value="url" data-testid="tab-url-upload">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="local" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select a file from your device</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleLocalUpload}
                className="cursor-pointer"
                data-testid="input-file-upload"
              />
            </div>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, Images, etc.
            </p>
          </TabsContent>
          
          <TabsContent value="onedrive" className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Cloud className="w-16 h-16 text-gray-400" />
              <p className="text-sm text-gray-600 text-center">
                Connect to OneDrive to access your files
              </p>
              <Button 
                onClick={handleOneDriveUpload}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-connect-onedrive"
              >
                Connect OneDrive
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">Enter the URL of the file</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/document.pdf"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                data-testid="input-url"
              />
            </div>
            <Button 
              onClick={handleUrlUpload}
              className="w-full"
              data-testid="button-upload-url"
            >
              Add URL
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
