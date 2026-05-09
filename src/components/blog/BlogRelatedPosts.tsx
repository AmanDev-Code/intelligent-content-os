import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { cssObjectPositionForFeaturedImage } from "@/lib/blogFeaturedImagePosition";

export interface RelatedPost {
  id: string;
  path: string;
  title: string;
  excerpt?: string | null;
  featured_image_url?: string | null;
  featured_image_object_position?: string | null;
  published_at?: string | null;
  reading_minutes?: number | null;
}

interface BlogRelatedPostsProps {
  posts: RelatedPost[];
}

const PLACEHOLDER_GRADIENTS = [
  "from-primary/20 to-primary/5",
  "from-violet-500/20 to-violet-500/5",
  "from-emerald-500/20 to-emerald-500/5",
];

export function BlogRelatedPosts({ posts }: BlogRelatedPostsProps) {
  if (!posts.length) return null;

  return (
    <section className="mt-16 border-t border-border/50 pt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
          More from the blog
        </h2>
        <Link href={BLOG_BASE_PATH} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          All posts <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <Link
            key={post.id}
            href={`${BLOG_BASE_PATH}/${post.path}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="h-44 overflow-hidden">
              {post.featured_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{
                    objectPosition: cssObjectPositionForFeaturedImage(
                      post.featured_image_object_position,
                      "listing",
                    ),
                  }}
                />
              ) : (
                <div
                  className={`h-full w-full bg-gradient-to-br ${PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length]}`}
                />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="font-heading text-sm font-bold leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              {post.excerpt ? (
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              ) : null}
              {post.reading_minutes != null ? (
                <p className="mt-auto pt-2 text-[10px] text-muted-foreground/60">
                  {post.reading_minutes} min read
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
