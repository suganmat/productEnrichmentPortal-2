import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Mail, User } from "lucide-react";
import { motion } from "framer-motion";
import type { TeamMember } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddMemberForm {
  email: string;
  name: string;
  role: 'admin' | 'product_enrichment' | 'product_grouping' | 'category_mapping';
}

export function AccessControl() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<AddMemberForm>({
    email: '',
    name: '',
    role: 'product_enrichment'
  });

  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
    queryFn: async () => {
      const response = await fetch('/api/team-members');
      if (!response.ok) throw new Error('Failed to fetch team members');
      return response.json();
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: async (member: AddMemberForm) => {
      return apiRequest('POST', '/api/team-members', member);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({ title: "Success", description: "Team member added successfully" });
      setFormData({ email: '', name: '', role: 'product_enrichment' });
      setShowAddForm(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add team member", variant: "destructive" });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/team-members/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({ title: "Success", description: "Team member removed successfully" });
      setMemberToDelete(null);
    }
  });

  const roleLabels = {
    admin: 'Admin',
    product_enrichment: 'Product Enrichment',
    product_grouping: 'Product-Variant Grouping',
    category_mapping: 'Category Mapping'
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    product_enrichment: 'bg-blue-100 text-blue-800',
    product_grouping: 'bg-green-100 text-green-800',
    category_mapping: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="space-y-6">
      {/* Add Team Member Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Add New Team Member</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700" data-testid="close-add-form">✕</button>
          </div>
          
          <div className="space-y-3">
            <Input placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} data-testid="input-email" />
            <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} data-testid="input-name" />
            <Select value={formData.role} onValueChange={(role: any) => setFormData({...formData, role})}>
              <SelectTrigger data-testid="select-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (All Access)</SelectItem>
                <SelectItem value="product_enrichment">Product Enrichment Only</SelectItem>
                <SelectItem value="product_grouping">Product-Variant Grouping Only</SelectItem>
                <SelectItem value="category_mapping">Category Mapping Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => addMemberMutation.mutate(formData)} disabled={!formData.email || !formData.name} data-testid="btn-add-member">Add Member</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)} data-testid="btn-cancel">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Members Access Control</CardTitle>
          {!showAddForm && <Button size="sm" onClick={() => setShowAddForm(true)} data-testid="btn-add-new"><Plus className="w-4 h-4 mr-2" />Add Team Member</Button>}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading team members...</p>
          ) : teamMembers?.length === 0 ? (
            <p className="text-gray-500">No team members yet</p>
          ) : (
            <div className="space-y-2">
              {teamMembers?.map((member) => (
                <motion.div key={member.id} layout className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900" data-testid={`member-name-${member.id}`}>{member.name}</div>
                      <div className="flex items-center text-sm text-gray-500 gap-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={roleColors[member.role as keyof typeof roleColors]} data-testid={`member-role-${member.id}`}>
                      {roleLabels[member.role as keyof typeof roleLabels]}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setMemberToDelete(member.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50" data-testid={`btn-delete-${member.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={memberToDelete !== null} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to remove this team member? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="btn-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => memberToDelete && removeMemberMutation.mutate(memberToDelete)} className="bg-red-600 hover:bg-red-700" data-testid="btn-confirm-delete">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
