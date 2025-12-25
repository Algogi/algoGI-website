"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChristmasSubmission, PaginatedResponse } from '@/lib/christmas/admin-types';
import { formatTimestamp, exportSubmissionsToCSV, downloadCSV } from '@/lib/christmas/admin-utils';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<ChristmasSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchSubmissions();
  }, [page, search, sortBy, sortOrder]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '50',
        sortBy,
        sortOrder,
      });
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/christmas/submissions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data: PaginatedResponse<ChristmasSubmission> = await response.json();
      
      setSubmissions(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load submissions');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleExport = async () => {
    try {
      // Fetch all submissions for export
      const response = await fetch('/api/admin/christmas/submissions?pageSize=10000');
      if (!response.ok) throw new Error('Failed to fetch submissions for export');
      const data: PaginatedResponse<ChristmasSubmission> = await response.json();
      
      const csv = exportSubmissionsToCSV(data.data);
      downloadCSV(csv, `christmas-submissions-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err: any) {
      console.error('Error exporting submissions:', err);
      alert('Failed to export submissions. Please try again.');
    }
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Form Submissions</h1>
          <p className="text-gray-400">Manage all questionnaire submissions from the Christmas campaign</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-400">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Questions Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Question Reference</CardTitle>
          <CardDescription>What each question represents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold">Q1: Which AI tool do you currently use most often?</div>
              <div className="text-xs text-muted-foreground">Options: ChatGPT, Claude, Perplexity, Gemini, Not actively using AI yet</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold">Q2: AI is currently:</div>
              <div className="text-xs text-muted-foreground">Options: Improving productivity and outcomes, Creating mixed or unclear results, Not delivering value yet</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold">Q3: Team size:</div>
              <div className="text-xs text-muted-foreground">Options: 1–2, 3–10, 11–50, 50+</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold">Q4: How much work could be automated?</div>
              <div className="text-xs text-muted-foreground">Options: 0–20%, 20–50%, 50%+, We don&apos;t plan to replace people with AI</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold">Q5: Would you like a free AI Tools Analysis?</div>
              <div className="text-xs text-muted-foreground">Options: Yes, No</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions ({total})</CardTitle>
          <CardDescription>
            Showing {submissions.length} of {total} submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No submissions found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-800"
                      onClick={() => handleSort('firstName')}
                    >
                      Name {sortBy === 'firstName' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-800"
                      onClick={() => handleSort('email')}
                    >
                      Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-800"
                      onClick={() => handleSort('company')}
                    >
                      Company {sortBy === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-800"
                      onClick={() => handleSort('submittedAt')}
                    >
                      Submitted {sortBy === 'submittedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Answers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.firstName} {submission.lastName}
                      </TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.company}</TableCell>
                      <TableCell>{submission.phone || 'N/A'}</TableCell>
                      <TableCell>{formatTimestamp(submission.submittedAt)}</TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-md">
                          {submission.q1 && (
                            <div className="text-xs">
                              <span className="font-semibold">Q1:</span> {submission.q1}
                            </div>
                          )}
                          {submission.q2 && (
                            <div className="text-xs">
                              <span className="font-semibold">Q2:</span> {submission.q2}
                            </div>
                          )}
                          {submission.q3 && (
                            <div className="text-xs">
                              <span className="font-semibold">Q3:</span> {submission.q3}
                            </div>
                          )}
                          {submission.q4 && (
                            <div className="text-xs">
                              <span className="font-semibold">Q4:</span> {submission.q4}
                            </div>
                          )}
                          {submission.q5 && (
                            <div className="text-xs">
                              <span className="font-semibold">Q5:</span> {submission.q5}
                            </div>
                          )}
                          {!submission.q1 && !submission.q2 && !submission.q3 && !submission.q4 && !submission.q5 && (
                            <span className="text-xs text-muted-foreground">No answers</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Details Modal could be added here */}
    </div>
  );
}

