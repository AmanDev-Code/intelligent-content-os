import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  Plus,
  Filter,
  Search,
  Wand2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
    if (user) {
      fetchPosts();
    }
  }, [user, currentDate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      // Transform data to match our calendar component expectations
      const transformedPosts = (data || []).map(post => ({
        id: post.id,
        title: post.title || 'Untitled Post',
        content: post.content || '',
        scheduledFor: post.created_at, // Using created_at as scheduled time for now
        status: 'published', // All fetched posts are considered published
        platforms: ['LinkedIn'], // Default platform
        type: 'text'
      }));

      setPosts(transformedPosts);
      setFilteredPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = posts;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(post => post.status === filterStatus);
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, filterStatus]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (status: string) => {
    setFilterStatus(status);
  };

  const handleCreatePost = (date?: Date) => {
    // Navigate to agent page for content creation
    navigate('/agent');
  };

  return (
    <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Your content strategy overview
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => handleFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
            <Button 
              className="bg-primary text-primary-foreground gap-2"
              onClick={() => handleCreatePost()}
            >
              <Wand2 className="h-4 w-4" />
              Create Post
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Social Channels */}
      <SocialChannels />

      {/* Calendar Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Content Calendar</h2>
            <p className="text-sm text-muted-foreground">Plan and schedule your content</p>
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