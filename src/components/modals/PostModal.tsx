import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Bold, 
  Italic, 
  Underline,
  Smile,
  Link,
  Hash,
  X,
  Send,
  Upload,
  Eye,
  Edit3,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import Image from 'next/image';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    title: string;
    content: string;
    hashtags?: string[];
    visual_type?: string;
    visual_url?: string;
    media_urls?: string[];
    created_at?: string;
  };
  mode?: 'preview' | 'schedule' | 'edit';
}

export function PostModal({ isOpen, onClose, post, mode: initialMode = 'preview' }: PostModalProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [editedContent, setEditedContent] = useState(post.content);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format date for input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`
    };
  };

  // Initialize with current date + 1 hour
  React.useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const formatted = formatDateForInput(now);
    setScheduledDate(formatted.date);
    setScheduledTime(formatted.time);
  }, []);

  const handlePostNow = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/posts/publish', {
        contentId: post.id,
        content: editedContent,
        mediaUrls: uploadedImages
      });
      
      toast.success('Post published successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to publish post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedulePost = async () => {
    try {
      setIsLoading(true);
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      const response = await apiClient.post('/posts/schedule', {
        contentId: post.id,
        scheduledFor: scheduledDateTime.toISOString(),
        content: editedContent,
        mediaUrls: uploadedImages
      });
      
      toast.success('Post scheduled successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to schedule post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      setIsLoading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await apiClient.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        return response.data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
      toast.success(`${files.length} image(s) uploaded successfully!`);
    } catch (error: any) {
      toast.error('Failed to upload images');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const insertFormatting = (type: string) => {
    // Simple text formatting - you can enhance this
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editedContent.substring(start, end);
    
    let formattedText = selectedText;
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
    }
    
    const newContent = editedContent.substring(0, start) + formattedText + editedContent.substring(end);
    setEditedContent(newContent);
  };

  const LinkedInPreview = () => (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-start space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-sm">{user?.user_metadata?.full_name || user?.email}</h4>
            <Badge variant="secondary" className="text-xs">You</Badge>
          </div>
          <p className="text-xs text-gray-500">Just now</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <p className="text-sm whitespace-pre-wrap">{editedContent}</p>
        
        {/* Show original media */}
        {post.visual_url && (
          <div className="rounded-lg overflow-hidden">
            <div className="relative w-full aspect-[16/9] bg-muted">
              <Image
                src={post.visual_url}
                alt="Post media"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 700px"
                unoptimized
              />
            </div>
          </div>
        )}
        
        {/* Show uploaded images */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden">
                <div className="relative w-full h-32">
                  <Image
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 300px"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.map((tag, index) => (
              <span key={index} className="text-blue-600 text-sm">#{tag}</span>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t text-gray-500">
        <div className="flex space-x-4 text-sm">
          <span>👍 Like</span>
          <span>💬 Comment</span>
          <span>🔄 Repost</span>
          <span>📤 Send</span>
        </div>
      </div>
    </div>
  );

  const SchedulingPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Schedule Your Post</h3>
        
        {/* Date and Time Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-medium mb-2">Post Content</label>
        <div className="border rounded-lg">
          {/* Formatting Toolbar */}
          <div className="flex items-center space-x-2 p-2 border-b bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('bold')}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('italic')}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('underline')}
              className="h-8 w-8 p-0"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 p-0"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Hash className="h-4 w-4" />
            </Button>
          </div>
          
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="What do you want to talk about?"
            className="border-0 resize-none focus:ring-0 min-h-[120px]"
          />
        </div>
      </div>

      {/* Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Uploaded Images</label>
          <div className="grid grid-cols-3 gap-2">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full h-20">
                  <Image
                    src={url}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 33vw, 180px"
                    unoptimized
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button
          onClick={handleSchedulePost}
          disabled={isLoading}
          className="flex-1"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {isLoading ? 'Scheduling...' : 'Schedule Post'}
        </Button>
        <Button
          variant="outline"
          onClick={handlePostNow}
          disabled={isLoading}
        >
          <Send className="h-4 w-4 mr-2" />
          Post Now
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-hidden p-0 ${
        isExpanded ? 'w-[95vw]' : 'w-full'
      } ${
        // Mobile responsiveness
        'sm:max-w-4xl max-w-[95vw]'
      }`}>
        <div className="flex h-full">
          {/* Left Panel - LinkedIn Preview */}
          <div className={`${
            isExpanded 
              ? 'hidden sm:block sm:w-1/2' 
              : 'w-full'
          } p-6 border-r`}>
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center justify-between">
                <span>LinkedIn Preview</span>
                <div className="flex items-center space-x-2">
                  {!isExpanded && (
                    <div className="relative group">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMode('schedule');
                          setIsExpanded(true);
                        }}
                        className="relative"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      {/* Hover tooltip for Post Now */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handlePostNow}
                        disabled={isLoading}
                        className="absolute -top-12 left-0 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:-translate-y-1"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Post Now
                      </Button>
                    </div>
                  )}
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <LinkedInPreview />
            </div>
          </div>

          {/* Right Panel - Scheduling (Mobile: Full Width) */}
          {isExpanded && (
            <div className={`${
              'w-full sm:w-1/2'
            } p-6 overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="sm:hidden"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="hidden sm:flex"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <SchedulingPanel />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}