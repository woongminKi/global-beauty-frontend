'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getClinic, getClinicReviews, type Clinic } from '@/lib/api';
import { getLocalizedText, type Locale } from '@/lib/utils';

export default function ClinicReviewsPage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const clinicId = params.id as string;

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [reviews, setReviews] = useState<{
    externalLinks: { source: string; url: string }[];
    reviews: unknown[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [clinicRes, reviewsRes] = await Promise.all([
        getClinic(clinicId),
        getClinicReviews(clinicId),
      ]);
      if (clinicRes.success && clinicRes.data) {
        setClinic(clinicRes.data);
      }
      if (reviewsRes.success && reviewsRes.data) {
        setReviews(reviewsRes.data);
      }
      setLoading(false);
    }
    fetchData();
  }, [clinicId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Clinic not found</p>
        <Link href="/search" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/search" className="hover:text-gray-700">
          Search
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/clinic/${clinicId}`} className="hover:text-gray-700">
          {getLocalizedText(clinic.name, locale)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Reviews</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Reviews - {getLocalizedText(clinic.name, locale)}
      </h1>

      {/* Rating Summary */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-1">
          <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-2xl font-bold text-gray-900">{clinic.rating.toFixed(1)}</span>
        </div>
        <span className="text-gray-500">({clinic.reviewCount} reviews)</span>
      </div>

      {/* External Review Links */}
      {reviews?.externalLinks && reviews.externalLinks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reviews on other platforms
          </h2>
          <div className="grid gap-4">
            {reviews.externalLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">
                      {link.source.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View on {link.source}</p>
                    <p className="text-sm text-gray-500">External reviews</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Self-hosted Reviews Placeholder */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          User reviews coming soon
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We're building a trusted review system. Only patients with confirmed bookings will be able to leave reviews.
        </p>
      </div>
    </div>
  );
}
