import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock,
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  Calendar,
  FileText,
  ImageIcon,
  Layers,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService, type GeneratedContent, type PaginatedResponse } from '@/services/dataService';
import { toast } from 'sonner';

const statusColors = {
  ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  published: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  scheduled: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const contentTypeIcons = {
  text: FileText,
  image: ImageIcon,
  carousel: Layers,
  video: FileText,
};

export default function Generations() {
  const { user } = useAuth();
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse<GeneratedContent>['pagination']>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
    hasPrev: false,
  });
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);

  const fetchContent = useCallback(async (page: number = 1, search: string = '', status: string = 'all') => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await dataService.getPaginatedContent(user.id, page, 20);
      
      // Apply client-side filtering for now (can be moved to backend later)
      let filteredData = response.data;
      
      if (search.trim()) {
        filteredData = filteredData.filter(item => 
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.content.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (status !== 'all') {
        filteredData = filteredData.filter(item => item.status === status);
      }
      
      setContent(filteredData);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchContent(currentPage, searchTerm, statusFilter);
  }, [fetchContent, currentPage, searchTerm, statusFilter]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getContentTypeIcon = (visualType: string | null) => {
    const type = visualType || 'text';
    const IconComponent = contentTypeIcons[type as keyof typeof contentTypeIcons] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="w-10 h-10"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {Math.min((currentPage - 1) * pagination.limit + 1, pagination.total)} to{' '}
            {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} results
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="w-10 h-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {pages}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasMore}
            className="w-10 h-10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">All Generations</h1>
            <p className="text-muted-foreground">
              Manage and view all your AI-generated content
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : content.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No content found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start generating content to see it here'
              }
            </p>
            {searchTerm || statusFilter !== 'all' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => window.location.href = '/agent'}>
                Generate Content
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card 
                key={item.id} 
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedContent(item);
                  setShowContentModal(true);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getContentTypeIcon(item.visual_type)}
                      <Badge 
                        variant="secondary"
                        className={statusColors[item.status as keyof typeof statusColors] || statusColors.draft}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    {item.ai_score && (
                      <Badge variant="outline" className="text-xs">
                        {item.ai_score}/100
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {item.content}
                  </p>

                  {item.hashtags && item.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.hashtags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.hashtags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.hashtags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.created_at)}
                    </div>
                    <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-3 w-3" />
                      View
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && renderPagination()}
        </>
      )}

      {/* Content Modal */}
      {showContentModal && selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl line-clamp-2">
                {selectedContent.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContentModal(false)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="secondary"
                    className={statusColors[selectedContent.status as keyof typeof statusColors] || statusColors.draft}
                  >
                    {selectedContent.status}
                  </Badge>
                  {selectedContent.ai_score && (
                    <Badge variant="outline">
                      AI Score: {selectedContent.ai_score}/100
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {formatDate(selectedContent.created_at)}
                  </Badge>
                </div>

                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap">{selectedContent.content}</p>
                </div>

                {selectedContent.hashtags && selectedContent.hashtags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedContent.hashtags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedContent.ai_reasoning && (
                  <div>
                    <h4 className="font-medium mb-2">AI Reasoning</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedContent.ai_reasoning}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}