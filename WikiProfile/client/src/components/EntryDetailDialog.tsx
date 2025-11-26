import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WikiEntry } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ImageOff, Pencil, Trash2, Flag } from "lucide-react";
import { ReportForm } from "./ReportForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EntryDetailDialogProps {
  entry: WikiEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EntryDetailDialog({
  entry,
  open,
  onOpenChange,
  canEdit = false,
  onEdit,
  onDelete,
}: EntryDetailDialogProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const { toast } = useToast();

  if (!entry) return null;

  const handleReportSubmit = async (data: { reason: string; description?: string }) => {
    try {
      setReportSubmitting(true);
      await apiRequest("POST", "/api/reports", {
        entryId: entry.id,
        ...data,
      });
      toast({
        title: "Thành công",
        description: "Báo cáo của bạn đã được gửi",
      });
      setReportOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi báo cáo",
        variant: "destructive",
      });
    } finally {
      setReportSubmitting(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-entry-detail" aria-describedby="entry-detail-description">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 md:gap-4">
            <DialogTitle className="text-lg md:text-2xl" data-testid="text-entry-detail-title">
              {entry.title}
            </DialogTitle>
            <Badge variant={getStatusVariant(entry.status)} className="text-xs flex-shrink-0" data-testid="badge-entry-detail-status">
              {getStatusText(entry.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          {entry.imageUrl ? (
            <div className="w-full max-h-64 md:max-h-96 overflow-hidden rounded-md bg-muted">
              <img
                src={entry.imageUrl}
                alt={entry.title}
                className="w-full h-full object-contain"
                data-testid="img-entry-detail"
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-md bg-muted">
              <ImageOff className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground" />
            </div>
          )}

          <div className="space-y-3 md:space-y-4">
            <div id="entry-detail-description" className="prose prose-sm md:prose-base max-w-none font-serif text-xs md:text-sm" data-testid="text-entry-detail-description">
              {entry.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <p className="text-xs md:text-sm text-muted-foreground" data-testid="text-entry-detail-time">
              Tạo {formatDistanceToNow(new Date(entry.createdAt!), { addSuffix: true, locale: vi })}
            </p>
          </div>

          <div className="flex gap-2 md:gap-3 pt-3 md:pt-4 border-t">
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="flex-1 text-xs md:text-sm"
                  size="sm"
                  data-testid="button-edit-entry"
                >
                  <Pencil className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  className="flex-1 text-xs md:text-sm"
                  size="sm"
                  data-testid="button-delete-entry"
                >
                  <Trash2 className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
                  Xóa
                </Button>
              </>
            )}
            {!canEdit && (
              <Button
                variant="outline"
                onClick={() => setReportOpen(true)}
                className="flex-1 text-xs md:text-sm"
                size="sm"
                data-testid="button-report-entry"
              >
                <Flag className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
                Báo cáo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Báo cáo nội dung</DialogTitle>
          </DialogHeader>
          <ReportForm
            onSubmit={handleReportSubmit}
            onCancel={() => setReportOpen(false)}
            isSubmitting={reportSubmitting}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
