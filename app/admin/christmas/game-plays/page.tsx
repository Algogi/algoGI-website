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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, Download, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { ChristmasGamePlay, PaginatedResponse } from '@/lib/christmas/admin-types';
import { formatTimestamp, getGameDisplayName, getPrizeDisplayName, exportGamePlaysToCSV, downloadCSV } from '@/lib/christmas/admin-utils';

export default function GamePlaysPage() {
  const [gamePlays, setGamePlays] = useState<ChristmasGamePlay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('playedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [gameFilter, setGameFilter] = useState<string>('');
  const [prizeFilter, setPrizeFilter] = useState<string>('');

  useEffect(() => {
    fetchGamePlays();
  }, [page, search, sortBy, sortOrder, gameFilter, prizeFilter]);

  const fetchGamePlays = async () => {
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
      if (gameFilter) params.append('gameName', gameFilter);
      if (prizeFilter) params.append('prizeId', prizeFilter);

      const response = await fetch(`/api/admin/christmas/game-plays?${params}`);
      if (!response.ok) throw new Error('Failed to fetch game plays');
      const data: PaginatedResponse<ChristmasGamePlay> = await response.json();
      
      setGamePlays(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load game plays');
      console.error('Error fetching game plays:', err);
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
      // Fetch all game plays for export
      const response = await fetch('/api/admin/christmas/game-plays?pageSize=10000');
      if (!response.ok) throw new Error('Failed to fetch game plays for export');
      const data: PaginatedResponse<ChristmasGamePlay> = await response.json();
      
      const csv = exportGamePlaysToCSV(data.data);
      downloadCSV(csv, `christmas-game-plays-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err: any) {
      console.error('Error exporting game plays:', err);
      alert('Failed to export game plays. Please try again.');
    }
  };

  if (loading && gamePlays.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Get unique games and prizes for filters
  const uniqueGames = Array.from(new Set(gamePlays.map((p) => p.gameName)));
  const uniquePrizes = Array.from(new Set(gamePlays.map((p) => p.prizeId)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Game Plays</h1>
          <p className="text-gray-400">Track all game completions and prizes won</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by email, game, or prize..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={gameFilter || "all"} onValueChange={(value) => { setGameFilter(value === "all" ? "" : value); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                {uniqueGames.map((game) => (
                  <SelectItem key={game} value={game}>
                    {getGameDisplayName(game)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={prizeFilter || "all"} onValueChange={(value) => { setPrizeFilter(value === "all" ? "" : value); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by prize" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prizes</SelectItem>
                {uniquePrizes.map((prize) => (
                  <SelectItem key={prize} value={prize}>
                    {getPrizeDisplayName(prize)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      {/* Game Plays Table */}
      <Card>
        <CardHeader>
          <CardTitle>Game Plays ({total})</CardTitle>
          <CardDescription>
            Showing {gamePlays.length} of {total} game plays
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gamePlays.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No game plays found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-800"
                      onClick={() => handleSort('email')}
                    >
                      Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-800"
                      onClick={() => handleSort('gameName')}
                    >
                      Game {sortBy === 'gameName' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-800"
                      onClick={() => handleSort('prizeId')}
                    >
                      Prize {sortBy === 'prizeId' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-800"
                      onClick={() => handleSort('score')}
                    >
                      Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-800"
                      onClick={() => handleSort('playedAt')}
                    >
                      Played At {sortBy === 'playedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Badge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gamePlays.map((play) => (
                    <TableRow key={play.id}>
                      <TableCell className="font-medium">{play.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getGameDisplayName(play.gameName)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-400 font-semibold">
                          {getPrizeDisplayName(play.prizeId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {play.score !== null && play.score !== undefined ? (
                          <Badge variant="outline">{play.score}</Badge>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{formatTimestamp(play.playedAt)}</TableCell>
                      <TableCell>
                        {play.badgeUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={play.badgeUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
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
    </div>
  );
}

