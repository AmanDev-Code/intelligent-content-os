import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Download, Eye, Search, Filter, Upload, Image, FileText, Grid, List } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  file_name: string;
  file_type: 'image' | 'pdf' | 'carousel';
  file_size: number;
  public_url: string;
  created_at: string;
  content_id?: string;
}

interface MediaUsage {
  totalFiles: number;
  totalSizeMB: number;
  byType: Record<string, number>;
}

export default function Media() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [usage, setUsage] = useState<MediaUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMediaFiles();
    fetchUsage();
  }, [page, typeFilter]);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }

      const response = await apiClient.get(`/media/files?${params}`);
      
      if (response.success) {
        setMediaFiles(response.files);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch media files:', error);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await apiClient.get('/media/usage');
      if (response.success) {
        setUsage(response.usage);
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await apiClient.delete(`/media/files/${fileId}`);
      toast.success('File deleted successfully');
      fetchMediaFiles();
      fetchUsage();
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  const downloadFile = (file: MediaFile) => {
    const link = document.createElement('a');
    link.href = file.public_url;
    link.download = file.file_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getFileTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pdf':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredFiles = mediaFiles.filter(file =>
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && mediaFiles.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Manage your generated images, carousels, and documents
          </p>
        </div>
      </div>

      {/* Usage Stats */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-tour="tour-media-library">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                  <p className="text-2xl font-bold">{usage.totalFiles}</p>
                </div>
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold">{usage.totalSizeMB} MB</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Images</p>
                  <p className="text-2xl font-bold">{usage.byType.image || 0}</p>
                </div>
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold">{usage.byType.pdf || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card data-tour="tour-media-library">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="pdf">Documents</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Files */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media files found</h3>
            <p className="text-muted-foreground">
              {searchTerm || typeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Generate some content to see your media files here'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                      {file.file_type === 'image' ? (
                        <div className="relative w-full h-full">
                          <NextImage
                            src={file.public_url}
                            alt={file.file_name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={cn('text-xs', getFileTypeBadgeColor(file.file_type))}>
                          {getFileTypeIcon(file.file_type)}
                          <span className="ml-1 capitalize">{file.file_type}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size)}
                        </span>
                      </div>

                      <h4 className="font-medium text-sm truncate" title={file.file_name}>
                        {file.file_name}
                      </h4>

                      <p className="text-xs text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setSelectedFile(file)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{selectedFile?.file_name}</DialogTitle>
                            </DialogHeader>
                            {selectedFile && (
                              <div className="space-y-4">
                                {selectedFile.file_type === 'image' ? (
                                  <div className="relative w-full max-h-96 h-96">
                                    <NextImage
                                      src={selectedFile.public_url}
                                      alt={selectedFile.file_name}
                                      fill
                                      className="object-contain rounded-lg"
                                      sizes="(max-width: 1024px) 90vw, 900px"
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <div className="text-center p-8">
                                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                      Document preview not available
                                    </p>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button onClick={() => downloadFile(selectedFile)} className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => deleteFile(selectedFile.id)}
                                    className="flex-1"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile(file)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {filteredFiles.map((file, index) => (
                    <div
                      key={file.id}
                      className={cn(
                        'flex items-center justify-between p-4 hover:bg-muted/50',
                        index !== filteredFiles.length - 1 && 'border-b'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {file.file_type === 'image' ? (
                          <div className="relative w-10 h-10 overflow-hidden rounded">
                            <NextImage
                              src={file.public_url}
                              alt={file.file_name}
                              fill
                              className="object-cover"
                              sizes="40px"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium">{file.file_name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge className={cn('text-xs', getFileTypeBadgeColor(file.file_type))}>
                              {getFileTypeIcon(file.file_type)}
                              <span className="ml-1 capitalize">{file.file_type}</span>
                            </Badge>
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>{new Date(file.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedFile(file)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadFile(file)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}