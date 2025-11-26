import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WikiEntry } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ImageOff, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WikiEntryCardProps {
  entry: WikiEntry;
  onClick?: () => void;
  onReport?: (entryId: string) => void;
}

export function WikiEntryCard({ entry, onClick, onReport }: WikiEntryCardProps) {
  const { toast } = useToast();
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
    <Card 
      className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all"
      onClick={onClick}
      data-testid={`card-entry-${entry.id}`}
    >
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt={entry.title}
            className="h-full w-full object-cover"
            data-testid={`img-entry-${entry.id}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardHeader className="space-y-2 p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base md:text-lg font-semibold line-clamp-2" data-testid={`text-entry-title-${entry.id}`}>
            {entry.title}
          </h3>
          {entry.status !== "approved" && (
            <Badge variant={getStatusVariant(entry.status)} className="text-xs flex-shrink-0" data-testid={`badge-status-${entry.id}`}>
              {getStatusText(entry.status)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 md:px-4 pb-3 md:pb-4">
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-3 font-serif" data-testid={`text-entry-description-${entry.id}`}>
          {entry.description}
        </p>
      </CardContent>
      <CardFooter className="px-3 md:px-4 pb-3 md:pb-4">
        <p className="text-xs text-muted-foreground" data-testid={`text-entry-time-${entry.id}`}>
          {formatDistanceToNow(new Date(entry.createdAt!), { addSuffix: true, locale: vi })}
        </p>
      </CardFooter>
    </Card>
  );
}
