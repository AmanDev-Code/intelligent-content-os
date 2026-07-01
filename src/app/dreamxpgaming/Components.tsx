// Components.tsx - Premium UI Components for DreamXP Gaming

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Gamepad2,
  Heart,
  Rocket,
  Zap,
  Trophy,
  Users,
  TrendingUp,
  Star,
  Shield,
  Sparkles,
  Copy,
  Share2,
  Download,
  ChevronRight,
  Play,
  MessageSquare,
  ThumbsUp,
  Calendar,
  Award,
  Gift,
  Cpu,
  Monitor,
  Headphones,
  Crown,
  Youtube,
  Instagram,
  Twitter,
  Twitch,
  Github,
  MessageCircle,
  ExternalLink,
  Video,
} from "lucide-react";

// Loading Screen Component
export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0F0F23] flex items-center justify-center z-50"
    >
      <div className="relative">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity },
          }}
          className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500"
        />
        <Gamepad2 className="absolute inset-0 m-auto w-10 h-10 text-purple-400" />
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-1/3 text-purple-400 text-sm font-mono tracking-widest"
      >
        INITIALIZING DREAM...
      </motion.p>
    </motion.div>
  );
}

// Platform Icons Map
const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  discord: MessageCircle,
  twitch: Twitch,
  github: Github,
};

