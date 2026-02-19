
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, ArrowLeft, Share2, Clock } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });
  
  if (!post) return { title: 'Post Not Found' };
  
  return {
    title: `${post.title} | Advance Auto Blog`,
    description: post.excerpt || post.metaDescription || `Read about ${post.title}`,
    keywords: post.metaKeywords,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    notFound();
  }

  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Draft';

  // Estimate reading time (rough calc: 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Image Background (if exists) or Default */}
      <div className="relative h-[400px] w-full bg-muted overflow-hidden">
        {post.coverImage ? (
             <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-full object-cover"
             />
        ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        
        <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 md:px-6 pb-12">
            <Button variant="outline" size="sm" asChild className="w-fit mb-6 text-white border-white/40 hover:bg-white/10 hover:text-white">
                <Link href="/blog" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Articles
                </Link>
            </Button>
            
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                            {tag}
                        </Badge>
                    ))}
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                    {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base pt-2">
                    <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 opacity-80" />
                        <span className="font-medium">{post.authorName || 'Advance Auto Team'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 opacity-80" />
                        <span>{formattedDate}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 opacity-80" />
                        <span>{readTime} min read</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Content Container */}
      <article className="container mx-auto px-4 md:px-6 -mt-8 relative z-10">
        <div className="bg-card rounded-xl shadow-xl p-8 md:p-12 max-w-4xl border mx-auto">
             
             {post.excerpt && (
                 <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 font-light border-l-4 border-primary pl-6 py-2 italic">
                     {post.excerpt}
                 </p>
             )}

            {/* Main Content */}
            <div className="prose prose-lg dark:prose-invert prose-stone max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:pl-4 prose-blockquote:rounded-r
            ">
                <div className="whitespace-pre-wrap leading-relaxed">
                    {post.content}
                </div>
            </div>

            <div className="mt-16 pt-8 border-t flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Written by</span>
                    <span className="text-lg font-bold">{post.authorName || 'Advance Auto Team'}</span>
                </div>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 hover:bg-muted" title="Share Article">
                    <Share2 className="w-5 h-5" />
                </Button>
            </div>
        </div>
      </article>

      {/* Suggested/Related Posts Placeholder - Can be implemented later */}
    </div>
  );
}
