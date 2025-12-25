"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, Download, Gift, ExternalLink } from 'lucide-react';
import { PrizeStatistics } from '@/lib/christmas/admin-types';
import { formatTimestamp, getGameDisplayName, exportPrizeWinnersToCSV, downloadCSV } from '@/lib/christmas/admin-utils';

export default function PrizesPage() {
  const [statistics, setStatistics] = useState<PrizeStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrize, setExpandedPrize] = useState<string | null>(null);

  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/christmas/prizes');
      if (!response.ok) throw new Error('Failed to fetch prize statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load prize statistics');
      console.error('Error fetching prizes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const csv = exportPrizeWinnersToCSV(statistics);
      downloadCSV(csv, `christmas-prize-winners-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err: any) {
      console.error('Error exporting prize winners:', err);
      alert('Failed to export prize winners. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const grandPrizeWinners = statistics
    .find((s) => s.prizeType === 'grand')?.winners || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Prize Management</h1>
          <p className="text-muted-foreground">View prize statistics and manage winners</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Winners CSV
        </Button>
      </div>

      {/* Grand Prize Winners */}
      {grandPrizeWinners.length > 0 && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-400" />
              Grand Prize Winners
            </CardTitle>
            <CardDescription>
              {grandPrizeWinners.length} winner(s) eligible for the grand prize drawing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {grandPrizeWinners.map((winner) => (
                <div key={winner.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{winner.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Played: {getGameDisplayName(winner.gameName)} • {formatTimestamp(winner.playedAt)}
                      </p>
                    </div>
                    {winner.badgeToken && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`/christmas/badge/${winner.badgeToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prize Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>All Prizes</CardTitle>
          <CardDescription>Statistics and winner lists for each prize</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics.map((stat) => (
              <Card key={stat.prizeId} className="bg-muted">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {stat.prizeName}
                        <Badge variant="outline" className="text-xs">
                          {stat.prizeType}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {stat.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{stat.winCount}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.winPercentage.toFixed(1)}% actual vs {stat.expectedPercentage.toFixed(1)}% expected
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Probability:</span>
                      <span>{(stat.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Winners:</span>
                      <span>{stat.winners.length}</span>
                    </div>
                    {stat.winners.length > 0 && (
                      <div className="mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedPrize(expandedPrize === stat.prizeId ? null : stat.prizeId)}
                        >
                          {expandedPrize === stat.prizeId ? 'Hide' : 'Show'} Winners ({stat.winners.length})
                        </Button>
                        {expandedPrize === stat.prizeId && (
                          <div className="mt-4 space-y-2">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Game</TableHead>
                                  <TableHead>Played At</TableHead>
                                  <TableHead>Badge</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {stat.winners.map((winner) => (
                                  <TableRow key={winner.id}>
                                    <TableCell className="font-medium">{winner.email}</TableCell>
                                    <TableCell>{getGameDisplayName(winner.gameName)}</TableCell>
                                    <TableCell>{formatTimestamp(winner.playedAt)}</TableCell>
                                    <TableCell>
                                      {winner.badgeToken ? (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          asChild
                                        >
                                          <a
                                            href={`/christmas/badge/${winner.badgeToken}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <ExternalLink className="w-4 h-4" />
                                          </a>
                                        </Button>
                                      ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-1">
                                        {winner.redeemed && (
                                          <Badge variant="outline" className="text-xs bg-green-500/20">
                                            Redeemed
                                          </Badge>
                                        )}
                                        {winner.fulfilled && (
                                          <Badge variant="outline" className="text-xs bg-blue-500/20">
                                            Fulfilled
                                          </Badge>
                                        )}
                                        {!winner.redeemed && !winner.fulfilled && (
                                          <Badge variant="outline" className="text-xs">
                                            Pending
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}
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

