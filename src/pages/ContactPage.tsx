import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Button } from '../components/ui/Button';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { navigateTo, showToast } = useShop();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Product Consultation & Scent Advice');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Are all OUD_X fragrances 100% authentic and certified?',
      a: 'Yes, unconditionally. Every flacon is directly bottled by our certified master perfumery ateliers with serial batch tracking numbers.'
    },
    {
      q: 'What is the difference between Extrait de Parfum and Eau de Parfum?',
      a: 'Extrait de Parfum features our highest oil concentration (30–38%), yielding profound sillage that lasts 14–24 hours on skin and fabrics. Eau de Parfum provides 18–22% oil concentration for a balanced daily projection.'
    },
    {
      q: 'How fast will my order arrive across Egypt?',
      a: 'Orders in Greater Cairo, Giza, and Alexandria arrive within 24–48 hours via our dedicated white-glove couriers. For express same-day orders placed before 1 PM CLT, delivery takes 6–12 hours.'
    },
    {
      q: 'What is your return & exchange guarantee policy?',
      a: 'We offer a 14-day return privilege on unopened, tamper-sealed fragrances. We also include complimentary scent testing strips with each bottle so you can evaluate the scent before opening the main flacon seal.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('Concierge Message Received', 'Our fragrance advisor will contact you within 4 business hours.', 'gold');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] pb-24">
      {/* Breadcrumb */}
      <div className="bg-[#0D0C0A] border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#A7A29A] uppercase tracking-wider">
            <button onClick={() => navigateTo('/')} className="hover:text-[#F5F2EA]">Home</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D]" />
            <span className="text-[#C9A45C]">VIP Concierge & FAQs</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E713D] font-semibold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> Dedicated Client Service
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-[#F5F2EA]">
            BOUTIQUE CONCIERGE
          </h1>
          <p className="text-xs sm:text-sm text-[#A7A29A]">
            Whether you require a bespoke olfactory recommendation or assistance with a private order, our advisors are here for you.
          </p>
        </div>

        {/* 2 Column Layout: Form & Boutique Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/35 shadow-2xl">
            <h2 className="font-cinzel text-sm font-bold uppercase tracking-widest text-[#E3C27A] border-b border-white/10 pb-4 mb-6">
              Send a Message to Concierge
            </h2>

            {submitted ? (
              <div className="p-8 text-center rounded-xl bg-[#11100E] border border-emerald-500/40 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-cinzel text-base font-bold text-[#F5F2EA]">Message Dispatched Successfully</h3>
                <p className="text-xs text-[#A7A29A]">
                  Thank you, <strong>{name}</strong>. Our senior fragrance consultant will connect with you shortly via phone or email.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="secondary" size="sm">
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Karim El-Sayed"
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">Phone Number (WhatsApp)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+20 100 123 4567"
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">Inquiry Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none cursor-pointer"
                    >
                      <option value="Product Consultation & Scent Advice">Fragrance Consultation</option>
                      <option value="Order Tracking & White Glove Delivery">Order & Delivery Status</option>
                      <option value="Corporate & VIP Gifting Vaults">Corporate / VIP Gifting</option>
                      <option value="Other Inquiries">General Atelier Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#A7A29A] mb-1 font-medium">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your scent preferences or order details..."
                    className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                >
                  DISPATCH CONCIERGE REQUEST
                </Button>
              </form>
            )}
          </div>

          {/* Right Boutique Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 shadow-xl space-y-6">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#F5F2EA] border-b border-white/10 pb-3">
                Flagship Boutique
              </h3>

              <div className="space-y-4 text-xs text-[#A7A29A]">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#C9A45C] shrink-0" />
                  <div>
                    <strong className="text-[#F5F2EA] block">VIP Direct Line</strong>
                    <span>01127977819</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#C9A45C] shrink-0" />
                  <div>
                    <strong className="text-[#F5F2EA] block">Electronic Inquiries</strong>
                    <span>oudx.fragrances@gmail.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#C9A45C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#F5F2EA] block">Boutique Visiting Hours</strong>
                    <span>Monday – Sunday: 11:00 AM – 11:00 PM CLT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* FAQs Section */}
        <div id="faqs" className="pt-24 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E713D] font-semibold flex items-center justify-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#C9A45C]" /> Knowledge Base
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl text-[#F5F2EA]">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#0D0C0A] border border-white/5 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-[#F5F2EA] hover:text-[#E3C27A]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform text-[#C9A45C] ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-[#A7A29A] leading-relaxed border-t border-white/5 mt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
