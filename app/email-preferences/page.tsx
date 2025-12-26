'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface EmailPreferences {
  newsletter: boolean;
  marketing: boolean;
  updates: boolean;
  lastUpdated: string;
}

export default function EmailPreferencesPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [preferences, setPreferences] = useState<EmailPreferences>({
    newsletter: true,
    marketing: true,
    updates: true,
    lastUpdated: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'Invalid link. Please use the unsubscribe link from your email.' });
      setLoading(false);
      return;
    }

    // Fetch current preferences
    fetch(`/api/email-preferences?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage({ type: 'error', text: data.error });
        } else {
          setEmail(data.email);
          setStatus(data.status);
          if (data.preferences) {
            setPreferences(data.preferences);
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching preferences:', error);
        setMessage({ type: 'error', text: 'Failed to load preferences. Please try again.' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handlePreferenceChange = (key: keyof EmailPreferences, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!token) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/email-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          preferences,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessage({ type: 'error', text: data.error });
      } else {
        setStatus(data.status);
        setPreferences(data.preferences);
        setMessage({
          type: 'success',
          text: 'Your email preferences have been updated successfully.',
        });
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!token) return;

    if (!confirm('Are you sure you want to unsubscribe from all emails? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/email-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          unsubscribeAll: true,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessage({ type: 'error', text: data.error });
      } else {
        setStatus('unsubscribed');
        setPreferences({
          newsletter: false,
          marketing: false,
          updates: false,
          lastUpdated: new Date().toISOString(),
        });
        setMessage({
          type: 'success',
          text: 'You have been unsubscribed from all emails.',
        });
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setMessage({ type: 'error', text: 'Failed to unsubscribe. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600 dark:text-gray-400">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (!token || message?.type === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Invalid Link
            </CardTitle>
            <CardDescription>
              {message?.text || 'Please use the unsubscribe link from your email.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isUnsubscribed = status === 'unsubscribed';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>
            Manage your email preferences for {email}
            {isUnsubscribed && (
              <span className="block mt-2 text-destructive font-medium">
                You are currently unsubscribed from all emails.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <div
              className={`p-4 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <p>{message.text}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="newsletter"
                checked={preferences.newsletter}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('newsletter', checked === true)
                }
                disabled={isUnsubscribed || saving}
              />
              <Label htmlFor="newsletter" className="flex-1 cursor-pointer">
                <div className="font-medium">Newsletters</div>
                <div className="text-sm text-muted-foreground">
                  Receive our regular newsletters with updates and insights
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('marketing', checked === true)
                }
                disabled={isUnsubscribed || saving}
              />
              <Label htmlFor="marketing" className="flex-1 cursor-pointer">
                <div className="font-medium">Marketing Emails</div>
                <div className="text-sm text-muted-foreground">
                  Receive promotional emails about our products and services
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="updates"
                checked={preferences.updates}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('updates', checked === true)
                }
                disabled={isUnsubscribed || saving}
              />
              <Label htmlFor="updates" className="flex-1 cursor-pointer">
                <div className="font-medium">Product Updates</div>
                <div className="text-sm text-muted-foreground">
                  Receive important updates about our products and services
                </div>
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSave}
            disabled={saving || isUnsubscribed}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
          <Button
            onClick={handleUnsubscribeAll}
            variant="destructive"
            disabled={saving || isUnsubscribed}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Unsubscribe from All'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

