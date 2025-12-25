"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ChristmasAnalytics } from '@/lib/christmas/admin-types';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<ChristmasAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/christmas/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
      console.error('Error fetching analytics:', err);
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
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campaign Analytics</h1>
          <p className="text-muted-foreground">Comprehensive performance metrics and insights</p>
        </div>

      {/* Questionnaire Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Questionnaire Engagement</CardTitle>
          <CardDescription>User interaction and abandonment metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Abandonments</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{analytics.totalAbandonments}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Abandonment Rate</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{analytics.abandonmentRate.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Question Views</p>
              <p className="text-2xl font-bold">{analytics.totalQuestionViews}</p>
            </div>
          </div>
          
          {analytics.questionnaireAbandonment.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Abandonment by Step</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {analytics.questionnaireAbandonment.map((abandonment, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          Step {abandonment.step} - {abandonment.stepType === 'welcome' ? 'Welcome' : 
                            abandonment.stepType === 'question' ? `Question ${abandonment.questionId}` :
                            abandonment.stepType === 'text_field' ? `Field: ${abandonment.questionId}` :
                            'Final Step'}
                        </p>
                        {abandonment.questionId && (
                          <p className="text-xs text-muted-foreground mt-1">ID: {abandonment.questionId}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Count</p>
                        <p className="text-xl font-bold">{abandonment.count}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted-foreground/20 rounded-full h-2">
                        <div
                          className="bg-red-600 dark:bg-red-400 h-2 rounded-full"
                          style={{ width: `${abandonment.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-20 text-right">
                        {abandonment.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analytics.questionViewStats.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold text-lg">Question View Statistics</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {analytics.questionViewStats.map((stat, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          Step {stat.step} - {stat.stepType === 'welcome' ? 'Welcome' : 
                            stat.stepType === 'question' ? `Question ${stat.questionId}` :
                            stat.stepType === 'text_field' ? `Field: ${stat.questionId}` :
                            'Final Step'}
                        </p>
                        {stat.questionId && (
                          <p className="text-xs text-muted-foreground mt-1">ID: {stat.questionId}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Views</p>
                        <p className="text-xl font-bold">{stat.viewCount}</p>
                        <p className="text-xs text-muted-foreground">({stat.uniqueViews} unique)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from submission to prize win</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Submissions</p>
                <p className="text-2xl font-bold">{analytics.conversionFunnel.submissions}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Drop-off Rate</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{analytics.conversionFunnel.dropOffRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-0.5 h-8 bg-border" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Game Plays</p>
                <p className="text-2xl font-bold">{analytics.conversionFunnel.gamePlays}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.conversionFunnel.winRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-0.5 h-8 bg-border" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Prizes Won</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.conversionFunnel.prizeWins}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Overall Conversion</p>
                <p className="text-2xl font-bold text-neon-blue">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Question Analytics</CardTitle>
          <CardDescription>Response distribution for each question</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analytics.questionAnalytics.map((qa) => (
              <div key={qa.questionId} className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-3">{qa.questionText}</h3>
                <div className="space-y-2">
                  {qa.responses.map((response, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm flex-1">{response.answer}</span>
                      <div className="flex items-center gap-3 w-64">
                        <div className="flex-1 bg-muted-foreground/20 rounded-full h-2">
                          <div
                            className="bg-neon-blue h-2 rounded-full"
                            style={{ width: `${response.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-20 text-right">
                          {response.count} ({response.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Total responses: {qa.totalResponses} / {analytics.totalSubmissions}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Game Analytics</CardTitle>
          <CardDescription>Performance metrics by game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.gamePopularity.map((game) => (
              <div key={game.gameName} className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{game.gameDisplayName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {game.playCount} plays
                      {game.averageScore !== undefined && ` • Average score: ${game.averageScore}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{game.prizeWinRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time-based Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Trends</CardTitle>
            <CardDescription>Submissions and game plays over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analytics.timeBasedStats.dailySubmissions.map((day) => (
                <div key={day.date} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{day.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {day.submissions} submissions
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {day.gamePlays} plays
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hourly Distribution</CardTitle>
            <CardDescription>Peak participation times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Peak hour: {analytics.timeBasedStats.peakHour}:00
                {analytics.timeBasedStats.peakDay && ` • Peak day: ${analytics.timeBasedStats.peakDay}`}
              </p>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {analytics.timeBasedStats.hourlySubmissions.map((hour) => (
                  <div key={hour.hour} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-12">{hour.hour}:00</span>
                    <div className="flex-1 bg-muted-foreground/20 rounded-full h-4 relative">
                      <div
                        className="bg-neon-blue h-4 rounded-full"
                        style={{ width: `${(hour.submissions / Math.max(...analytics.timeBasedStats.hourlySubmissions.map(h => h.submissions))) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {hour.submissions}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

