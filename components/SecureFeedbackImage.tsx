'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SecureFeedbackImage({ publicId, alt = 'Feedback Attachment' }: { publicId: string; alt?: string }) {
  const [resolvedSrc, setResolvedSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function acquireSignedAccessLink() {
      try {
        setLoading(true);
        setHasError(false);
        const response = await fetch(`/api/feedback-image?publicId=${encodeURIComponent(publicId)}`);
        
        if (!response.ok) throw new Error('Server rejected signature request');

        const data = await response.json();
        setResolvedSrc(data.url);
      } catch (err) {
        console.error('Secure asset resolution failed:', err);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    }

    if (publicId) acquireSignedAccessLink();
  }, [publicId]);

  if (loading) {
    return (
      <div className="w-full max-w-md h-48 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center border border-gray-200">
        <span className="text-sm text-gray-400">Verifying security token...</span>
      </div>
    );
  }

  if (hasError || !resolvedSrc) {
    return (
      <div className="w-full max-w-md h-48 bg-red-50 rounded-lg flex items-center justify-center border border-red-200 p-4 text-center">
        <p className="text-sm text-red-600 font-medium">Access denied. Invalid signature token.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md aspect-video overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        className="object-contain bg-neutral-900"
        sizes="(max-width: 768px) 100vw, 450px"
        priority={false}
      />
    </div>
  );
}
