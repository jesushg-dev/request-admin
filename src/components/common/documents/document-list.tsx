'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Download, Eye, FileText, LinkIcon, MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { Document } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DocumentList() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Mock data for demonstration
  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'Annual Report 2023',
      description: 'Financial report for the fiscal year 2023',
      file: 'annual-report-2023.pdf',
      status: 2,
      expirationDate: new Date('2024-12-31'),
      type: 'pdf',
      contentType: 'application/pdf',
      storageType: 'VERCEL_BLOB',
      numPages: 42,
      assistantEnabled: true,
      advancedExcelEnabled: false,
      downloadOnly: false,
      createdAt: new Date('2023-01-15'),
    },
    {
      id: '2',
      name: 'Marketing Strategy',
      description: 'Q2 2023 Marketing Strategy and Plan',
      file: 'marketing-strategy-q2.pptx',
      status: 2,
      type: 'pptx',
      contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      storageType: 'VERCEL_BLOB',
      numPages: 24,
      assistantEnabled: true,
      advancedExcelEnabled: false,
      downloadOnly: false,
      createdAt: new Date('2023-03-22'),
    },
    {
      id: '3',
      name: 'Budget Forecast',
      description: 'Budget forecast for next fiscal year',
      file: 'budget-forecast.xlsx',
      status: 1,
      type: 'xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      storageType: 'VERCEL_BLOB',
      numPages: 5,
      assistantEnabled: false,
      advancedExcelEnabled: true,
      downloadOnly: false,
      createdAt: new Date('2023-05-10'),
    },
    {
      id: '4',
      name: 'Product Roadmap',
      description: '2023-2024 Product Development Plan',
      file: 'product-roadmap.pdf',
      status: 2,
      type: 'pdf',
      contentType: 'application/pdf',
      storageType: 'VERCEL_BLOB',
      numPages: 18,
      assistantEnabled: true,
      advancedExcelEnabled: false,
      downloadOnly: false,
      createdAt: new Date('2023-04-05'),
    },
    {
      id: '5',
      name: 'Legal Agreement',
      description: 'Partnership agreement with Acme Inc.',
      file: 'legal-agreement.docx',
      status: 3,
      type: 'docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      storageType: 'VERCEL_BLOB',
      numPages: 12,
      assistantEnabled: false,
      advancedExcelEnabled: false,
      downloadOnly: true,
      createdAt: new Date('2023-02-20'),
    },
    {
      id: '6',
      name: 'Employee Handbook',
      description: 'Updated company policies and procedures',
      file: 'employee-handbook.pdf',
      status: 2,
      type: 'pdf',
      contentType: 'application/pdf',
      storageType: 'VERCEL_BLOB',
      numPages: 36,
      assistantEnabled: true,
      advancedExcelEnabled: false,
      downloadOnly: false,
      createdAt: new Date('2023-01-30'),
    },
  ];

  useEffect(() => {
    // Simulate API call to fetch documents
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch from your API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setDocuments(mockDocuments);
      } catch (error) {
        toast.error('Failed to fetch documents');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    // Apply search filter
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Apply status filter
    const matchesStatus = statusFilter === 'all' || doc.status === Number.parseInt(statusFilter);

    // Apply type filter
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="outline">Draft</Badge>;
      case 2:
        return <Badge variant="success">Published</Badge>;
      case 3:
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-10 w-10 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="h-10 w-10 text-green-500" />;
      case 'pptx':
      case 'ppt':
        return <FileText className="h-10 w-10 text-orange-500" />;
      default:
        return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  const handleDelete = (id: string) => {
    // In a real application, you would call your API to delete the document
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast.success('Document deleted successfully');
  };

  const handleCreateLink = (id: string) => {
    // In a real application, you would call your API to create a shareable link
    toast.success('Shareable link has been copied to clipboard');
  };

  const handleViewDocument = (id: string) => {
    router.push(`/documents/${id}`);
  };

  const types = [...new Set(documents.map((doc) => doc.type))].filter(Boolean) as string[];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex-1">
                <Input placeholder="Search documents..." disabled className="w-full md:max-w-sm" />
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <Select disabled>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                </Select>
                <Select disabled>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                </Select>
                <Button disabled>Upload Document</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 animate-pulse rounded bg-muted"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                          <div className="h-3 w-48 animate-pulse rounded bg-muted"></div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="space-y-2">
                        <div className="h-3 w-full animate-pulse rounded bg-muted"></div>
                        <div className="h-3 w-full animate-pulse rounded bg-muted"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
                        <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex-1">
              <Input placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:max-w-sm" />
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="1">Draft</SelectItem>
                  <SelectItem value="2">Published</SelectItem>
                  <SelectItem value="3">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button asChild>
                <Link href="/documents/upload">Upload Document</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <CardDescription>{searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? 'No documents match your search criteria' : 'No documents found'}</CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {getFileIcon(doc.type || '')}
                        <div>
                          <CardTitle className="text-lg">{doc.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{doc.description || 'No description'}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDocument(doc.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCreateLink(doc.id)}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Create Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium uppercase">{doc.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">{format(doc.createdAt, 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{getStatusBadge(doc.status)}</span>
                      </div>
                      {doc.expirationDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Expires:</span>
                          <span className="font-medium">{format(doc.expirationDate, 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pages:</span>
                        <span className="font-medium">{doc.numPages || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDocument(doc.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
