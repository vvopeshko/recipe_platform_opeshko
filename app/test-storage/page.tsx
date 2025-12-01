'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export default function TestStoragePage() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [buckets, setBuckets] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const testStorage = async () => {
    setTesting(true);
    setStatus('Testing storage...');

    try {
      // Try to list buckets first
      const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();

      console.log('Buckets list result:', { bucketsData, bucketsError });

      setBuckets(bucketsData || []);

      // Try to access the bucket directly (even if listing fails)
      const BUCKET_NAME = 'recipe-images';
      
      // Try to list files in the bucket (this will work even if listBuckets doesn't)
      const { data: filesData, error: filesError } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', {
          limit: 1,
        });

      console.log('Direct bucket access result:', { filesData, filesError });

      if (!bucketsError && bucketsData && bucketsData.length > 0) {
        const recipeImagesBucket = bucketsData.find(b => b.name === BUCKET_NAME);
        
        if (recipeImagesBucket) {
          setStatus(`✅ Bucket "${BUCKET_NAME}" FOUND via list! Public: ${recipeImagesBucket.public ? 'Yes' : 'No'}`);
          return;
        }
      }

      // If listing failed or bucket not found, check direct access
      if (filesError) {
        if (filesError.message?.includes('Bucket not found') || filesError.message?.includes('does not exist')) {
          setStatus(`❌ Bucket "${BUCKET_NAME}" NOT FOUND. Error: ${filesError.message}`);
        } else if (filesError.message?.includes('policy') || filesError.message?.includes('permission')) {
          setStatus(`⚠️ Bucket "${BUCKET_NAME}" exists but has permission issues. Check storage policies.`);
        } else {
          setStatus(`❌ Error accessing bucket: ${filesError.message}`);
        }
      } else {
        // If we can list files, the bucket exists and is accessible
        setStatus(`✅ Bucket "${BUCKET_NAME}" EXISTS and is accessible! (Could list files)`);
      }
    } catch (error: any) {
      console.error('Storage test error:', error);
      setStatus(`Error: ${error.message || String(error)}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Storage Bucket</h1>
          
          <div className="mb-6">
            <Button onClick={testStorage} isLoading={testing} variant="primary">
              Test Storage Connection
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Status:</p>
            <p className="text-lg font-medium">{status}</p>
          </div>

          {buckets.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Available Buckets:</h2>
              <div className="space-y-2">
                {buckets.map((bucket) => (
                  <div
                    key={bucket.id}
                    className={`p-3 rounded border ${
                      bucket.name === 'recipe-images'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{bucket.name}</p>
                        <p className="text-sm text-gray-600">
                          Public: {bucket.public ? 'Yes ✅' : 'No ❌'}
                        </p>
                      </div>
                      {bucket.name === 'recipe-images' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Found!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(status.includes('NOT FOUND') || status.includes('Error')) && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="font-semibold text-yellow-800 mb-2">How to Fix:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700 mb-4">
                <li>Go to <strong>Supabase Dashboard</strong> → <strong>Storage</strong></li>
                <li>Check if bucket <code className="bg-yellow-100 px-1 rounded">recipe-images</code> exists</li>
                <li>If it doesn't exist, click <strong>"New bucket"</strong></li>
                <li>Name: <code className="bg-yellow-100 px-1 rounded">recipe-images</code> (exactly, no spaces, lowercase)</li>
                <li>Toggle <strong>"Public bucket"</strong> to <strong>ON</strong></li>
                <li>Click <strong>"Create bucket"</strong></li>
                <li>Wait a few seconds and refresh this page</li>
              </ol>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If the bucket exists but still shows as not found, it might be a permissions issue. 
                  Check the browser console for more details.
                </p>
              </div>
            </div>
          )}

          {status.includes('permission') && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
              <h3 className="font-semibold text-orange-800 mb-2">Permission Issue Detected:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-orange-700">
                <li>Go to <strong>Supabase Dashboard</strong> → <strong>Storage</strong> → <strong>Policies</strong></li>
                <li>Click on <code className="bg-orange-100 px-1 rounded">recipe-images</code> bucket</li>
                <li>Create these policies:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li><strong>SELECT:</strong> Allow public read access</li>
                    <li><strong>INSERT:</strong> Allow authenticated users to upload</li>
                  </ul>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

