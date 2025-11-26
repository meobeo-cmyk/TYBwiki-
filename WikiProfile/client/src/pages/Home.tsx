import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { WikiEntryCard } from "@/components/WikiEntryCard";
import type { WikiEntry, User } from "@shared/schema";
import { Header } from "@/components/Header";
import { useLocation } from "wouter";

type EntryWithUser = WikiEntry & { user: User };

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Fetch all approved wiki entries
  const { data: entries, isLoading } = useQuery<EntryWithUser[]>({
    queryKey: ["/api/entries/approved"],
  });

  // Filter entries based on search query (title + description + user name)
  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    
    const query = searchQuery.toLowerCase();
    if (!query) return entries;

    return entries.filter((entry) => {
      const title = entry.title.toLowerCase();
      const description = entry.description.toLowerCase();
      const authorName = `${entry.user.firstName || ""} ${entry.user.lastName || ""}`.trim().toLowerCase();

      return title.includes(query) || description.includes(query) || authorName.includes(query);
    });
  }, [entries, searchQuery]);

  const handleEntryClick = (entry: EntryWithUser) => {
    // Navigate to user profile (entries shown in profile)
    setLocation(`/profile/${entry.userId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-16">
          <div className="text-center space-y-4 md:space-y-8">
            <div className="space-y-2 md:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold" data-testid="text-search-title">
                Khám phá Wiki Entries
              </h1>
              <p className="text-sm md:text-base lg:text-xl text-muted-foreground" data-testid="text-search-description">
                Tìm kiếm entries từ cộng đồng
              </p>
            </div>

            {/* Search Input */}
            <div className="relative max-w-2xl mx-auto w-full px-2 sm:px-0">
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc tác giả..."
                className="pl-10 md:pl-12 h-10 md:h-14 text-sm md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-entries"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 md:py-12">
              <Loader2 className="h-6 md:h-8 w-6 md:w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground" data-testid="text-no-results">
                {searchQuery
                  ? "Không tìm thấy entries nào"
                  : "Chưa có entries nào"}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-base md:text-lg lg:text-2xl font-semibold mb-4 md:mb-6" data-testid="text-results-title">
                {searchQuery ? `Kết quả tìm kiếm (${filteredEntries.length})` : `Tất cả entries (${filteredEntries.length})`}
              </h2>
              <div className="grid gap-3 md:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    onClick={() => handleEntryClick(entry)}
                    data-testid={`search-result-${entry.id}`}
                  >
                    <WikiEntryCard entry={entry} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
