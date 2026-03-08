import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Upload, Search, Grid3X3, List,
  Image as ImageIcon, Video, FileText,
  Download, MoreHorizontal, Eye, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

const mediaTypes = [
  { id: 'all', label: 'All', icon: Grid3X3 },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'carousels', label: 'Carousels', icon: Layers },
  { id: 'videos', label: 'Videos', icon: Video },
];

const mockMedia = [
  { id: 1, name: "AI Revolution Infographic", type: "image", format: "PNG", size: "2.4 MB", dimensions: "1080×1080", createdAt: "2026-03-06", usedIn: 3, tags: ["AI", "Technology", "Infographic"] },
  { id: 2, name: "Startup Growth Carousel", type: "carousel", format: "Multi-slide", size: "5.2 MB", dimensions: "1080×1080", createdAt: "2026-03-05", usedIn: 1, tags: ["Startup", "Growth", "Business"] },
  { id: 3, name: "Remote Work Tips", type: "image", format: "JPG", size: "1.8 MB", dimensions: "1200×630", createdAt: "2026-03-04", usedIn: 2, tags: ["Remote Work", "Productivity"] },
  { id: 4, name: "Tech Trends 2026", type: "carousel", format: "Multi-slide", size: "4.8 MB", dimensions: "1080×1080", createdAt: "2026-03-03", usedIn: 5, tags: ["Technology", "Trends"] },
  { id: 5, name: "LinkedIn Algorithm Guide", type: "image", format: "PNG", size: "3.1 MB", dimensions: "1080×1350", createdAt: "2026-03-02", usedIn: 4, tags: ["LinkedIn", "Algorithm"] },
  { id: 6, name: "Funding Strategies", type: "image", format: "JPG", size: "2.2 MB", dimensions: "1080×1080", createdAt: "2026-03-01", usedIn: 1, tags: ["Funding", "Startup"] },
];

export default function Media() {
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMedia = mockMedia.filter(item => {
    const matchesType = selectedType === 'all' || (selectedType === 'images' && item.type === 'image') || (selectedType === 'carousels' && item.type === 'carousel') || (selectedType === 'videos' && item.type === 'video');
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
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

  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground">Manage your images, carousels, and visual content</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Upload</span>
          </Button>
          <Button className="bg-primary text-primary-foreground" size="sm">
            <ImageIcon className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Generate</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Total Files", value: mockMedia.length, sub: "Across all formats", icon: FileText },
          { title: "Storage Used", value: "19.5 MB", sub: "of 1GB available", icon: Upload },
          { title: "Images", value: mockMedia.filter(m => m.type === 'image').length, sub: "Single images", icon: ImageIcon },
          { title: "Carousels", value: mockMedia.filter(m => m.type === 'carousel').length, sub: "Multi-slide posts", icon: Layers },
        ].map((s) => (
          <Card key={s.title}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{s.title}</p>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {mediaTypes.map((type) => (
            <Button key={type.id} variant={selectedType === type.id ? "default" : "outline"} size="sm" onClick={() => setSelectedType(type.id)} className="text-xs shrink-0 h-8">
              <type.icon className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">{type.label}</span>
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search media..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-full sm:w-48" />
          </div>
          <div className="flex items-center gap-0.5 border rounded-lg p-0.5">
            <Button variant={viewMode === 'grid' ? "default" : "ghost"} size="sm" onClick={() => setViewMode('grid')} className="h-7 w-7 p-0">
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
            <Button variant={viewMode === 'list' ? "default" : "ghost"} size="sm" onClick={() => setViewMode('list')} className="h-7 w-7 p-0">
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredMedia.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <Card key={item.id} className="group">
                <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <TypeIcon className="h-8 w-8 sm:h-12 sm:w-12 text-primary/60" />
                  </div>
                  <Badge variant="secondary" className="absolute top-2 left-2 text-[10px]">
                    {item.type === 'carousel' ? 'Carousel' : item.format}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-xs sm:text-sm mb-1.5 truncate">{item.name}</h3>
                  <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                    <span>{item.dimensions}</span>
                    <span>{item.size}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px] sm:text-xs">
                      <Eye className="h-3 w-3 mr-0.5" /> View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px] sm:text-xs">
                      <Download className="h-3 w-3 mr-0.5" /> Download
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
            {filteredMedia.map((item, index) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <div key={item.id} className={cn("p-3 sm:p-4", index !== filteredMedia.length - 1 && "border-b")}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        <span>{item.format}</span>
                        <span>•</span>
                        <span>{item.dimensions}</span>
                        <span>•</span>
                        <span>{item.size}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="secondary" className="text-[10px] hidden sm:flex">{item.usedIn} posts</Badge>
                      <Button variant="outline" size="sm" className="h-7 text-xs hidden sm:flex">
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs hidden sm:flex">
                        <Download className="h-3 w-3 mr-1" /> Download
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {filteredMedia.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-medium mb-1">No media found</h3>
            <p className="text-sm text-muted-foreground text-center mb-3">
              {searchQuery ? "No media matches your search" : "Upload or generate your first media"}
            </p>
            <Button className="bg-primary text-primary-foreground" size="sm">
              <Upload className="h-4 w-4 mr-2" /> Upload Media
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
