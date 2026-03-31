import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ActivityItemProps {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  isUmkm?: boolean;
  buttonText?: string;
  onBook?: () => void;
  isLast?: boolean;
  detailHref?: string;
}

function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price).replace('Rp', 'Rp ');
}

export default function ActivityItem({
  title,
  description,
  price,
  imageUrl = 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80',
  isUmkm = false,
  buttonText = 'Book Ticket',
  onBook,
  isLast = false,
  detailHref
}: ActivityItemProps) {
  return (
    <div className="relative flex gap-6 pb-8">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[20px] top-12 bottom-0 w-[2px] border-l-2 border-dashed border-gray-300 -z-10" />
      )}

      {/* Main Content Card */}
      <div className="flex-1 bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative z-10">
        
        {/* Activity Image */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
          <img 
            src={`https://image.pollinations.ai/prompt/${encodeURIComponent(title + ' landmark photography layout')}`} 
            alt={title} 
            className="w-full h-full object-cover" 
            onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(title)}/400/300` }}
          />
        </div>

        {/* Activity Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900 text-[15px] max-w-[200px] sm:max-w-none">{title}</h4>
                {isUmkm && (
                  <span className="inline-block px-2 text-[8px] mt-1 font-bold tracking-wider text-white bg-greenDark rounded-full">UMKM PARTNER</span>
                )}
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="font-bold text-greenDark block">{formatPrice(price)}</span>
                <span className="text-[10px] text-gray-500">per person</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{description}</p>
          </div>
          
          {/* Action Row */}
          <div className="flex justify-end gap-4 items-center mt-3">
            {detailHref ? (
              <Link
                href={detailHref}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xs font-bold px-4 py-2 rounded-full shadow-sm"
              >
                Detail Tempat
              </Link>
            ) : (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xs font-bold px-4 py-2 rounded-full shadow-sm"
                title="Lihat detail wisata di Google"
              >
                Cari via Google
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
