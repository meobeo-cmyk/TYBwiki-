import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { WikiEntryCard } from "@/components/WikiEntryCard";
import { EntryDetailDialog } from "@/components/EntryDetailDialog";
import { WikiEntryForm } from "@/components/WikiEntryForm";
import { ProfileGalleryModal } from "@/components/ProfileGalleryModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WikiEntry, UserWithEntries } from "@shared/schema";
import { Plus, Loader2, Calendar, FileText, Image } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const [, params] = useRoute("/profile/:userId");
  const [, setLocation] = useLocation();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedEntry, setSelectedEntry] = useState<WikiEntry | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WikiEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<WikiEntry | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const userId = params?.userId;
  const isOwnProfile = currentUser?.id === userId;

  // Fetch user profile with entries
  const { data: profile, isLoading: profileLoading } = useQuery<UserWithEntries>({
    queryKey: ["/api/profile", userId],
    enabled: !!userId,
  });

  useEffect(() => {
    if (!authLoading && !currentUser && !profileLoading && !profile) {
      toast({
        title: "Không được phép",
        description: "Bạn cần đăng nhập để xem trang này",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, currentUser, profileLoading, profile, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; imageUrl?: string }) => {
      return await apiRequest("POST", "/api/entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      setCreateDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Entry đã được tạo",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Không được phép",
          description: "Đang đăng nhập lại...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Lỗi",
        description: "Không thể tạo entry",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; description: string; imageUrl?: string }) => {
      const { id, ...updateData } = data;
      return await apiRequest("PATCH", `/api/entries/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      setEditingEntry(null);
      setDetailDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Entry đã được cập nhật",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Không được phép",
          description: "Đang đăng nhập lại...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật entry",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/entries/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      setDeleteDialogOpen(false);
      setDetailDialogOpen(false);
      setEntryToDelete(null);
      toast({
        title: "Thành công",
        description: "Entry đã được xóa",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Không được phép",
          description: "Đang đăng nhập lại...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Lỗi",
        description: "Không thể xóa entry",
        variant: "destructive",
      });
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      return await apiRequest("PATCH", "/api/user/avatar", { imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      toast({
        title: "Thành công",
        description: "Avatar đã được cập nhật",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật avatar",
        variant: "destructive",
      });
    },
  });

  const updateBackgroundMutation = useMutation({
    mutationFn: async (backgroundUrl: string) => {
      return await apiRequest("PATCH", "/api/user/background", { backgroundUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      toast({
        title: "Thành công",
        description: "Background đã được cập nhật",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật background",
        variant: "destructive",
      });
    },
  });

  const handleEntryClick = (entry: WikiEntry) => {
    setSelectedEntry(entry);
    setDetailDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedEntry) {
      setEditingEntry(selectedEntry);
      setDetailDialogOpen(false);
    }
  };

  const handleDelete = () => {
    if (selectedEntry) {
      setEntryToDelete(selectedEntry);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (entryToDelete) {
      deleteMutation.mutate(entryToDelete.id);
    }
  };

  if (profileLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold mb-4">Không tìm thấy người dùng</h1>
          <Button onClick={() => setLocation("/")}>Quay lại trang chủ</Button>
        </div>
      </div>
    );
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Người dùng";
  const approvedEntries = profile.wikiEntries.filter((e) => e.status === "approved");
  const displayEntries = isOwnProfile ? profile.wikiEntries : approvedEntries;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Profile Header */}
        <div className="max-w-5xl mx-auto mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
            <Avatar className="h-24 md:h-32 w-24 md:w-32 flex-shrink-0">
              <AvatarImage src={profile.profileImageUrl || undefined} alt={fullName} />
              <AvatarFallback className="text-2xl md:text-3xl">
                {getInitials(profile.firstName, profile.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3 md:space-y-4">
              <div className="space-y-1 md:space-y-2">
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold" data-testid="text-profile-name">
                    {fullName}
                  </h1>
                  {profile.isAdmin && (
                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                  )}
                </div>
                {profile.email && (
                  <p className="text-xs md:text-sm text-muted-foreground truncate" data-testid="text-profile-email">
                    {profile.email}
                  </p>
                )}
              </div>

              {profile.bio && (
                <p className="text-sm md:text-base" data-testid="text-profile-bio">
                  {profile.bio}
                </p>
              )}

              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGalleryOpen(true)}
                  data-testid="button-edit-profile"
                  className="text-xs md:text-sm"
                >
                  <Image className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Tùy chỉnh
                </Button>
              )}

              <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span data-testid="text-entry-count">
                    {displayEntries.length} entries
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span data-testid="text-join-date">
                    Tham gia {formatDistanceToNow(new Date(profile.createdAt!), { addSuffix: true, locale: vi })}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <Button onClick={() => setCreateDialogOpen(true)} size="sm" data-testid="button-create-entry" className="text-xs md:text-sm">
                  <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Tạo entry
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Entries Grid */}
        <div className="max-w-5xl mx-auto">
          {displayEntries.length === 0 ? (
            <div className="text-center py-8 md:py-12 border rounded-lg bg-card">
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4" data-testid="text-no-entries">
                {isOwnProfile ? "Bạn chưa có entry nào" : "Người dùng chưa có entry nào"}
              </p>
              {isOwnProfile && (
                <Button onClick={() => setCreateDialogOpen(true)} size="sm" data-testid="button-create-first-entry" className="text-xs md:text-sm">
                  <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Tạo entry
                </Button>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-4 md:mb-6" data-testid="text-entries-title">
                Wiki Entries
              </h2>
              <div className="grid gap-3 md:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {displayEntries.map((entry) => (
                  <WikiEntryCard
                    key={entry.id}
                    entry={entry}
                    onClick={() => handleEntryClick(entry)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Entry Detail Dialog */}
      <EntryDetailDialog
        entry={selectedEntry}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        canEdit={isOwnProfile}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create Entry Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-create-entry">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Tạo entry mới</DialogTitle>
          </DialogHeader>
          <WikiEntryForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setCreateDialogOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-entry">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Chỉnh sửa entry</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <WikiEntryForm
              entry={editingEntry}
              onSubmit={(data) => updateMutation.mutate({ id: editingEntry.id, ...data })}
              onCancel={() => setEditingEntry(null)}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Gallery Modal */}
      <ProfileGalleryModal
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelectAvatar={(imageUrl) => {
          updateAvatarMutation.mutate(imageUrl);
          setGalleryOpen(false);
        }}
        onSelectBackground={(backgroundUrl) => {
          updateBackgroundMutation.mutate(backgroundUrl);
          setGalleryOpen(false);
        }}
        currentAvatarUrl={profile?.profileImageUrl}
        currentBackgroundUrl={profile?.profileBackgroundUrl}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa entry "{entryToDelete?.title}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
