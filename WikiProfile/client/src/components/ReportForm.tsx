import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const reportSchema = z.object({
  reason: z.string().min(1, "Vui lòng chọn lý do báo cáo"),
  description: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormProps {
  onSubmit: (data: ReportFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ReportForm({ onSubmit, onCancel, isSubmitting }: ReportFormProps) {
  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: "",
      description: "",
    },
  });

  const handleSubmit = async (data: ReportFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs md:text-sm">Lý do báo cáo</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lý do..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Quấy rối/Lạm dụng</SelectItem>
                  <SelectItem value="misinformation">Thông tin sai lệch</SelectItem>
                  <SelectItem value="inappropriate">Nội dung không phù hợp</SelectItem>
                  <SelectItem value="copyright">Vi phạm bản quyền</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs md:text-sm">Chi tiết (tùy chọn)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Vui lòng mô tả chi tiết vấn đề..."
                  className="resize-none text-xs md:text-sm"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            size="sm"
            className="text-xs md:text-sm"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="text-xs md:text-sm"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
