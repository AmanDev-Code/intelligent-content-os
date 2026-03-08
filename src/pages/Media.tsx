import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  Trash2,
  MoreHorizontal,
  Calendar,
  Eye,
  Copy,
  Share2,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

const mediaTypes = [
  { id: 'all', label: 'All', icon: Grid3X3 },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'carousels', label: 'Carousels', icon: Layers },
  { id: 'videos', label: 'Videos', icon: Video },
];

const viewModes = [
  { id: 'grid', label: 'Grid', icon: Grid3X3 },
  { id: 'list', label: 'List', icon: List },
];

const mockMedia = [
  {
    id: 1,
    name: "AI Revolution Infographic",
    type: "image",
    format: "PNG",
    size: "2.4 MB",
    dimensions: "1080x1080",
    createdAt: "2026-03-06",
    usedIn: 3,
    url: "/api/placeholder/400/400",
    tags: ["AI", "Technology", "Infographic"]
  },
  {
    id: 2,
    name: "Startup Growth Carousel",
    type: "carousel",
    format: "Multi-slide",
    size: "5.2 MB",
    dimensions: "1080x1080",
    createdAt: "2026-03-05",
    usedIn: 1,
    url: "/api/placeholder/400/400",
    tags: ["Startup", "Growth", "Business"]
  },
  {
    id: 3,
    name: "Remote Work Tips",
    type: "image",
    format: "JPG",
    size: "1.8 MB",
    dimensions: "1200x630",
    createdAt: "2026-03-04",
    usedIn: 2,
    url: "/api/placeholder/400/400",
    tags: ["Remote Work", "Productivity", "Tips"]
  },
  {
    id: 4,
    name: "Tech Trends 2026",
    type: "carousel",
    format: "Multi-slide",
    size: "4.8 MB",
    dimensions: "1080x1080",
    createdAt: "2026-03-03",
    usedIn: 5,
    url: "/api/placeholder/400/400",
    tags: ["Technology", "Trends", "2026"]
  },
  {
    id: 5,
    name: "LinkedIn Algorithm Guide",
    type: "image",
    format: "PNG",
    size: "3.1 MB",
    dimensions: "1080x1350",
    createdAt: "2026-03-02",
    usedIn: 4,
    url: "/api/placeholder/400/400",
    tags: ["LinkedIn", "Algorithm", "Social Media"]
  },
  {
    id: 6,
    name: "Funding Strategies",
    type: "image",
    format: "JPG",
    size: "2.2 MB",
    dimensions: "1080x1080",
    createdAt: "2026-03-01",
    usedIn: 1,
    url: "/api/placeholder/400/400",
    tags: ["Funding", "Startup", "Investment"]
  }
];

export default function Media() {
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMedia = mockMedia.filter(item => {
    const matchesType = selectedType === 'all' || 
      (selectedType === 'images' && item.type === 'image') ||
      (selectedType === 'carousels' && item.type === 'carousel') ||
      (selectedType === 'videos' && item.type === 'video');
    
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'carousel': return Layers;
      case 'video': return Video;
      default: return FileText;
    }
  };

  const getTotalSize = () => {
    const totalBytes = mockMedia.reduce((acc, item) => {
      const size = parseFloat(item.size.replace(' MB', ''));
      return acc + size;
    }, 0);
    return `${totalBytes.toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground">Manage your images, carousels, and visual content</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Upload Media</span>
          </Button>
          <Button className="bg-primary text-primary-foreground">
            <ImageIcon className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Generate Image</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMedia.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all formats
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalSize()}</div>
            <p className="text-xs text-muted-foreground">
              of 1GB available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockMedia.filter(m => m.type === 'image').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Single images
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carousels</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockMedia.filter(m => m.type === 'carousel').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Multi-slide posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            {mediaTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  selectedType === type.id && "gradient-primary"
                )}
              >
                <type.icon className="h-4 w-4 mr-2" />
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            {viewModes.map((mode) => (
              <Button
                key={mode.id}
                variant={viewMode === mode.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode.id)}
              >
                <mode.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <TypeIcon className="h-12 w-12 text-primary/60" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.type === 'carousel' ? 'Carousel' : item.format}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">{item.name}</h3>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{item.dimensions}</span>
                      <span>{item.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span>Used in {item.usedIn} posts</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredMedia.map((item, index) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <div key={item.id} className={cn(
                    "flex items-center justify-between p-4 hover:bg-muted/50 transition-colors",
                    index !== filteredMedia.length - 1 && "border-b"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <TypeIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{item.format}</span>
                          <span>•</span>
                          <span>{item.dimensions}</span>
                          <span>•</span>
                          <span>{item.size}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Used in {item.usedIn} posts
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredMedia.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No media found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery 
                ? "No media matches your search criteria" 
                : "Start by uploading your first image or generating AI visuals"}
            </p>
            <Button className="gradient-primary">
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}