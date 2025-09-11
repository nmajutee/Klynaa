import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
}

const mockPosts: Post[] = [
  {
    id: 1,
    title: 'Reducing Urban Waste Through Smart Bins',
    excerpt: 'How IoT-enabled bins and data insights help cities keep streets cleaner and reduce collection inefficiencies.',
    category: 'Sustainability',
    date: '2025-09-01',
    readingTime: '4 min'
  },
  {
    id: 2,
    title: 'How Klynaa Supports Local Recycling Entrepreneurs',
    excerpt: 'A look at how we connect waste collectors, recyclers, and businesses to drive circular value in Cameroon.',
    category: 'Community',
    date: '2025-08-26',
    readingTime: '5 min'
  },
  {
    id: 3,
    title: 'Mobile Money & Waste Payments: A New Era',
    excerpt: 'Escrow-backed transactions and digital accountability increase trust in waste service delivery.',
    category: 'Innovation',
    date: '2025-08-20',
    readingTime: '3 min'
  }
];

const Blog: React.FC = () => {
  return (
    <>
      <Head>
        <title>Blog & Updates - Klynaa</title>
        <meta name="description" content="Insights, updates, and stories from the Klynaa waste management platform." />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="relative bg-green-600 py-16 mb-12">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1459802071246-377c0346da93?auto=format&fit=crop&w=1350&q=80')] mix-blend-multiply bg-center bg-cover" />
          <div className="relative max-w-5xl mx-auto px-6 text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Blog & Updates</h1>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">Sustainability insights, platform updates, and stories from the frontline of waste transformation.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {mockPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden flex flex-col">
              <div className="h-40 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-xl">
                {post.category}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h2>
                <p className="text-gray-600 text-sm flex-1">{post.excerpt}</p>
                <div className="mt-4 text-xs text-gray-400 flex justify-between items-center">
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                  <span>{post.readingTime}</span>
                </div>
                <button className="mt-4 text-sm font-medium text-green-600 hover:text-green-700 inline-flex items-center">Read more →</button>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="bg-white rounded-lg p-8 shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Want to contribute?</h3>
            <p className="text-gray-600 mb-4">We're opening up for guest sustainability writers, local recycling innovators, and municipal partners to share insights.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700">Get in touch</Link>
          </div>
        </div>

        <div className="bg-gray-900 text-gray-300 py-8 mt-12">
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

export default Blog;
