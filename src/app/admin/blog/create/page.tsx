
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug usually contains lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().optional(),
  content: z.string().min(20, "Content must be at least 20 characters"),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  published: z.boolean().default(false),
  authorName: z.string().optional(),
  tags: z.string().optional(), // We'll parse this string into an array
});

export default function CreatePostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      published: false,
      authorName: "SaCar Team",
      tags: "",
    },
  });

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    form.setValue("slug", slug);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          tags: values.tags ? values.tags.split(",").map((t) => t.trim()) : [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      toast.success("Post created successfully!");
      router.push("/admin/blog");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create New Post</h2>
          <p className="text-muted-foreground">
            Write a new article for your blog.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter post title" 
                            {...field} 
                            onChange={(e) => {
                                field.onChange(e);
                                if (!form.getValues("slug")) {
                                    generateSlug(e.target.value);
                                }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                             <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-sm text-muted-foreground whitespace-nowrap">
                                /blog/
                             </span>
                             <Input placeholder="post-url-slug" {...field} className="rounded-l-none" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          The URL-friendly version of the name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content (Markdown supported)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your article content here..." 
                            className="min-h-[400px] font-mono text-sm leading-relaxed" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
               <Card>
                <CardHeader>
                  <CardTitle>SEO & Meta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Short summary for preview cards and SEO..." 
                            className="h-24 resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                            Appears on the blog listing page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
               </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publishing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Publish
                          </FormLabel>
                          <FormDescription>
                            Make this post visible to the public.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="authorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Save Post
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Media & Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                            Full URL to the cover image.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="Reviews, News, SUV" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
