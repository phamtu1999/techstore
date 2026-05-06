import React from 'react';
import { ShoppingBag, ArrowRight, Zap, Sparkles } from 'lucide-react';
import './HeroBanner.css';
import { Link } from 'react-router-dom';

const HeroBanner: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#010828] rounded-[2.5rem] sm:rounded-[4rem] group border border-white/5 shadow-2xl">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=1600" 
          alt="Premium Tech Background" 
          className="w-full h-full object-cover opacity-40 transition-transform duration-[3000ms] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#010828] via-[#010828]/60 to-primary-600/20" />
      </div>

      {/* Decorative Background Text - Refined based on feedback */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span className="text-[10rem] sm:text-[20rem] lg:text-[35rem] font-black leading-none uppercase tracking-tighter opacity-[0.03] text-white blur-sm">
          TECH STORE
        </span>
      </div>

      {/* Noise Overlay */}
      <div className="absolute inset-0 z-[5] opacity-[0.05] pointer-events-none noise-bg" />

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center px-4 sm:px-12 lg:px-24 py-10 sm:py-24 lg:py-36">
        
        {/* Left Side: Product Intro */}
        <div className="space-y-8 sm:space-y-12 animate-fade-in text-center lg:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-primary-600 text-[10px] font-black uppercase tracking-[0.3em]">
               <Sparkles className="h-3 w-3 animate-pulse" />
               New Arrival · Limited Edition
            </div>
            <h1 className="text-4xl sm:text-7xl lg:text-9xl leading-[0.85] text-white tracking-tighter uppercase font-black">
              FUTURE<br/>
              <span className="text-primary-600 italic">BEYOND</span>
            </h1>
            <p className="max-w-md mx-auto lg:mx-0 text-gray-400 font-bold text-sm sm:text-base tracking-wide leading-relaxed">
              Trải nghiệm công nghệ Titanium đỉnh cao. Chipset mạnh mẽ nhất thế kỷ. 
              Thiết kế của tương lai ngay trong tầm tay bạn.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
            <Link to="/products" className="group/btn relative bg-primary-600 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-primary-600/40 hover:bg-primary-700 hover:-translate-y-1 transition-all overflow-hidden">
               <span className="relative z-10 flex items-center gap-2">MUA NGAY <ShoppingBag className="h-4 w-4" /></span>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
            <Link to="/products" className="group/link flex items-center gap-3 text-white font-black text-xs uppercase tracking-[0.2em] hover:text-primary-600 transition-colors">
              XEM BẢNG GIÁ <ArrowRight className="h-4 w-4 group-hover/link:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Side: Product Card Card */}
        <div className="relative group/card max-w-md mx-auto lg:mx-0">
          <div className="liquid-glass relative z-20 p-8 sm:p-12 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col gap-10 transition-all duration-700 group-hover:rotate-1 group-hover:scale-105">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
                  <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.2em]">Sẵn hàng tại kho</p>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-tight">IPhone 15 Pro Max</h3>
              </div>
              <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-white shadow-inner">
                <Zap className="h-5 w-5 fill-current" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden group/price">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Giá độc quyền</span>
                  <div className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">-15% OFF</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">28.990.000₫</span>
                  <span className="text-xs font-bold text-white/20 line-through">32.990k</span>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover/price:bg-primary-600/20 transition-all"></div>
              </div>
              
              {/* Features section moved to flex for compactness */}
              <div className="flex justify-between items-center px-2">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Dung lượng</p>
                  <p className="text-xs font-black text-white">256GB Titanium</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Hỗ trợ</p>
                  <p className="text-xs font-black text-emerald-500 uppercase tracking-tight">Trả góp 0%</p>
                </div>
              </div>
            </div>

            <button className="w-full py-4 bg-white/5 hover:bg-primary-600 border border-white/10 hover:border-primary-500 rounded-2xl text-[9px] font-black text-white uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group/btn2">
              <Sparkles className="h-3.5 w-3.5 group-hover/btn2:rotate-45 transition-transform" /> 
              Cấu hình chi tiết
            </button>
          </div>

          {/* Background Glow */}
          <div className="absolute inset-0 bg-primary-600/10 blur-[150px] rounded-full z-10 animate-pulse" />
        </div>
      </div>

      {/* Bottom Visual Bar */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/60 to-transparent z-[1]" />
    </section>
  );
};

export default HeroBanner;
