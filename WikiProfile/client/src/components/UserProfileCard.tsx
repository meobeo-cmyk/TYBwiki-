import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";
import { Link } from "wouter";

interface UserProfileCardProps {
  user: User;
  entryCount?: number;
}

export function UserProfileCard({ user, entryCount = 0 }: UserProfileCardProps) {
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Người dùng";

  return (
    <Link href={`/profile/${user.id}`}>
      <Card 
        className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all"
        data-testid={`card-user-${user.id}`}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profileImageUrl || undefined} alt={fullName} />
              <AvatarFallback className="text-lg">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold" data-testid={`text-username-${user.id}`}>
                  {fullName}
                </h3>
                {user.isAdmin && (
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
              </div>
              {user.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-bio-${user.id}`}>
                  {user.bio}
                </p>
              )}
              <p className="text-xs text-muted-foreground" data-testid={`text-entry-count-${user.id}`}>
                {entryCount} entries
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
