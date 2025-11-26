import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code, Loader2 } from "lucide-react";
import type { User } from "@shared/schema";

interface DeveloperPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeveloperPanel({ open, onOpenChange }: DeveloperPanelProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"user" | "moderator" | "admin">("user");
  const [selectedBadge, setSelectedBadge] = useState<"green_check" | "red_check" | "black_check" | "none">("none");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: open,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string }) =>
      apiRequest(`/api/admin/users/${data.userId}/role`, "PATCH", { role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const updateBadgeMutation = useMutation({
    mutationFn: async (data: { userId: string; badge: string }) =>
      apiRequest(`/api/admin/users/${data.userId}/badge`, "PATCH", { badge: data.badge }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const handleUpdateRole = () => {
    if (selectedUserId && selectedRole) {
      updateRoleMutation.mutate({ userId: selectedUserId, role: selectedRole });
    }
  };

  const handleUpdateBadge = () => {
    if (selectedUserId && selectedBadge) {
      updateBadgeMutation.mutate({ userId: selectedUserId, badge: selectedBadge });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === "admin") return "bg-red-500 text-white";
    if (role === "moderator") return "bg-blue-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getRoleBadgeLabel = (role: string) => {
    if (role === "admin") return "Admin";
    if (role === "moderator") return "Moderator";
    return "User";
  };

  const getUserBadge = (badge: string) => {
    switch (badge) {
      case "green_check": return "✓ Green (Trusted)";
      case "red_check": return "✓ Red (Mod/Admin)";
      case "black_check": return "✓ Black (CEO/Senior)";
      default: return "None";
    }
  };

  const getUserBadgeColor = (badge: string) => {
    switch (badge) {
      case "green_check": return "bg-green-500 text-white";
      case "red_check": return "bg-red-500 text-white";
      case "black_check": return "bg-black text-white";
      default: return "bg-gray-300 text-black";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-developer-panel">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Code className="h-4 md:h-5 w-4 md:w-5 text-primary" />
            <DialogTitle className="text-lg md:text-xl" data-testid="text-developer-panel-title">Developer Panel</DialogTitle>
          </div>
          <DialogDescription className="text-xs md:text-sm">
            Manage user roles and permissions for content moderation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4">
          {/* Users List */}
          <div className="border rounded-lg p-3 md:p-4 space-y-2 max-h-80 md:max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-xs md:text-sm mb-2 md:mb-3" data-testid="text-users-list">All Users</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found</p>
            ) : (
              <div className="space-y-2">
                {users.map((user: User) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 bg-background rounded-md hover-elevate cursor-pointer"
                    data-testid={`row-user-${user.id}`}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setSelectedRole((user.role as "user" | "moderator" | "admin") || "user");
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" data-testid={`text-user-name-${user.id}`}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate" data-testid={`text-user-email-${user.id}`}>
                        {user.email}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {(user.badge && user.badge !== "none") && (
                        <Badge className={getUserBadgeColor(user.badge)} data-testid={`badge-verify-${user.id}`}>
                          {getUserBadge(user.badge)}
                        </Badge>
                      )}
                      <Badge className={getRoleBadgeColor(user.role || "user")} data-testid={`badge-role-${user.id}`}>
                        {getRoleBadgeLabel(user.role || "user")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role & Badge Assignment */}
          {selectedUserId && (
            <div className="space-y-3">
              {/* Role Assignment */}
              <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                <h3 className="font-semibold text-sm" data-testid="text-assign-role">
                  Assign Role
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Selected User:</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-selected-user">
                      {users.find((u: User) => u.id === selectedUserId)?.email}
                    </p>
                  </div>

                  <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                    <SelectTrigger data-testid="select-role-trigger">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user" data-testid="select-option-user">User (Default)</SelectItem>
                      <SelectItem value="moderator" data-testid="select-option-moderator">Moderator (Can moderate entries)</SelectItem>
                      <SelectItem value="admin" data-testid="select-option-admin">Admin (Full access)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-2">
                    <p className="text-xs text-blue-900 dark:text-blue-200" data-testid="text-role-info">
                      {selectedRole === "moderator" && "Moderators can approve or reject wiki entries"}
                      {selectedRole === "admin" && "Admins have full access to moderation and user management"}
                      {selectedRole === "user" && "Regular users can create and edit their own entries"}
                    </p>
                  </div>

                  <Button
                    onClick={handleUpdateRole}
                    disabled={updateRoleMutation.isPending}
                    className="w-full"
                    data-testid="button-assign-role"
                  >
                    {updateRoleMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Assign Role"
                    )}
                  </Button>
                </div>
              </div>

              {/* Badge Assignment */}
              <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                <h3 className="font-semibold text-sm" data-testid="text-assign-badge">
                  Assign Verification Badge
                </h3>
                <div className="space-y-3">
                  <Select value={selectedBadge} onValueChange={(value: any) => setSelectedBadge(value)}>
                    <SelectTrigger data-testid="select-badge-trigger">
                      <SelectValue placeholder="Select a badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" data-testid="select-option-none">None</SelectItem>
                      <SelectItem value="green_check" data-testid="select-option-green">✓ Green (Trusted User)</SelectItem>
                      <SelectItem value="red_check" data-testid="select-option-red">✓ Red (Moderator/Admin)</SelectItem>
                      <SelectItem value="black_check" data-testid="select-option-black">✓ Black (CEO/Senior Admin)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-2">
                    <p className="text-xs text-green-900 dark:text-green-200" data-testid="text-badge-info">
                      {selectedBadge === "green_check" && "Green badge indicates a trusted user"}
                      {selectedBadge === "red_check" && "Red badge indicates a moderator or admin"}
                      {selectedBadge === "black_check" && "Black badge indicates a CEO or senior admin"}
                      {selectedBadge === "none" && "Remove any verification badge"}
                    </p>
                  </div>

                  <Button
                    onClick={handleUpdateBadge}
                    disabled={updateBadgeMutation.isPending}
                    className="w-full"
                    data-testid="button-assign-badge"
                  >
                    {updateBadgeMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Assign Badge"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
