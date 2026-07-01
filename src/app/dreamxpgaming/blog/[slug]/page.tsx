"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Clock, Tag, Share2, Heart, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface GameBlog {
  id: string;
  title: string;
  cover_image_url?: string;
  description?: string;
  blog_content?: string;
  blog_excerpt?: string;
  blog_published_at?: string;
  seo_title?: string;
  seo_description?: string;
  release_year?: string;
  platform?: string;
  genre?: string;
  rating?: number;
}

export default function GameBlogPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [game, setGame] = useState<GameBlog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGame();
  }, [slug]);

  const loadGame = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("xp_gaming_library")
        .select("*")
        .eq("blog_slug", slug)
        .eq("is_blog_enabled", true)
        .single();

      if (data) setGame(data);
    } catch (error) {
      console.log("Game not found");
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
        <div className="text-center">
          <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
          <h1 className="text-2xl font-bold text-white mb-2">Game Not Found</h1>
          <p className="text-zinc-400 mb-6">This game blog doesn't exist or isn't published yet.</p>
          <Link
            href="/dreamxpgaming"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Gaming
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F23] text-[#E2E8F0]">
      {/* Hero Image */}
      <div className="relative h-[50vh] overflow-hidden">
        {game.cover_image_url ? (
          <img
            src={game.cover_image_url}
            alt={game.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F23] via-[#0F0F23]/50 to-transparent" />
        
        {/* Back Button */}
        <Link
          href="/dreamxpgaming"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8 md:p-12"
        >
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {game.platform && (
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                {game.platform}
              </span>
            )}
            {game.genre && (
              <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-lg text-sm">
                {game.genre}
              </span>
            )}
            {game.release_year && (
              <span className="flex items-center gap-1 text-zinc-500 text-sm">
                <Calendar className="w-4 h-4" />
                {game.release_year}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-['Russo_One'] font-bold text-white mb-4">
            {game.title}
          </h1>

          {/* Excerpt */}
          {game.blog_excerpt && (
            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
              {game.blog_excerpt}
            </p>
          )}

          {/* Blog Content */}
          {game.blog_content ? (
            <div 
              className="prose prose-invert prose-lg max-w-none prose-headings:font-['Russo_One'] prose-a:text-purple-400 prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: game.blog_content }}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-500">Full blog content coming soon...</p>
            </div>
          )}

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <p className="text-zinc-500">Share this article</p>
              <button
                onClick={() => {
                  navigator.share?.({
                    title: game.title,
                    url: window.location.href,
                  }) || navigator.clipboard.writeText(window.location.href);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </motion.article>

        {/* Back to Gaming */}
        <div className="text-center py-12">
          <Link
            href="/dreamxpgaming"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Gaming Library
          </Link>
        </div>
      </div>
    </div>
  );
}