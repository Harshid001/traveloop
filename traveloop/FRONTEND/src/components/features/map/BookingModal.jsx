import React, { useState } from 'react';
import {
  X, Calendar, Users, Ticket, CreditCard, ShieldCheck, CheckCircle2,
  Sparkles, DollarSign, Award, ArrowRight
} from 'lucide-react';

export default function BookingModal({ destination, isOpen, onClose }) {
  const [bookingType, setBookingType] = useState('Tour Package');
  const [startDate, setStartDate] = useState('2026-09-15');
  const [guests, setGuests] = useState(2);
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !destination) return null;

  const basePrice = destination.budgetEstimate || destination.pricePerDay * 5 || 1500;
  const discountAmount = discountApplied ? basePrice * 0.15 : 0;
  const totalPrice = Math.round((basePrice - discountAmount) * (guests / 2));

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'TRAVELOOP15' || promoCode.trim().length > 2) {
      setDiscountApplied(true);
    } else {
      alert('Invalid promo code. Try "TRAVELOOP15" for 15% off.');
    }
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-poppins">
      <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={destination.image} alt={destination.name} className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h2 className="font-extrabold text-base text-white">{destination.name} {destination.flag}</h2>
              <p className="text-xs text-slate-400">Instant Booking Reservation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        {!isSubmitted ? (
          <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 text-xs">
            {/* Booking Category Selector */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Booking Service</span>
              <div className="flex flex-wrap gap-1.5">
                {['Tour Package', 'Hotel Stay', 'Activity', 'Airport Transfer', 'Rental Car', 'Tour Guide'].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setBookingType(type)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                      bookingType === type
                        ? 'bg-primary text-white border-primary-light shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Date & Guests */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Calendar size={12} className="text-indigo-400" /> Departure Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 font-bold text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Users size={12} className="text-primary-light" /> Number of Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 font-bold text-white outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num} className="bg-slate-900 text-white">
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Ticket size={12} className="text-amber-400" /> Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code (e.g. TRAVELOOP15)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 font-bold text-white uppercase outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold rounded-2xl hover:bg-amber-500/30 transition-all text-xs"
                >
                  Apply
                </button>
              </div>
              {discountApplied && (
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles size={10} /> 15% Promotional Discount Applied!
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Payment Option</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'card', label: 'Credit Card' },
                  { id: 'apple', label: 'Apple Pay' },
                  { id: 'paypal', label: 'PayPal' },
                ].map((pay) => (
                  <button
                    type="button"
                    key={pay.id}
                    onClick={() => setPaymentMethod(pay.id)}
                    className={`py-2 rounded-2xl border text-[11px] font-bold text-center transition-all ${
                      paymentMethod === pay.id
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {pay.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Base Rate ({bookingType})</span>
                <span>${basePrice}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Promo Discount (-15%)</span>
                  <span>-${discountAmount.toFixed(0)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-extrabold text-white">
                <span>Total Due Now</span>
                <span className="text-emerald-400">${totalPrice}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-extrabold text-xs text-white shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard size={16} /> Confirm &amp; Pay ${totalPrice}
            </button>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 size={36} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Booking Confirmed!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Your reservation for <strong className="text-white">{destination.name}</strong> is locked in.
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left text-xs space-y-1.5">
              <p className="text-slate-400">Booking Reference: <strong className="text-amber-400">TRV-{Math.floor(100000 + Math.random() * 900000)}</strong></p>
              <p className="text-slate-400">Departure: <strong className="text-white">{startDate}</strong></p>
              <p className="text-slate-400">Guests: <strong className="text-white">{guests} Adults</strong></p>
              <p className="text-slate-400">Total Paid: <strong className="text-emerald-400">${totalPrice} USD</strong></p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-dark font-bold text-xs text-white shadow-lg"
            >
              Return to Travel Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
