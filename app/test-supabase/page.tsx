'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setStatus('checking');

    try {
      // Test 1: Check environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
      }

      // Test 2: Try to get current session/user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError && userError.message !== 'Invalid Refresh Token: Refresh Token Not Found') {
        console.log('User check:', userError.message);
      }
      setUser(currentUser);

      // Test 3: Try to fetch categories (simple query)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .limit(5);

      if (categoriesError) {
        throw new Error(`Database query failed: ${categoriesError.message}`);
      }

      setCategories(categoriesData || []);
      setStatus('connected');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Unknown error occurred');
      console.error('Connection test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Supabase Connection Test</h1>

          {/* Status Indicator */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-4 h-4 rounded-full ${
                  status === 'connected'
                    ? 'bg-green-500'
                    : status === 'error'
                    ? 'bg-red-500'
                    : 'bg-yellow-500 animate-pulse'
                }`}
              />
              <span className="text-lg font-semibold">
                Status:{' '}
                {status === 'connected' && '✅ Connected'}
                {status === 'error' && '❌ Error'}
                {status === 'checking' && '⏳ Checking...'}
              </span>
            </div>
          </div>

          {/* Environment Variables Check */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h2 className="font-semibold text-gray-900 mb-2">Environment Variables</h2>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">URL:</span>{' '}
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                  <span className="text-green-600">
                    ✅ Set ({process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...)
                  </span>
                ) : (
                  <span className="text-red-600">❌ Missing</span>
                )}
              </div>
              <div>
                <span className="font-medium">Anon Key:</span>{' '}
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                  <span className="text-green-600">
                    ✅ Set ({process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30)}...)
                  </span>
                ) : (
                  <span className="text-red-600">❌ Missing</span>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h2 className="font-semibold text-red-900 mb-2">Error Details</h2>
              <p className="text-red-700 text-sm">{error}</p>
              {error.includes('relation') && (
                <p className="text-red-600 text-xs mt-2">
                  💡 Tip: Make sure you've run the schema.sql file in your Supabase SQL Editor
                </p>
              )}
            </div>
          )}

          {/* User Info */}
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <h2 className="font-semibold text-blue-900 mb-2">Current User</h2>
              <p className="text-blue-700 text-sm">
                {user.email || 'Authenticated (no email)'}
              </p>
            </div>
          )}

          {/* Categories Test */}
          {status === 'connected' && (
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">
                Database Query Test (Categories)
              </h2>
              {categories.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    ✅ Successfully fetched {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {categories.map((cat) => (
                      <li key={cat.id} className="text-sm text-gray-700">
                        {cat.name} ({cat.slug})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-yellow-600">
                  ⚠️ No categories found. Make sure you've run the schema.sql file.
                </p>
              )}
            </div>
          )}

          {/* Test Button */}
          <div className="flex gap-3">
            <Button onClick={testConnection} isLoading={loading} variant="primary">
              {loading ? 'Testing...' : 'Test Connection Again'}
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
            >
              Go Home
            </Button>
          </div>

          {/* Instructions */}
          {status === 'error' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="font-semibold text-yellow-900 mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
                <li>Open your Supabase Dashboard</li>
                <li>Go to SQL Editor</li>
                <li>Copy and paste the contents of <code className="bg-yellow-100 px-1 rounded">supabase/schema.sql</code></li>
                <li>Click Run to execute the schema</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


