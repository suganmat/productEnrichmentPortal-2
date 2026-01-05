import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Mail, User, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";
import type { TeamMember } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddMemberForm {
  email: string;
  name: string;
  roles: string[];
}

export function AccessControl() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<AddMemberForm>({
    email: '',
    name: '',
    roles: []
  });

  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members']
  });

  const addMemberMutation = useMutation({
    mutationFn: async (member: AddMemberForm) => {
      return apiRequest('POST', '/api/team-members', member);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({ title: "Success", description: "Team member added successfully" });
      setFormData({ email: '', name: '', roles: [] });
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

  const accessDefinitions = [
    {
      id: 'admin',
      label: 'Admin',
      description: 'Full access to all system features including Category Mapping, Variant Grouping, Product Enrichment, and Access Control management.',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'product_enrichment',
      label: 'Product Enrichment',
      description: 'Access to manage, filter, and enrich product SKUs with specifications, images, and features.',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'product_grouping',
      label: 'Product-Variant Grouping',
      description: 'Access to the drag-and-drop interface for grouping product variants and clusters.',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'category_mapping',
      label: 'Category Mapping',
      description: 'Access to AI-powered category mapping and selection interface.',
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId]
    }));
  };

  return (
    <div className="space-y-8">
      {/* Access Definitions Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accessDefinitions.map((def) => (
          <Card key={def.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                {def.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {def.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Add Team Member Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-blue-100 pb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add New Team Member
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700" data-testid="close-add-form">✕</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" placeholder="email@company.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} data-testid="input-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} data-testid="input-name" />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Select Access Roles (Multi-select)</Label>
              <div className="grid grid-cols-1 gap-3">
                {accessDefinitions.map((role) => (
                  <div key={role.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors">
                    <Checkbox 
                      id={`role-${role.id}`} 
                      checked={formData.roles.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={`role-${role.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {role.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-blue-100">
            <Button onClick={() => addMemberMutation.mutate(formData)} disabled={!formData.email || !formData.name || formData.roles.length === 0} data-testid="btn-add-member" className="bg-blue-600 hover:bg-blue-700">
              {addMemberMutation.isPending ? "Adding..." : "Add Member"}
            </Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)} data-testid="btn-cancel">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Team Members List */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50">
          <div>
            <CardTitle>Team Members Access Control</CardTitle>
            <CardDescription>Manage your team and their system permissions</CardDescription>
          </div>
          {!showAddForm && <Button size="sm" onClick={() => setShowAddForm(true)} data-testid="btn-add-new"><Plus className="w-4 h-4 mr-2" />Add Team Member</Button>}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading team members...</div>
          ) : teamMembers?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No team members yet</div>
          ) : (
            <div className="divide-y">
              {teamMembers?.map((member) => (
                <motion.div key={member.id} layout className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group">
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100/50 border border-blue-100">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900" data-testid={`member-name-${member.id}`}>{member.name}</div>
                      <div className="flex items-center text-sm text-gray-500 gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-wrap gap-2 justify-end max-w-xs">
                      {member.roles?.map((roleId) => {
                        const def = accessDefinitions.find(d => d.id === roleId);
                        return (
                          <Badge key={roleId} variant="secondary" className={`${def?.color || 'bg-gray-100'} px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold shadow-sm`}>
                            {def?.label || roleId}
                          </Badge>
                        );
                      })}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setMemberToDelete(member.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all" data-testid={`btn-delete-${member.id}`}>
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
