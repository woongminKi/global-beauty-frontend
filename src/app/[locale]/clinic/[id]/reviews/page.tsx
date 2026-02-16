'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Star, ThumbsUp, CheckCircle, ExternalLink } from 'lucide-react';
import { getClinic, getClinicReviews, getClinicReviewsList, markReviewHelpful, type Clinic, type Review, type ReviewStats } from '@/lib/api';
import { getLocalizedText, cn, type Locale } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function ClinicReviewsPage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const clinicId = params.id as string;

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [externalLinks, setExternalLinks] = useState<{ source: string; url: string }[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'recent' | 'rating-high' | 'rating-low' | 'helpful'>('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [clinicRes, externalRes, reviewsRes] = await Promise.all([
        getClinic(clinicId),
        getClinicReviews(clinicId),
        getClinicReviewsList(clinicId, { page, sort, limit: 10 }),
      ]);
      if (clinicRes.success && clinicRes.data) {
        setClinic(clinicRes.data);
      }
      if (externalRes.success && externalRes.data) {
        setExternalLinks(externalRes.data.externalLinks || []);
      }
      if (reviewsRes.success && reviewsRes.data) {
        setReviews(reviewsRes.data.items);
        setStats(reviewsRes.data.stats);
        setTotalPages(reviewsRes.data.totalPages);
      }
      setLoading(false);
    }
    fetchData();
  }, [clinicId, page, sort]);

  const handleHelpful = async (reviewId: string) => {
    const res = await markReviewHelpful(reviewId);
    if (res.success && res.data) {
      setReviews(reviews.map(r =>
        r._id === reviewId ? { ...r, helpfulCount: res.data!.helpfulCount } : r
      ));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
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
        <Link href="/search" className="hover:text-gray-700">Search</Link>
        <span className="mx-2">/</span>
        <Link href={`/clinic/${clinicId}`} className="hover:text-gray-700">
          {getLocalizedText(clinic.name, locale)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Reviews</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Reviews - {getLocalizedText(clinic.name, locale)}
      </h1>

      {/* Stats Summary */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</div>
              <div className="flex justify-center mt-2">{renderStars(Math.round(stats.averageRating))}</div>
              <div className="text-sm text-gray-500 mt-1">{stats.totalReviews} reviews</div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600 w-6">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* External Review Links */}
      {externalLinks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews on other platforms</h2>
          <div className="flex flex-wrap gap-3">
            {externalLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <span className="font-medium text-gray-700">{link.source}</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">User Reviews</h2>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="recent">Most Recent</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Be the first to review this clinic after your confirmed booking!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{review.user.name}</span>
                    {review.isVerified && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{review.procedure}</span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>

              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {review.photos.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={photo} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleHelpful(review._id)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulCount})
                </button>
                <span className="text-sm text-gray-400">
                  Visited: {new Date(review.visitDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
