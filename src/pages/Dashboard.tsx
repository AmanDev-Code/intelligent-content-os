import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  Wand2,
  Search,
  CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/lib/apiClient";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SocialChannels } from "@/components/dashboard/SocialChannels";
import { CalendarView } from "@/components/calendar/CalendarView";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user) fetchPosts();
  }, [user, currentDate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Use the new calendar API
      const response = await apiClient.get('/posts/calendar', {
        params: {
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString()
        }
      });

      if (response.data && response.data.posts) {
        const transformedPosts = response.data.posts.map((post: any) => ({
          id: post.id,
          title: post.title || 'Untitled Post',
          content: post.content || '',
          scheduledFor: post.created_at || post.scheduled_for,
          status: post.publish_status === 'published' ? 'published' : post.is_scheduled ? 'scheduled' : 'draft',
          platforms: ['LinkedIn'],
          type: post.visual_type || 'text'
        }));

        setPosts(transformedPosts);
        setFilteredPosts(transformedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to direct Supabase query if API fails
      try {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const { data, error: supabaseError } = await supabase
          .from('generated_content')
          .select('*')
          .eq('user_id', user?.id)
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString())
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (!supabaseError && data) {
          const transformedPosts = data.map((post: any) => ({
            id: post.id,
            title: post.title || 'Untitled Post',
            content: post.content || '',
            scheduledFor: post.created_at,
            status: post.publish_status === 'published' ? 'published' : post.is_scheduled ? 'scheduled' : 'draft',
            platforms: ['LinkedIn'],
            type: post.visual_type || 'text'
          }));

          setPosts(transformedPosts);
          setFilteredPosts(transformedPosts);
        }
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = posts;
    if (searchQuery.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(post => post.status === filterStatus);
    }
    setFilteredPosts(filtered);
  }, [posts, searchQuery, filterStatus]);

  const handleCreatePost = (date?: Date) => navigate('/agent');

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl shrink-0">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-tight">Your content strategy overview</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-input rounded-md bg-background text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full h-8"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none px-2 pr-6 py-1.5 border border-input rounded-md bg-background text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring h-8 shrink-0 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_6px_center] bg-no-repeat"
          >
            <option value="all">All Posts</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
          </select>
          <Button className="bg-primary text-primary-foreground shrink-0 h-8 text-xs sm:text-sm" size="sm" onClick={() => handleCreatePost()}>
            <Wand2 className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Create Post</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <StatsCards />

      {/* Social Channels */}
      <SocialChannels />

      {/* Content Calendar */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Content Calendar</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Plan and schedule your content</p>
          </div>
        </div>
        <CalendarView
          currentView={currentView}
          onViewChange={setCurrentView}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          posts={filteredPosts}
          onCreatePost={handleCreatePost}
        />
      </div>
    </div>
  );
}
