"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Gamepad2, Gift, TrendingUp, ExternalLink, Download, BarChart3, FileText } from 'lucide-react';
import { DashboardStats, PrizeDistribution } from '@/lib/christmas/admin-types';
import { formatTimestamp, getGameDisplayName, getPrizeDisplayName } from '@/lib/christmas/admin-utils';

export default function ChristmasAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/christmas/stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
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
          <CardContent>
            <Button onClick={fetchStats}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Christmas Campaign 2025</h1>
          <p className="text-muted-foreground">Campaign dashboard and overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/christmas" target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Form submissions received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Game Plays</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGamePlays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Games completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prizes Won</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrizesWon}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total prizes awarded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Submissions → Game Plays
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prize Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Prize Distribution</CardTitle>
          <CardDescription>Breakdown of prizes won by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.prizeDistribution.map((prize) => (
              <div key={prize.prizeId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{prize.prizeName}</p>
                    <Badge variant="outline" className="text-xs">
                      {prize.prizeType}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {prize.count} won ({prize.percentage.toFixed(1)}% actual, {prize.expectedPercentage.toFixed(1)}% expected)
                  </p>
                </div>
                <div className="w-32 bg-muted-foreground/20 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(prize.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Games */}
      <Card>
        <CardHeader>
          <CardTitle>Top Games</CardTitle>
          <CardDescription>Most popular games by play count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topGames.map((game, index) => (
              <div key={game.gameName} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{game.gameDisplayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {game.playCount} plays
                      {game.averageScore !== undefined && ` • Avg score: ${game.averageScore}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Submissions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/christmas/submissions">
                  View All →
                </Link>
              </Button>
            </div>
            <CardDescription>Latest form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentSubmissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No submissions yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentSubmissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">
                      {submission.firstName} {submission.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{submission.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(submission.submittedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Game Plays</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/christmas/game-plays">
                  View All →
                </Link>
              </Button>
            </div>
            <CardDescription>Latest game completions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentGamePlays.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No game plays yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentGamePlays.slice(0, 5).map((play) => (
                  <div key={play.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{getGameDisplayName(play.gameName)}</p>
                        <p className="text-sm text-muted-foreground">{play.email}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {getPrizeDisplayName(play.prizeId)}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {play.score !== null && play.score !== undefined ? play.score : 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(play.playedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-6 justify-start" asChild>
              <Link href="/admin/christmas/submissions">
                <FileText className="h-6 w-6 mr-3 text-neon-blue" />
                <div className="text-left">
                  <p className="text-sm font-medium">View Submissions</p>
                  <p className="text-xs text-muted-foreground">Manage form responses</p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-6 justify-start" asChild>
              <Link href="/admin/christmas/game-plays">
                <Gamepad2 className="h-6 w-6 mr-3 text-neon-blue" />
                <div className="text-left">
                  <p className="text-sm font-medium">Game Plays</p>
                  <p className="text-xs text-muted-foreground">Track game completions</p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-6 justify-start" asChild>
              <Link href="/admin/christmas/analytics">
                <BarChart3 className="h-6 w-6 mr-3 text-neon-blue" />
                <div className="text-left">
                  <p className="text-sm font-medium">Analytics</p>
                  <p className="text-xs text-muted-foreground">View campaign metrics</p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-6 justify-start" asChild>
              <Link href="/admin/christmas/prizes">
                <Gift className="h-6 w-6 mr-3 text-neon-blue" />
                <div className="text-left">
                  <p className="text-sm font-medium">Prizes</p>
                  <p className="text-xs text-muted-foreground">Manage prize winners</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
