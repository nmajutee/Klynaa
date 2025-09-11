import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Review {
  id: number;
  reviewerName: string;
  reviewerRole: 'worker' | 'bin_owner';
  targetName: string;
  targetRole: 'worker' | 'bin_owner';
  rating: number;
  comment: string;
  date: string;
  pickupId?: string;
}

const Reviews: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({
    targetType: 'worker',
    targetId: '',
    rating: 5,
    comment: ''
  });

  const reviews: Review[] = [
    {
      id: 1,
      reviewerName: 'Sarah Johnson',
      reviewerRole: 'bin_owner',
      targetName: 'Mike Chen',
      targetRole: 'worker',
      rating: 5,
      comment: 'Excellent service! Mike arrived on time and handled the pickup professionally. Very satisfied.',
      date: '2025-09-10',
      pickupId: 'PU-2025-001234'
    },
    {
      id: 2,
      reviewerName: 'David Kim',
      reviewerRole: 'worker',
      targetName: 'Green Valley Apartments',
      targetRole: 'bin_owner',
      rating: 4,
      comment: 'Clean bin area and easy access. Good communication from the property manager.',
      date: '2025-09-09',
      pickupId: 'PU-2025-001235'
    },
    {
      id: 3,
      reviewerName: 'Emma Wilson',
      reviewerRole: 'bin_owner',
      targetName: 'Alex Rivera',
      targetRole: 'worker',
      rating: 5,
      comment: 'Outstanding work! Very thorough and left the area cleaner than before.',
      date: '2025-09-08',
      pickupId: 'PU-2025-001236'
    }
  ];

  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'all') return true;
    if (activeTab === 'workers') return review.targetRole === 'worker';
    if (activeTab === 'bin_owners') return review.targetRole === 'bin_owner';
    return true;
  });

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const handleSubmitReview = () => {
    console.log('Submitting review:', newReview);
    // Here you would typically send the review to your backend
    setShowWriteReview(false);
    setNewReview({ targetType: 'worker', targetId: '', rating: 5, comment: '' });
  };

  return (
    <>
      <Head>
        <title>Reviews - Klynaa</title>
        <meta name="description" content="Read and write reviews for waste pickup services on Klynaa platform." />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-green-600 py-16 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Community Reviews</h1>
          <p className="text-green-100 max-w-2xl mx-auto">
            Building trust through transparent feedback between workers and bin owners
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header with Write Review Button */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Service Reviews</h2>
            <button
              onClick={() => setShowWriteReview(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Write Review
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'all', label: 'All Reviews', count: reviews.length },
                { id: 'workers', label: 'Worker Reviews', count: reviews.filter(r => r.targetRole === 'worker').length },
                { id: 'bin_owners', label: 'Bin Owner Reviews', count: reviews.filter(r => r.targetRole === 'bin_owner').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">
                        {review.reviewerName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.reviewerName}</h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {review.reviewerRole.replace('_', ' ')} → {review.targetName} ({review.targetRole.replace('_', ' ')})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(review.rating)}
                    <p className="text-sm text-gray-500 mt-1">{review.date}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{review.comment}</p>

                {review.pickupId && (
                  <div className="text-sm text-gray-500">
                    Pickup ID: <span className="font-mono">{review.pickupId}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No reviews found for this category.</p>
            </div>
          )}
        </div>

        {/* Write Review Modal */}
        {showWriteReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review Type</label>
                  <select
                    value={newReview.targetType}
                    onChange={(e) => setNewReview(prev => ({ ...prev, targetType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="worker">Review a Worker</option>
                    <option value="bin_owner">Review a Bin Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target ID</label>
                  <input
                    type="text"
                    value={newReview.targetId}
                    onChange={(e) => setNewReview(prev => ({ ...prev, targetId: e.target.value }))}
                    placeholder="Enter pickup ID or user ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  {renderStars(newReview.rating, true, (rating) =>
                    setNewReview(prev => ({ ...prev, rating }))
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    placeholder="Share your experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowWriteReview(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 text-gray-300 py-8">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">© {new Date().getFullYear()} Klynaa. All rights reserved.</p>
            <div className="flex space-x-6 text-sm">
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reviews;
