import { Button } from "@/components/ui/button";
import { Search, BookOpen, Users, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight" data-testid="text-hero-title">
                Tạo trang Wiki cá nhân trên pixelsWIKI
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-description">
                Chia sẻ kiến thức, hình ảnh và câu chuyện của bạn với thế giới. 
                Tìm kiếm và khám phá wiki entries từ cộng đồng.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/auth" className="text-lg px-8">
                  Bắt đầu ngay
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                <a href="#features" className="text-lg px-8">
                  Tìm hiểu thêm
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" data-testid="text-features-title">
            Tính năng nổi bật
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 p-6 rounded-lg border bg-card hover-elevate">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold" data-testid="text-feature-search-title">
                Tìm kiếm dễ dàng
              </h3>
              <p className="text-muted-foreground" data-testid="text-feature-search-description">
                Tìm kiếm profile người dùng nhanh chóng và khám phá nội dung thú vị từ cộng đồng.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-lg border bg-card hover-elevate">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold" data-testid="text-feature-wiki-title">
                Wiki cá nhân
              </h3>
              <p className="text-muted-foreground" data-testid="text-feature-wiki-description">
                Tạo và quản lý các entries với hình ảnh và mô tả chi tiết như một trang wiki chuyên nghiệp.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-lg border bg-card hover-elevate">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold" data-testid="text-feature-moderation-title">
                Kiểm duyệt nội dung
              </h3>
              <p className="text-muted-foreground" data-testid="text-feature-moderation-description">
                Hệ thống kiểm duyệt đảm bảo nội dung an toàn và phù hợp cho toàn bộ cộng đồng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-lg border bg-card">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-cta-title">
              Sẵn sàng chia sẻ câu chuyện của bạn?
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="text-cta-description">
              Tham gia cộng đồng Wiki Profile ngay hôm nay
            </p>
          </div>
          <Button size="lg" asChild data-testid="button-cta-join">
            <a href="/api/login" className="text-lg px-8">
              Đăng nhập để bắt đầu
            </a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground" data-testid="text-footer">
            © 2025 pixelsWIKI. Nền tảng wiki cá nhân cho mọi người.
          </p>
        </div>
      </footer>
    </div>
  );
}
