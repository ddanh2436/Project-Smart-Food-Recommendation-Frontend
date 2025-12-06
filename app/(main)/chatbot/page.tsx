"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithBot } from "@/app/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPaperPlane, FaRobot, FaMapMarkerAlt, FaStar, FaEraser, FaChevronLeft, FaStore, FaUtensils, FaMagic } from "react-icons/fa";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  results?: any[];
}

export default function ChatbotPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Random câu chào
  useEffect(() => {
    const greetings = [
      "Chào bạn! 👋 Hôm nay chúng ta sẽ khám phá món ngon nào đây?",
      "Hello! 🥘 Đang đói bụng phải không? Để mình gợi ý vài quán 'đỉnh' nhé!",
      "VietNomNom xin chào! 🍜 Phở, cơm, hay lẩu? Mình cân được hết!",
      "Hi there! ✨ Cần tìm quán ăn không gian đẹp hay đồ ăn ngon? Hỏi mình ngay!",
    ];
    
    if (messages.length === 0) {
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      setMessages([
        { id: 1, sender: "bot", text: randomGreeting }
      ]);
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput(""); 
    
    const userMsg: Message = { id: Date.now(), sender: "user", text: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const res = await chatWithBot(userText, "10.7769", "106.7009");

    setLoading(false);

    if (res) {
      const botMsg: Message = { 
        id: Date.now() + 1, 
        sender: "bot", 
        text: res.reply, 
        results: res.results 
      };
      setMessages(prev => [...prev, botMsg]);
    } else {
      setMessages(prev => [...prev, { id: Date.now(), sender: "bot", text: "Hệ thống đang bận, bạn thử lại sau nhé! 😓" }]);
    }
  };

  const handleClearChat = () => {
    setMessages([{ id: Date.now(), sender: "bot", text: "Lịch sử đã xóa. Chúng ta bắt đầu lại nhé! 🚀" }]);
  };

  return (
    // CONTAINER CHÍNH: Màu nền Slate tối sang trọng hơn màu đen thuần
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden overscroll-none selection:bg-amber-500/30">
      
      {/* --- BACKGROUND EFFECTS (Hiệu ứng nền loang màu) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000"></div>
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/50 rounded-full blur-[100px] pointer-events-none"></div>

      {/* --- HEADER (Glassmorphism) --- */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center shadow-lg relative z-20 shrink-0">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => router.push('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all group border border-white/5"
            title="Quay lại trang chủ"
          >
            <FaChevronLeft className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center gap-3">
            {/* Logo Robot Glow */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur opacity-40"></div>
              <div className="relative w-11 h-11 bg-slate-900 rounded-full flex items-center justify-center border border-white/10">
                <FaRobot size={22} className="text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                NomNom Assistant <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20">BETA</span>
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Sẵn sàng hỗ trợ
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleClearChat}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-white/5 text-sm font-medium"
        >
          <FaEraser /> <span className="hidden md:inline">Làm mới</span>
        </button>
      </header>

      {/* --- BODY CHAT --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent relative z-10">
        <div className="max-w-5xl mx-auto w-full space-y-8 pb-4">
            {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                
                {/* Avatar Bot */}
                {msg.sender === 'bot' && (
                  <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-amber-500 text-sm mr-3 shadow-md shrink-0 mt-1 border border-slate-700">
                      <FaRobot />
                  </div>
                )}

                <div className={`flex flex-col max-w-[90%] md:max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* BONG BÓNG CHAT (Thiết kế mới) */}
                <div className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-lg backdrop-blur-sm relative ${
                    msg.sender === 'user' 
                    // User: Gradient Amber-Orange rực rỡ nhưng dịu mắt hơn
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl rounded-tr-sm shadow-orange-500/20' 
                    // Bot: Nền tối Glassmorphism
                    : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-2xl rounded-tl-sm'
                }`}>
                    {msg.text}
                </div>

                {/* --- GRID KẾT QUẢ --- */}
                {msg.results && msg.results.length > 0 && (
                    <div className="mt-6 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {msg.results.map((item: any) => (
                        <Link href={`/restaurants/${item._id}`} key={item._id} className="block group h-full">
                        
                        {/* CARD NHÀ HÀNG (Glass Style) */}
                        <div className="bg-slate-800/40 hover:bg-slate-800/80 backdrop-blur-md rounded-xl border border-white/5 hover:border-amber-500/30 shadow-lg hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer group">
                            
                            {/* Hình ảnh */}
                            <div className="relative w-full h-44 overflow-hidden">
                              <img
                                  src={item.avatarUrl || "/assets/image/pho.png"}
                                  alt={item.tenQuan}
                                  referrerPolicy="no-referrer"
                                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (!target.src.includes("/assets/image/pho.png")) {
                                        target.src = "/assets/image/pho.png";
                                    }
                                  }}
                              />
                              {/* Gradient Overlay mờ */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                              
                              {/* Badge Rating & Price */}
                              <div className="absolute top-3 right-3 flex gap-2">
                                <div className="bg-slate-900/80 backdrop-blur text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10 shadow-sm">
                                    <FaStar size={10} /> {item.diemTrungBinh ? item.diemTrungBinh.toFixed(1) : "N/A"}
                                </div>
                              </div>
                              
                              {/* Tag trên ảnh */}
                              <div className="absolute bottom-3 left-3 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                {item.giaCa ? "Có giá" : "Menu"}
                              </div>
                            </div>

                            {/* Thông tin */}
                            <div className="p-4 flex flex-col flex-1 justify-between">
                              <div>
                                  <h4 className="font-bold text-[15px] text-slate-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
                                  {item.tenQuan}
                                  </h4>
                                  <p className="text-xs text-slate-400 flex items-start gap-1.5 mt-2 line-clamp-2">
                                  <FaMapMarkerAlt className="text-slate-500 shrink-0 mt-0.5 group-hover:text-amber-500 transition-colors" /> 
                                  {item.diaChi}
                                  </p>
                              </div>
                              
                              <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                                  <div className="flex items-center gap-2">
                                    <FaUtensils className="text-slate-600 text-xs" />
                                    <span className="text-xs text-slate-300">
                                      {item.giaCa || "Đang cập nhật"}
                                    </span>
                                  </div>
                                  
                                  <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 transform group-hover:rotate-12">
                                    <FaStore size={12} />
                                  </div>
                              </div>
                            </div>
                        </div>
                        </Link>
                    ))}
                    </div>
                )}
                </div>
            </div>
            ))}
            
            {/* Hiệu ứng Loading (Sóng) */}
            {loading && (
            <div className="flex justify-start w-full">
                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-amber-500 text-sm mr-3 mt-1 border border-slate-700">
                   <FaRobot />
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- INPUT AREA (Floating Glass) --- */}
      <div className="p-4 md:p-6 shrink-0 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-xl rounded-2xl px-2 py-2 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.3)] focus-within:border-amber-500/50 focus-within:shadow-[0_8px_30px_rgba(245,158,11,0.2)] transition-all duration-300">
            <div className="pl-3 text-slate-500">
              <FaMagic />
            </div>
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-base px-2 text-slate-200 placeholder-slate-500 caret-amber-500 h-11"
              placeholder="Bạn muốn tìm món gì? (VD: Phở bò, Cơm tấm...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95"
            >
              <FaPaperPlane size={18} className="-ml-0.5 mt-0.5" />
            </button>
          </div>
          <p className="text-center text-slate-500 text-[11px] mt-3 font-medium tracking-wide">
              NomNom Assistant AI &bull; Kết quả có thể thay đổi tùy theo dữ liệu
          </p>
        </div>
      </div>
    </div>
  );
}