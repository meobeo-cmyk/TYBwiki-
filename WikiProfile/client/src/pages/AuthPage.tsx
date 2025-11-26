import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa")
  .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username phải có ít nhất 3 ký tự")
      .max(20, "Username không được vượt quá 20 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ cái, số và dấu gạch dưới"),
    firstName: z.string().min(1, "Vui lòng nhập tên"),
    lastName: z.string().min(1, "Vui lòng nhập họ"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const { toast } = useToast();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/login?provider=${provider}`;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập username và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/login", {
        username: loginUsername,
        password: loginPassword,
        rememberMe,
      });

      if (response) {
        toast({
          title: "Đăng nhập thành công",
          description: "Đang chuyển hướng...",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Đăng nhập thất bại",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/signup", {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      });

      if (response) {
        toast({
          title: "Đăng ký thành công",
          description: "Đang chuyển hướng...",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message?.includes("Username already exists")) {
        form.setError("username", {
          message: "Username này đã được sử dụng",
        });
      } else {
        toast({
          title: "Lỗi",
          description: error.message || "Đăng ký thất bại",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValue = form.watch("password");
  const hasMinLength = passwordValue?.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue || "");
  const hasNumber = /[0-9]/.test(passwordValue || "");
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue || "");
  const isPasswordStrong = hasMinLength && hasUppercase && hasNumber && hasSpecial;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-2 md:mb-4">
            <Search className="h-5 md:h-8 w-5 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold">pixelsWIKI</h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">Tạo tài khoản hoặc đăng nhập</p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border rounded-lg p-4 md:p-6 space-y-4 md:space-y-6">
          <Tabs defaultValue="oauth" className="w-full">
            <TabsList className="grid w-full grid-cols-2 text-xs md:text-sm">
              <TabsTrigger value="oauth" className="text-xs md:text-sm">Đăng nhập nhanh</TabsTrigger>
              <TabsTrigger value="signup" className="text-xs md:text-sm">Đăng ký</TabsTrigger>
            </TabsList>

            {/* OAuth Login */}
            <TabsContent value="oauth" className="space-y-3 mt-6">
              <div className="space-y-3 p-4 bg-muted rounded-md text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold mb-2">Đăng nhập nhanh</p>
                  <p className="text-xs mb-3">Hoặc đăng nhập bằng mật khẩu dưới tab "Đăng ký"</p>
                </div>
              </div>

              <Button
                onClick={() => handleOAuthLogin("google")}
                variant="outline"
                className="w-full"
                data-testid="button-login-google"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Đăng nhập với Google
              </Button>

              <Button
                onClick={() => handleOAuthLogin("github")}
                variant="outline"
                className="w-full"
                data-testid="button-login-github"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Đăng nhập với GitHub
              </Button>

              <Button
                onClick={() => handleOAuthLogin("replit")}
                variant="outline"
                className="w-full"
                data-testid="button-login-replit"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 4v2h2V6H6zm6 0v2h2V6h-2zm6 0v2h2V6h-2zM6 10v2h2v-2H6zm6 0v2h2v-2h-2zm6 0v2h2v-2h-2z" />
                </svg>
                Đăng nhập với Replit
              </Button>
            </TabsContent>

            {/* Password Signup */}
            <TabsContent value="signup" className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your_username"
                            {...field}
                            data-testid="input-username"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              {...field}
                              data-testid="input-firstname"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              {...field}
                              data-testid="input-lastname"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              data-testid="input-password"
                              disabled={isLoading}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />

                        {/* Password requirements */}
                        <div className="text-xs space-y-1 mt-2">
                          <div className={hasMinLength ? "text-green-600" : "text-muted-foreground"}>
                            ✓ Ít nhất 8 ký tự
                          </div>
                          <div className={hasUppercase ? "text-green-600" : "text-muted-foreground"}>
                            ✓ 1 chữ cái viết hoa
                          </div>
                          <div className={hasNumber ? "text-green-600" : "text-muted-foreground"}>
                            ✓ 1 số
                          </div>
                          <div className={hasSpecial ? "text-green-600" : "text-muted-foreground"}>
                            ✓ 1 ký tự đặc biệt (!@#$%...)
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirm ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              data-testid="input-confirm-password"
                              disabled={isLoading}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              data-testid="button-toggle-confirm"
                            >
                              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                      data-testid="checkbox-remember-me"
                    />
                    <label htmlFor="remember-me" className="text-sm cursor-pointer">
                      Ghi nhớ tôi (30 ngày)
                    </label>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || !isPasswordStrong} data-testid="button-signup">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang đăng ký...
                      </>
                    ) : (
                      "Đăng ký"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6" data-testid="text-footer">
          © 2025 pixelsWIKI. Nền tảng wiki cá nhân cho mọi người.
        </p>
      </div>
    </div>
  );
}
