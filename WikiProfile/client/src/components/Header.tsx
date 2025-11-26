import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, User, LogOut, Shield, Code } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeveloperPanel } from "./DeveloperPanel";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const [developerPanelOpen, setDeveloperPanelOpen] = useState(false);

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-3 sm:px-4">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 md:px-3 py-1 md:py-2 rounded-md cursor-pointer">
            <Search className="h-4 md:h-6 w-4 md:w-6 text-primary" />
            <span className="text-base md:text-xl font-semibold hidden sm:inline">pixelsWIKI</span>
            <span className="text-base md:text-xl font-semibold sm:hidden">pW</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {!isAuthenticated ? (
            <Button asChild data-testid="button-login">
              <a href="/api/login">Đăng nhập</a>
            </Button>
          ) : (
            <>
              {user?.isAdmin && (
                <Link href="/admin" data-testid="link-admin">
                  <div className="inline-flex items-center justify-center gap-1 md:gap-2 rounded-md text-xs md:text-sm font-semibold transition-colors hover-elevate active-elevate-2 border border-input bg-background px-2 md:px-4 py-1 md:py-2 cursor-pointer">
                    <Shield className="h-3 md:h-4 w-3 md:w-4" />
                    <span className="hidden sm:inline">Kiểm duyệt</span>
                    <span className="sm:hidden">KD</span>
                  </div>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 rounded-full" 
                    size="icon"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage 
                        src={user?.profileImageUrl || undefined} 
                        alt={`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User"} 
                      />
                      <AvatarFallback>
                        {getInitials(user?.firstName, user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold" data-testid="text-user-name">
                        {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Người dùng"}
                      </p>
                      {user?.email && (
                        <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user?.id}`} data-testid="link-my-profile">
                      <div className="flex items-center cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Wiki của tôi
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeveloperPanelOpen(true)}
                        data-testid="button-developer-panel"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Developer
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" data-testid="link-logout" className="flex items-center cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      <DeveloperPanel open={developerPanelOpen} onOpenChange={setDeveloperPanelOpen} />
    </header>
  );
}
