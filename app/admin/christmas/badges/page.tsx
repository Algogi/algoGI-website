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
import { Loader2, Search, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { BadgeInfo } from '@/lib/christmas/admin-types';
import { formatTimestamp } from '@/lib/christmas/admin-utils';

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBadges();
  }, [search]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) {
        // If search looks like a token, search by token, otherwise search by email/prize
        if (search.length > 20) {
          params.append('token', search);
        } else {
          params.append('search', search);
        }
      }

      const response = await fetch(`/api/admin/christmas/badges?${params}`);
      if (!response.ok) throw new Error('Failed to fetch badges');
      const data = await response.json();
      setBadges(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load badges');
      console.error('Error fetching badges:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && badges.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Badge Management</h1>
        <p className="text-gray-400">View and manage badge tokens for sharing</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by token, email, or prize..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
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

      {/* Badges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Badges ({badges.length})</CardTitle>
          <CardDescription>
            All generated badge tokens and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No badges found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Prize</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {badges.map((badge) => (
                    <TableRow key={badge.token}>
                      <TableCell className="font-mono text-xs">
                        {badge.token.substring(0, 20)}...
                      </TableCell>
                      <TableCell className="font-medium">{badge.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{badge.prizeName}</Badge>
                      </TableCell>
                      <TableCell>{formatTimestamp(badge.createdAt)}</TableCell>
                      <TableCell>
                        {badge.expiresAt ? formatTimestamp(badge.expiresAt) : 'Never'}
                      </TableCell>
                      <TableCell>
                        {badge.isValid ? (
                          <Badge variant="outline" className="bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/20 text-red-400">
                            <XCircle className="w-3 h-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={badge.badgeUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


