import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Calendar,
  Send,
  X,
  Upload,
  Trash2,
  FileText,
  Globe,
  ThumbsUp,
  Heart,
  MessageCircle,
  Repeat2,
  Sparkles,
  Coins,
  Bold,
  Italic,
  Underline,
  ImageIcon,
  Smile,
  Hash,
} from 'lucide-react';

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: any;
  onSuccess?: () => void;
  calculateCreditCost?: (content: any, isScheduled: boolean) => number;
}

export function ScheduleModal({ 
  open, 
  onOpenChange, 
  content, 
  onSuccess,
  calculateCreditCost = () => 2.5
}: ScheduleModalProps) {
  const { user } = useAuth();
  const { refreshQuota } = useQuota();
  
  const [isSchedulingExpanded, setIsSchedulingExpanded] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedHashtags, setEditedHashtags] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newHashtagInput, setNewHashtagInput] = useState('');

  useEffect(() => {
    if (content && open) {
      setEditedContent(content.content || '');
      setEditedHashtags(content.hashtags || []);
      setUploadedImages([]);
      
      // Set default schedule time to 1 hour from now
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const formatted = now.toISOString().slice(0, 16) + ':00';
      setScheduleDateTime(formatted);
    }
  }, [content, open]);

  const handleClose = () => {
    setIsSchedulingExpanded(false);
    setEditedHashtags([]);
    setNewHashtagInput('');
    setUploadedImages([]);
    onOpenChange(false);
  };

  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`w-[calc(100vw-1rem)] sm:w-full ${isSchedulingExpanded ? 'max-w-4xl' : 'max-w-[560px]'} max-h-[90vh] overflow-hidden p-0 gap-0 rounded-xl border border-border/60 shadow-xl [&>button]:hidden transition-all duration-300`}>
        <DialogHeader className="sr-only">
          <DialogTitle>Content Preview</DialogTitle>
        </DialogHeader>

        <div className={`flex ${isSchedulingExpanded ? 'flex-col sm:flex-row' : 'flex-col'} max-h-[90vh] bg-card`} style={{ maxWidth: '100%' }}>
          {/* LinkedIn Preview Panel */}
          <div className={`${isSchedulingExpanded ? 'w-full sm:w-1/2 sm:border-r border-border' : 'w-full'} flex flex-col ${isSchedulingExpanded ? 'max-h-[45vh] sm:max-h-[90vh]' : 'max-h-[90vh]'}`}>
            <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ maxWidth: '100%' }}>
              {/* Header */}
              <div className="flex items-start gap-2 p-4 pb-0" style={{ maxWidth: '100%' }}>
                <Avatar className="h-11 w-11 shrink-0 sm:h-12 sm:w-12">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-base font-bold sm:text-lg">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 overflow-hidden pt-0.5">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[13px] sm:text-sm text-foreground truncate block">
                      {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Your Name"}
                    </span>
                    <span className="text-[11px] sm:text-xs text-muted-foreground shrink-0">· 3rd+</span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug mt-px overflow-hidden text-ellipsis whitespace-nowrap">
                    {(content.title || "Content Creator | AI Enthusiast").length > 45
                      ? (content.title || "Content Creator | AI Enthusiast").substring(0, 45) + "..."
                      : (content.title || "Content Creator | AI Enthusiast")}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground mt-px">
                    <span>2d</span>
                    <span>·</span>
                    <span>Edited</span>
                    <span>·</span>
                    <Globe className="h-3 w-3" />
                  </div>
                </div>

                <span className="text-primary text-[13px] sm:text-sm font-bold shrink-0 pt-1 cursor-pointer hover:underline">
                  + Follow
                </span>
              </div>

              {/* Body */}
              <div className="px-4 pt-3 pb-2 overflow-hidden" style={{ maxWidth: '100%' }}>
                <div className="overflow-hidden" style={{ maxWidth: '100%', textAlign: 'justify' }}>
                  {(editedContent || content.content).split("\n").map((line, index) => (
                    <p
                      key={index}
                      className="text-[13px] sm:text-[14px] text-foreground mb-1.5"
                      style={{
                        lineHeight: 1.5,
                        wordBreak: 'normal',
                        overflowWrap: 'normal',
                        hyphens: 'none',
                        maxWidth: '100%',
                      }}
                    >
                      {line
                        ? line.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                            /^https?:\/\//.test(part) ? (
                              <a
                                key={i}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                                style={{ wordBreak: 'break-all' }}
                              >
                                {part.length > 50 ? part.substring(0, 50) + "..." : part}
                              </a>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )
                        : "\u00A0"}
                    </p>
                  ))}
                </div>

                {content.hashtags && content.hashtags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-x-1" style={{ maxWidth: '100%' }}>
                    {content.hashtags.map((tag: string, index: number) => (
                      <span key={index} className="text-[13px] sm:text-[14px] text-primary font-semibold hover:underline cursor-pointer">
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="px-4 pb-3">
                  {uploadedImages.length === 1 ? (
                    <div className="relative w-full max-h-96 h-96 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={uploadedImages[0]}
                        alt="Post media"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 700px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className={cn(
                      "grid gap-2",
                      uploadedImages.length === 2 ? "grid-cols-2" : "grid-cols-2"
                    )}>
                      {uploadedImages.slice(0, 4).map((url, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={url}
                            alt={`Post media ${index + 1}`}
                            fill
                            className="rounded-lg border border-border object-cover"
                            sizes="(max-width: 768px) 50vw, 250px"
                            unoptimized
                          />
                          {index === 3 && uploadedImages.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                              <span className="text-white text-2xl font-bold">+{uploadedImages.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AI Generated Visual */}
              {content.visual_url &&
               content.visual_url.startsWith('http') &&
               !uploadedImages.length && (
                <div className="px-4 pb-3" data-generated-visual>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <div className="relative w-full h-[400px]">
                      <Image
                        src={content.visual_url}
                        alt="Generated visual content"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 700px"
                        unoptimized
                        onError={(e) => {
                          (e.currentTarget as unknown as HTMLElement)
                            ?.closest('[data-generated-visual]')
                            ?.remove();
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Reactions */}
              <div className="px-4 py-1.5">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex -space-x-1">
                      <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full bg-primary flex items-center justify-center">
                        <ThumbsUp className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-primary-foreground" />
                      </div>
                      <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full bg-destructive flex items-center justify-center">
                        <Heart className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-destructive-foreground" />
                      </div>
                    </div>
                    <span>73</span>
                  </div>
                  <span>22 comments · 3 reposts</span>
                </div>
              </div>

              <div className="mx-4 border-t border-border" />

              {/* Action buttons */}
              <div className="flex items-center justify-around py-1 px-0">
                {[
                  { icon: ThumbsUp, label: "Like" },
                  { icon: MessageCircle, label: "Comment" },
                  { icon: Repeat2, label: "Repost" },
                  { icon: Send, label: "Send" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center gap-0.5 py-2 px-2 sm:px-3 rounded hover:bg-muted/70 transition-colors text-muted-foreground"
                  >
                    <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                    <span className="text-[10px] sm:text-xs font-semibold leading-none">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer with Enhanced Actions - Only show when not expanded */}
            {!isSchedulingExpanded && (
              <div className="border-t border-border bg-card p-4">
                {/* AI Score and Info */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs h-6 shrink-0">
                      <Sparkles className="h-3 w-3" />
                      AI
                    </Badge>
                    {content.ai_score && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs h-6 shrink-0">Score: {content.ai_score}</Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {/* Post Now Button */}
                  <Button
                    className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                    onClick={async () => {
                      try {
                        setIsPublishing(true);
                        const response = await apiClient.post('/posts/publish', {
                          contentId: content.id,
                          content: editedContent || content.content,
                          mediaUrls: uploadedImages,
                        });
                        toast.success('Post published successfully!');
                        handleClose();
                        setIsPublishing(false);
                        refreshQuota();
                        onSuccess?.();
                      } catch (error: any) {
                        setIsPublishing(false);
                        toast.error(error.response?.data?.message || 'Failed to publish post');
                      }
                    }}
                    disabled={isPublishing}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    <span className="flex items-center">
                      {isPublishing ? 'Publishing...' : (
                        <>
                          Post Now ({calculateCreditCost(content, false)} <Coins className="h-3.5 w-3.5 ml-0.5 inline" />)
                        </>
                      )}
                    </span>
                  </Button>
                  
                  {/* Schedule Button */}
                  <Button 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    onClick={() => {
                      setEditedContent(content.content || '');
                      setEditedHashtags(content.hashtags || []);
                      setIsSchedulingExpanded(true);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="flex items-center">
                      Schedule ({calculateCreditCost(content, true)} <Coins className="h-3.5 w-3.5 ml-0.5 inline" />)
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Scheduling Configuration Panel */}
          {isSchedulingExpanded && (
            <div className="w-full sm:w-1/2 flex flex-col bg-gradient-to-br from-background to-muted/20 border-t sm:border-t-0 border-l-0 sm:border-l border-border max-h-[45vh] sm:max-h-[90vh]">
              {/* Scheduling Header */}
              <div className="p-4 sm:p-6 border-b border-border/60 bg-card/50 backdrop-blur-sm shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">Schedule Configuration</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Set up your post for perfect timing</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        try {
                          const response = await apiClient.post('/posts/draft', {
                            contentId: content.id,
                            content: editedContent,
                            hashtags: editedHashtags,
                            mediaUrls: uploadedImages,
                          });
                          
                          if (response.success) {
                            toast.success('Draft saved successfully!');
                            onSuccess?.();
                          }
                        } catch (error: any) {
                          toast.error(error.response?.data?.message || 'Failed to save draft');
                        }
                      }}
                      className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 gap-1.5"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Save Draft</span>
                      <span className="sm:hidden">Draft</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsSchedulingExpanded(false)}
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scheduling Content - Scrollable */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 sm:space-y-8">
                {/* Date & Time Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h4 className="font-semibold text-foreground">When to Publish</h4>
                  </div>
                  
                  <DateTimePicker
                    value={scheduleDateTime || new Date().toISOString()}
                    onChange={setScheduleDateTime}
                    minDate={new Date().toISOString().split('T')[0]}
                    label="Schedule Date & Time"
                  />
                  
                  {/* Quick Time Presets */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'In 1 hour', hours: 1 },
                      { label: 'Tomorrow 9 AM', hours: 24, time: '09:00' },
                      { label: 'Next Monday', days: 7, time: '10:00' },
                    ].map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const now = new Date();
                          if (preset.hours) {
                            now.setHours(now.getHours() + preset.hours);
                          }
                          if (preset.days) {
                            now.setDate(now.getDate() + preset.days);
                          }
                          if (preset.time) {
                            const [hours, minutes] = preset.time.split(':');
                            now.setHours(parseInt(hours), parseInt(minutes));
                          }
                          const formatted = now.toISOString().slice(0, 16) + ':00';
                          setScheduleDateTime(formatted);
                        }}
                        className="text-xs hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Content Customization */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="font-semibold text-foreground">Content Customization</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Edit Post Content</Label>
                    <div className="border border-border/60 rounded-lg bg-background overflow-hidden">
                      {/* Rich Text Toolbar */}
                      <div className="flex items-center justify-between p-3 border-b border-border/60 bg-muted/30">
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <Underline className="h-4 w-4" />
                          </Button>
                          <div className="w-px h-6 bg-border/60 mx-1" />
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <Smile className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <Hash className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {editedContent.length}/3000
                        </div>
                      </div>
                      
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        placeholder="Customize your post content..."
                        className="border-0 resize-none focus:ring-0 min-h-[140px] bg-transparent"
                        maxLength={3000}
                      />
                    </div>
                  </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <h4 className="font-semibold text-foreground">Media Upload</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Upload Custom Images</Label>
                    
                    {/* Upload Button */}
                    <div className="border-2 border-dashed border-border/60 rounded-lg p-6 hover:border-pink-500 transition-colors cursor-pointer bg-muted/20">
                      <input
                        type="file"
                        id="image-upload-schedule"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;

                          const toastId = toast.loading('Uploading images...');
                          
                          try {
                            const uploadPromises = Array.from(files).map(async (file) => {
                              const reader = new FileReader();
                              return new Promise<string>((resolve, reject) => {
                                reader.onload = async () => {
                                  try {
                                    const base64 = reader.result as string;
                                    const response = await apiClient.post('/media/upload', {
                                      image: base64,
                                      filename: file.name,
                                    });
                                    if (response && response.url) {
                                      resolve(response.url);
                                    } else {
                                      reject(new Error('No URL returned'));
                                    }
                                  } catch (error) {
                                    reject(error);
                                  }
                                };
                                reader.onerror = () => reject(new Error('Failed to read file'));
                                reader.readAsDataURL(file);
                              });
                            });

                            const urls = await Promise.all(uploadPromises);
                            setUploadedImages([...uploadedImages, ...urls]);
                            toast.success(`${urls.length} image(s) uploaded successfully!`, { id: toastId });
                            
                            // Reset the input
                            e.target.value = '';
                          } catch (error: any) {
                            toast.error(error.response?.data?.message || error.message || 'Failed to upload images', { id: toastId });
                          }
                        }}
                      />
                      <label htmlFor="image-upload-schedule" className="flex flex-col items-center justify-center cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium text-foreground">Click to upload images</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                      </label>
                    </div>

                    {/* Uploaded Images Preview */}
                    {uploadedImages.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Uploaded Images ({uploadedImages.length})</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {uploadedImages.map((url, index) => (
                            <div key={index} className="relative group rounded-lg overflow-hidden border border-border/60 aspect-square">
                              <Image
                                src={url}
                                alt={`Uploaded ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, 33vw"
                                unoptimized
                              />
                              <button
                                onClick={() => {
                                  setUploadedImages(uploadedImages.filter((_, i) => i !== index));
                                  toast.success('Image removed');
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hashtags Management */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <h4 className="font-semibold text-foreground">Hashtags & Tags</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {content.hashtags && content.hashtags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">Current Hashtags</Label>
                        <div className="flex flex-wrap gap-2">
                          {content.hashtags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                              {tag.startsWith("#") ? tag : `#${tag}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium text-foreground mb-2 block">Add More Tags</Label>
                      <Input
                        placeholder="Add hashtags separated by commas..."
                        className="bg-background border-border/60 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Platform Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <h4 className="font-semibold text-foreground">Platform Settings</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">in</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">LinkedIn</p>
                          <p className="text-xs text-muted-foreground">Professional Network</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Connected
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 sm:p-6 border-t border-border/60 bg-card/30 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await apiClient.post('/posts/schedule', {
                          contentId: content.id,
                          scheduledFor: new Date(scheduleDateTime).toISOString(),
                          content: editedContent,
                          mediaUrls: uploadedImages
                        });
                        const scheduledTime = new Date(scheduleDateTime).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        });
                        toast.success(`Post scheduled for ${scheduledTime} IST`);
                        handleClose();
                        refreshQuota();
                        onSuccess?.();
                      } catch (error: any) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to schedule post';
                        
                        if (errorMessage.includes('Insufficient credits') || errorMessage.includes('upgrade your plan')) {
                          toast.error(errorMessage, { duration: 5000 });
                        } else {
                          toast.error(errorMessage);
                        }
                      }
                    }}
                    disabled={!scheduleDateTime}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="flex items-center">
                      Schedule Post ({calculateCreditCost(content, true)} <Coins className="h-4 w-4 ml-0.5 inline" />)
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await apiClient.post('/posts/publish', {
                          contentId: content.id,
                          content: editedContent,
                          mediaUrls: uploadedImages
                        });
                        toast.success('Post published successfully!');
                        handleClose();
                        refreshQuota();
                        onSuccess?.();
                      } catch (error: any) {
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to publish post';
                        
                        if (errorMessage.includes('Insufficient credits') || errorMessage.includes('upgrade your plan')) {
                          toast.error(errorMessage, { duration: 5000 });
                        } else {
                          toast.error(errorMessage);
                        }
                      }
                    }}
                    className="h-12 px-6 border-2 hover:bg-muted/50 font-medium transition-all"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    <span className="flex items-center">
                      Post Now ({calculateCreditCost(content, false)} <Coins className="h-4 w-4 ml-0.5 inline" />)
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}