// Hero Section Component - Reimagined
export function HeroSection({
  config,
  animatedRaised,
  progress,
  handleSupport,
  copyUPI,
  handleShare,
  downloadQR,
  QR_URL,
  heroY,
  socials,
}: any) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Content - Story Driven */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Small intro */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-purple-400 font-medium tracking-wider uppercase text-sm"
            >
              A Gamer's Journey
            </motion.p>

            {/* Main Title */}
            <div>
              <motion.h1
                className="text-5xl lg:text-7xl font-['Russo_One'] font-bold leading-none mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="block text-white mb-2">I'm Building</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                  My Gaming Legacy
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-zinc-400 leading-relaxed max-w-2xl"
              >
                Not just asking for a PS5. I'm inviting you to be part of something bigger - 
                a journey from zero to gaming content creator.
              </motion.p>
            </div>

            {/* Progress - Subtle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-baseline">
                <p className="text-sm text-zinc-500">Journey Progress</p>
                <p className="text-xl font-bold text-white">
                  {progress.toFixed(0)}%
                </p>
              </div>
              <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
              <div className="flex justify-between text-sm text-zinc-500">
                <span>₹{animatedRaised.toLocaleString()} raised</span>
                <span>₹{config.goal_amount.toLocaleString()} goal</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-3"
            >
              <motion.button
                onClick={handleSupport}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Join My Journey
              </motion.button>
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-all flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Story
              </motion.button>
            </motion.div>

            {/* Social Icons */}
            {socials && socials.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-3 pt-2"
              >
                <span className="text-sm text-zinc-500">Follow:</span>
                {socials.map((social: any) => {
                  const Icon = PLATFORM_ICONS[social.platform] || MessageCircle;
                  return (
                    <motion.a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-zinc-800/50 rounded-lg hover:bg-purple-500/20 transition-colors cursor-pointer"
                    >
                      <Icon className="w-5 h-5 text-zinc-400 hover:text-purple-400" />
                    </motion.a>
                  );
                })}
              </motion.div>
            )}
          </motion.div>

          {/* Right QR Section - Floating Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative">
              {/* Download Button - Outside Card */}
              <motion.button
                onClick={downloadQR}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -top-3 -right-3 z-20 p-3 bg-purple-600 rounded-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/30"
                title="Download QR Code"
              >
                <Download className="w-5 h-5 text-white" />
              </motion.button>

              {/* Glow Effect */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 60px rgba(167, 139, 250, 0.3)",
                    "0 0 100px rgba(244, 63, 94, 0.3)",
                    "0 0 60px rgba(167, 139, 250, 0.3)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl"
              />
              
              {/* QR Card */}
              <div className="relative bg-zinc-900/80 backdrop-blur-xl p-6 rounded-3xl border border-zinc-800">
                {/* QR Code */}
                <div className="bg-white p-4 rounded-2xl mb-4">
                  <img
                    src={QR_URL}
                    alt="Support QR Code"
                    className="w-52 h-52 object-contain"
                    style={{ imageRendering: "crisp-edges" }}
                  />
                </div>

                {/* UPI Info */}
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 mb-1">UPI ID</p>
                    <p className="text-base font-mono text-white">{config.upi_id}</p>
                  </div>
                  
                  <motion.button
                    onClick={copyUPI}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 bg-zinc-800 text-white text-sm rounded-xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy UPI ID
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Gaming Stats Component
export function GamingStats({ stats }: any) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat: any, index: number) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl blur-xl`} />
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                <p className="text-3xl font-bold text-white font-mono">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Story Section Component
export function StorySection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 blur-3xl" />
          <div className="relative bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 lg:p-12">
            <Gamepad2 className="w-12 h-12 text-purple-400 mb-6" />
            <h2 className="text-3xl lg:text-4xl font-['Russo_One'] font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              THE QUEST BEGINS
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Every legendary gamer has an origin story. Mine starts with watching countless gameplay videos, 
                feeling the controller in my imagination, experiencing victories through someone else's screen.
              </p>
              <p>
                This isn't just about owning a console. It's about joining a community, creating content, 
                and giving back to the gaming world that gave me so much joy even from the sidelines.
              </p>
              <p className="text-purple-400 font-medium">
                When I finally power on that PS5, you'll be part of that moment. Your name will be in the credits of my story.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Community Section Component
export function CommunitySection({ messages, newName, newMessage, setNewName, setNewMessage, addMessage, selectedTag, setSelectedTag, tags, likeMessage }: any) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl lg:text-4xl font-['Russo_One'] font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400"
        >
          COMMUNITY WALL
        </motion.h2>
        
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Your Gamer Tag"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="Leave your mark..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="px-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
              />
            </div>
            <motion.button
              onClick={addMessage}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white"
            >
              POST MESSAGE
            </motion.button>
          </div>
        </motion.div>

        {/* Messages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {messages.slice(0, 6).map((msg: any, index: number) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4"
              >
                <p className="font-bold text-purple-400 mb-2">{msg.name}</p>
                <p className="text-gray-400 text-sm">{msg.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// Social Section Component
export function SocialSection({ socials }: any) {
  const PLATFORM_ICONS: Record<string, React.ElementType> = {
    instagram: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/><path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z"/><circle cx="18.406" cy="5.594" r="1.44"/></svg>,
    youtube: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    twitter: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>,
    discord: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>,
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-2xl font-['Russo_One'] font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
        >
          JOIN THE JOURNEY
        </motion.h2>
        <div className="flex justify-center gap-6">
          {socials.map((social: any) => {
            const Icon = PLATFORM_ICONS[social.platform] || (() => null);
            return (
              <motion.a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl hover:border-purple-400/50 transition-colors"
              >
                <Icon />
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Footer Section Component
export function FooterSection() {
  return (
    <footer className="py-12 px-4 border-t border-purple-500/20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-gray-500 mb-4"
        >
          One day I'll post my first PS5 unboxing and tag everyone who helped make it possible.
        </motion.p>
        <p className="text-xs text-purple-400 font-mono">DREAMXP GAMING © 2026</p>
      </div>
    </footer>
  );
}

// Gaming Library Section - Bento Grid
export function GamingLibrarySection({ gamingLibrary }: any) {
  const getGridClass = (size: string) => {
    switch (size) {
      case 'large': return 'col-span-2 row-span-2'; // 4 cards on both mobile & desktop
      case 'wide': return 'col-span-2'; // 2 cards horizontal on both
      case 'tall': return 'row-span-2'; // 2 cards vertical on both
      case 'small': return ''; // 1 card
      default: return ''; // medium = 1 card
    }
  };

  const handleGameClick = (game: any) => {
    if (game.is_blog_enabled && game.blog_slug) {
      window.location.href = `/dreamxpgaming/blog/${game.blog_slug}`;
    }
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-['Russo_One'] mb-2 text-white">
            Gaming Library
          </h2>
          <p className="text-zinc-400">Games I'll master on my PS5 journey</p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[140px] sm:auto-rows-[160px] md:auto-rows-[200px] grid-flow-dense">
          {gamingLibrary.map((game: any, index: number) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => handleGameClick(game)}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer ${getGridClass(game.grid_size)}`}
            >
              {/* Background Image */}
              {game.cover_image_url ? (
                <img
                  src={game.cover_image_url}
                  alt={game.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Featured Badge */}
              {game.is_featured && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-purple-500/80 backdrop-blur-sm rounded-lg text-xs font-semibold text-white">
                  Featured
                </div>
              )}

              {/* Blog Badge */}
              {game.is_blog_enabled && (
                <div className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-2">
                  {game.platform && (
                    <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded text-xs text-zinc-300">
                      {game.platform}
                    </span>
                  )}
                  {game.genre && (
                    <span className="px-2 py-0.5 bg-purple-500/20 backdrop-blur-sm rounded text-xs text-purple-300">
                      {game.genre}
                    </span>
                  )}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1">{game.title}</h3>
                {game.description && (
                  <p className="text-sm text-zinc-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {game.description}
                  </p>
                )}
                {game.release_year && (
                  <p className="text-xs text-zinc-500 mt-1">{game.release_year}</p>
                )}
              </div>

              {/* Hover Glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(167, 139, 250, 0.2) 0%, transparent 70%)',
                }}
              />
            </motion.div>
          ))}
        </div>

        {gamingLibrary.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500">Gaming library coming soon...</p>
          </div>
        )}
      </div>
    </section>
  );
}

// Gaming Stats Ticker
export function GamingStatsTicker({ stats }: { stats?: Array<{ label: string; value: string; icon?: string }> }) {
  const defaultStats = [
    { label: "Hours Watched", value: "500M+", iconName: "Play" },
    { label: "Active Gamers", value: "3.2B", iconName: "Users" },
    { label: "PS5 Sold", value: "60M+", iconName: "Trophy" },
    { label: "Games Released", value: "1000+", iconName: "Gamepad2" },
  ];

  const ICON_MAP: Record<string, React.ElementType> = {
    Play, Users, Trophy, Gamepad2, Star, Heart, Zap, Rocket, Award, Crown
  };

  const displayStats = stats && stats.length > 0 
    ? stats.map(s => ({ ...s, iconName: s.icon || "Trophy" }))
    : defaultStats;

  return (
    <section className="py-8 border-y border-zinc-800/50 overflow-hidden">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-16 whitespace-nowrap"
      >
        {[...displayStats, ...displayStats, ...displayStats].map((stat, index) => {
          const IconComponent = ICON_MAP[stat.iconName] || Trophy;
          return (
            <div key={index} className="flex items-center gap-3">
              <IconComponent className="w-5 h-5 text-purple-400" />
              <span className="text-zinc-400">{stat.label}:</span>
              <span className="text-white font-bold">{stat.value}</span>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}

// Countdown Section
export function CountdownSection({ targetDate, title, subtitle }: { targetDate?: string; title?: string; subtitle?: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = targetDate ? new Date(targetDate) : new Date("2026-12-31T23:59:59");
    const interval = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-['Russo_One'] mb-2 text-white">
            {title || "Countdown to PS5"}
          </h2>
          <p className="text-zinc-400">{subtitle || "The dream gets closer every second"}</p>
        </motion.div>

        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.05 }}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center border border-zinc-800"
            >
              <p className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono">
                {String(item.value).padStart(2, '0')}
              </p>
              <p className="text-xs md:text-sm text-zinc-500 uppercase mt-2">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Why Support Section
export function WhySupportSection() {
  const reasons = [
    { icon: Gamepad2, title: "Help a Gamer", description: "Support someone who truly loves gaming" },
    { icon: Video, title: "Future Creator", description: "Be part of a content creation journey" },
    { icon: Heart, title: "Community", description: "Join a growing gaming family" },
    { icon: Trophy, title: "Shared Victory", description: "Celebrate wins together" },
  ];

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-['Russo_One'] mb-2 text-white">
            Why Join This Journey?
          </h2>
          <p className="text-zinc-400">More than just support - it's a partnership</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-zinc-900/30 backdrop-blur-sm rounded-2xl p-6 text-center border border-zinc-800 hover:border-purple-500/30 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <reason.icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{reason.title}</h3>
              <p className="text-sm text-zinc-400">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Journey Section Component
export function JourneySection({ journey, activeIndex }: any) {
  const IconComponent = journey[activeIndex]?.icon ? 
    (ICON_MAP[journey[activeIndex].icon] || Sparkles) : Sparkles;

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-['Russo_One'] mb-4 text-white">
            My Gaming Journey
          </h2>
          <p className="text-zinc-400 text-lg">Every legend has a beginning</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500/20 via-purple-500/50 to-purple-500/20" />

          {/* Journey Items */}
          <div className="space-y-12">
            {journey.map((item: any, index: number) => {
              const ItemIcon = item.icon ? (ICON_MAP[item.icon] || Sparkles) : Sparkles;
              const isActive = index === activeIndex;
              
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {/* Content Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`w-full md:w-5/12 ${
                      index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'
                    }`}
                  >
                    <div className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-purple-500/30'
                    }`}>
                      <div className={`flex items-center gap-3 mb-3 ${
                        index % 2 === 0 ? 'justify-end' : 'justify-start'
                      }`}>
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <ItemIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-purple-400 font-bold text-lg">{item.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-zinc-400">{item.story}</p>
                    </div>
                  </motion.div>

                  {/* Center Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <motion.div
                      animate={isActive ? {
                        scale: [1, 1.2, 1],
                        boxShadow: [
                          "0 0 20px rgba(167, 139, 250, 0.5)",
                          "0 0 40px rgba(167, 139, 250, 0.8)",
                          "0 0 20px rgba(167, 139, 250, 0.5)",
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-6 h-6 rounded-full border-4 ${
                        isActive 
                          ? 'bg-purple-500 border-purple-400' 
                          : 'bg-zinc-800 border-zinc-700'
                      }`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// Commitments Section Component
export function CommitmentsSection({ commitments }: any) {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-['Russo_One'] mb-4 text-white">
            What I'm Building
          </h2>
          <p className="text-zinc-400 text-lg">My commitments to the gaming community</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commitments.map((commitment: any, index: number) => {
            const CommitmentIcon = commitment.icon ? (ICON_MAP[commitment.icon] || Star) : Star;
            
            return (
              <motion.div
                key={commitment.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <div className="h-full p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CommitmentIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs border ${
                      commitment.status === 'active' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : commitment.status === 'starting'
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {commitment.status}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">{commitment.title}</h3>
                  <p className="text-zinc-400">{commitment.description}</p>
                  
                  {commitment.progress !== undefined && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-500">Progress</span>
                        <span className="text-purple-400">{commitment.progress}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${commitment.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Games Section Component
export function GamesSection({ games }: any) {
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-['Russo_One'] mb-4 text-white">
            Games I'll Master
          </h2>
          <p className="text-zinc-400 text-lg">The journey through PlayStation exclusives</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game: any, index: number) => (
            <motion.div
              key={game.id || index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-purple-500/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{game.game_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Trophy className="w-4 h-4" />
                    <span>{game.achievements_unlocked || 0}/{game.total_achievements || 0}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Progress</span>
                    <span className="text-purple-400">{game.progress}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${game.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                  {game.hours_played !== undefined && (
                    <p className="text-xs text-zinc-600 mt-2">
                      {game.hours_played} hours played
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Add ICON_MAP for dynamic icons
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Cpu,
  Youtube,
  Gamepad2,
  Play,
  Users,
  Trophy,
  Star,
  Zap,
};

// Waitlist Section with Casino Slot Machine Animation
export function WaitlistSection({ 
  waitlist, 
  totalCount, 
  onJoinWaitlist 
}: { 
  waitlist: Array<{ id: string; name: string; email: string; created_at: string }>;
  totalCount: number;
  onJoinWaitlist: (name: string, email: string) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visibleUsers, setVisibleUsers] = useState<Array<{ id: string; name: string; email: string; highlightState: 'new' | 'fading' | 'none' }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const maskEmail = (emailStr: string) => {
    const [localPart, domain] = emailStr.split("@");
    if (!domain) return "***@***.com";
    const tld = domain.split(".").pop() || "com";
    const first3 = localPart.slice(0, 3);
    return `${first3}***@***.${tld}`;
  };

  // Initialize with first 5 users
  useEffect(() => {
    if (waitlist.length > 0 && visibleUsers.length === 0) {
      setVisibleUsers(waitlist.slice(0, 5).map(u => ({ ...u, highlightState: 'none' as const })));
      setCurrentIndex(5 % waitlist.length);
    }
  }, [waitlist]);

  // Slot machine rotation
  useEffect(() => {
    if (waitlist.length <= 5) return;

    const interval = setInterval(() => {
      const nextUser = waitlist[currentIndex];
      
      // Step 1: Add new user with 'new' highlight
      setVisibleUsers(prev => {
        const newList = [
          { ...nextUser, highlightState: 'new' as const },
          ...prev.slice(0, 4).map(u => ({ ...u, highlightState: 'none' as const }))
        ];
        return newList;
      });

      // Step 2: After 1.5s, start fading (transition to 'fading' state)
      setTimeout(() => {
        setVisibleUsers(prev => prev.map((u, i) => 
          i === 0 ? { ...u, highlightState: 'fading' as const } : u
        ));
      }, 1500);

      // Step 3: After fade completes (500ms), set to 'none'
      setTimeout(() => {
        setVisibleUsers(prev => prev.map(u => ({ ...u, highlightState: 'none' as const })));
      }, 2000);

      setCurrentIndex(prev => (prev + 1) % waitlist.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [waitlist, currentIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    const success = await onJoinWaitlist(name.trim(), email.trim());
    if (success) {
      setName("");
      setEmail("");
    }
    setSubmitting(false);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm text-purple-300">{totalCount} gamers waiting</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-['Russo_One'] mb-2 text-white">Join the Waitlist</h2>
          <p className="text-zinc-400 max-w-md mx-auto text-sm">Be first to know when I get my PS5</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-5 items-stretch">
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-2xl p-5 flex flex-col"
          >
            <div className="space-y-3 flex-1">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your gamer name"
                  className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl focus:outline-none focus:border-purple-500/50 text-white placeholder-zinc-500 transition-colors text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl focus:outline-none focus:border-purple-500/50 text-white placeholder-zinc-500 transition-colors text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="mt-auto pt-4">
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <><Sparkles className="w-4 h-4" /> Join the Waitlist</>
                )}
              </motion.button>
              
              <div className="flex items-center justify-center gap-5 mt-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> No spam</span>
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Instant updates</span>
              </div>

              {/* Benefits Section */}
              <div className="mt-5 pt-4 border-t border-zinc-800/50">
                <p className="text-xs text-zinc-500 mb-3 text-center">What you'll get:</p>
                <div className="space-y-2">
                  {[
                    { icon: Gift, text: "Early access to exclusive content" },
                    { icon: Trophy, text: "Be part of the PS5 journey" },
                    { icon: Users, text: "Join the gaming community" },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-400">
                      <benefit.icon className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.form>

          {/* Live Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-white font-medium text-sm">Live Waitlist</span>
              </div>
              <span className="text-xs text-zinc-500">{totalCount} joined</span>
            </div>

            <div className="p-2.5 flex-1">
              <AnimatePresence initial={false} mode="popLayout">
                {visibleUsers.map((user, idx) => {
                  const isHighlighted = user.highlightState === 'new';
                  const isFading = user.highlightState === 'fading';
                  
                  return (
                    <motion.div
                      key={user.id}
                      layout
                      initial={{ opacity: 0, y: -50, scale: 0.95 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }
                      }}
                      exit={{ 
                        opacity: 0, 
                        y: 50, 
                        scale: 0.95,
                        transition: { duration: 0.2 }
                      }}
                      className="mb-1.5"
                    >
                      <div 
                        className="flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-500 ease-out"
                        style={{
                          backgroundColor: isHighlighted 
                            ? 'rgba(168, 85, 247, 0.15)' 
                            : isFading 
                              ? 'rgba(168, 85, 247, 0.05)' 
                              : 'rgba(39, 39, 42, 0.4)',
                          borderColor: isHighlighted 
                            ? 'rgba(168, 85, 247, 0.4)' 
                            : isFading 
                              ? 'rgba(168, 85, 247, 0.15)' 
                              : 'transparent',
                        }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs transition-all duration-500 ease-out"
                          style={{
                            background: isHighlighted 
                              ? 'linear-gradient(135deg, rgb(168, 85, 247), rgb(236, 72, 153))' 
                              : isFading 
                                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5))' 
                                : 'rgb(63, 63, 70)',
                          }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{user.name}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">{maskEmail(user.email)}</p>
                        </div>
                        {/* New Badge with fade animation */}
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: isHighlighted ? 1 : isFading ? 0 : 0,
                            scale: isHighlighted ? 1 : isFading ? 0.8 : 0.8,
                          }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="px-1.5 py-0.5 text-[10px] font-semibold text-green-400 bg-green-500/20 rounded-full"
                        >
                          New
                        </motion.span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="px-4 py-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs mt-auto">
              <span className="text-zinc-500">New entries drop in live</span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                Live
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}