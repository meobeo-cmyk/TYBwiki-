import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, ImagePlus } from "lucide-react";
import type { UserImage } from "@shared/schema";

interface ProfileGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAvatar: (imageUrl: string) => void;
  onSelectBackground: (imageUrl: string) => void;
  currentAvatarUrl?: string | null;
  currentBackgroundUrl?: string | null;
}

export function ProfileGalleryModal({
  open,
  onOpenChange,
  onSelectAvatar,
  onSelectBackground,
  currentAvatarUrl,
  currentBackgroundUrl,
}: ProfileGalleryModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTab, setSelectedTab] = useState<"avatar" | "background">("avatar");

  const { data: images = [], isLoading } = useQuery<UserImage[]>({
    queryKey: ["/api/user/gallery"],
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) =>
      apiRequest(`/api/user/gallery/${imageId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/gallery"] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const reader = new FileReader();
      return new Promise<string>((resolve, reject) => {
        reader.onload = async () => {
          const imageUrl = reader.result as string;
          try {
            await apiRequest("/api/user/gallery", "POST", {
              imageUrl,
              fileName: file.name,
            });
            resolve(imageUrl);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/gallery"] });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    if (selectedTab === "avatar") {
      onSelectAvatar(imageUrl);
    } else {
      onSelectBackground(imageUrl);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-gallery">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl" data-testid="text-gallery-title">
            {selectedTab === "avatar" ? "Select Avatar" : "Select Background"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4">
          {/* Tab selection */}
          <div className="flex gap-2">
            <Button
              variant={selectedTab === "avatar" ? "default" : "outline"}
              onClick={() => setSelectedTab("avatar")}
              data-testid="button-tab-avatar"
            >
              Avatar
            </Button>
            <Button
              variant={selectedTab === "background" ? "default" : "outline"}
              onClick={() => setSelectedTab("background")}
              data-testid="button-tab-background"
            >
              Background
            </Button>
          </div>

          {/* Upload button */}
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              data-testid="button-upload-image"
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file-upload"
            />
          </div>

          {/* Gallery grid */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No images yet. Upload some images to get started!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 max-h-80 md:max-h-96 overflow-y-auto">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group rounded-lg overflow-hidden cursor-pointer"
                  data-testid={`card-image-${image.id}`}
                >
                  <img
                    src={image.imageUrl}
                    alt="Gallery"
                    className="w-full aspect-square object-cover"
                  />

                  {/* Badge if selected */}
                  {((selectedTab === "avatar" && image.imageUrl === currentAvatarUrl) ||
                    (selectedTab === "background" &&
                      image.imageUrl === currentBackgroundUrl)) && (
                    <Badge className="absolute top-2 left-2 bg-green-500">Selected</Badge>
                  )}

                  {/* Overlay buttons */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSelectImage(image.imageUrl)}
                      data-testid={`button-select-${image.id}`}
                    >
                      Select
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(image.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${image.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
