'use client';

import React from 'react';
import { Ticket, X, MapPin } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: () => void;
  placeName: string;
  price: number;
}

export default function PaymentModal({ isOpen, onClose, onPay, placeName, price }: PaymentModalProps) {
  if (!isOpen) return null;

  // price = user_price (sudah termasuk platform_fee, sesuai coreSystem.MD)
  // user_price = partner_price + platform_fee
  // partner_price = user_price / 1.1 (karena fee = 10% dari partner_price)
  const partnerPrice = Math.round(price / 1.1);
  const platformFee = price - partnerPrice;
  const total = price; // user_price = final price (tidak berubah)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#B5BAA9] text-gray-900 rounded-[2rem] p-8 max-w-sm w-full relative shadow-2xl flex flex-col pt-12 animate-in fade-in zoom-in duration-200">
        
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-600 hover:text-black">
          <X size={24} />
        </button>

        {/* Icon Header */}
        <div className="bg-greenDark w-12 h-12 rounded-xl text-white flex items-center justify-center mx-auto mb-4">
          <Ticket size={24} />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-1">Smart Ticketing</h2>
          <p className="text-xs text-gray-600 font-medium">Secure checkout for {placeName}</p>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3 border-y border-dashed border-gray-400 py-6 mb-6">
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-700">Partner Price</span>
            <span className="font-bold">Rp {partnerPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-700">Platform Fee (10%)</span>
            <span className="font-bold">Rp {platformFee.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-base items-center pt-2">
            <span className="font-bold text-greenDark">Total Payment</span>
            <span className="font-bold text-greenDark">Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* UMKM Info */}
        <div className="bg-greenDark/10 text-greenDark p-4 rounded-xl text-[10px] sm:text-xs font-semibold flex items-start gap-3 mb-8">
          <MapPin size={16} className="shrink-0 mt-0.5" />
          <p className="leading-relaxed">Transaksi ini menyalurkan Rp {partnerPrice.toLocaleString('id-ID')} langsung ke rekening partner lokal melalui program TapRoute UMKM.</p>
        </div>

        <button 
          onClick={onPay}
          className="w-full bg-greenDark hover:bg-[#20401b] transition-colors text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 mb-3 shadow-lg"
        >
          Pay Instantly <ArrowRightIcon className="w-4 h-4" />
        </button>

        <button onClick={onClose} className="text-xs font-bold text-gray-600 hover:text-black py-2">
          Cancel
        </button>
      </div>
    </div>
  );
}

function ArrowRightIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
