"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithBot, searchRestaurantsByImage } from "@/app/lib/api";
import Link from "next/link";
import { FaPaperPlane, FaComments, FaTimes, FaRobot, FaMapMarkerAlt, FaStar, FaStore, FaImage, FaSpinner, FaChevronDown } from "react-icons/fa";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  results?: any[];
  isImage?: boolean;
  imageUrl?: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Random câu chào
  useEffect(() => {
    const greetings = [
      "Chào bạn! 👋 Hôm nay chúng ta sẽ khám phá món ngon nào đây?",
      "Hello! 🥘 Đang đói bụng phải không? Gửi ảnh hoặc tên món để mình tìm nhé!",
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

  // 2. Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, loading]);

  // --- XỬ LÝ GỬI TEXT ---
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

  // --- XỬ LÝ GỬI ẢNH ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    const userMsg: Message = { 
      id: Date.now(), 
      sender: "user", 
      text: "Đã gửi ảnh...", 
      isImage: true,
      imageUrl: imageUrl 
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await searchRestaurantsByImage(file);
      setLoading(false);

      if (res && res.detectedFood) {
        const detectedName = res.detectedFood;
        const restaurants = res.data || [];
        
        const botMsg: Message = {
          id: Date.now() + 1,
          sender: "bot",
          text: `Mình đoán đây là món **"${detectedName}"**. 😋 Dưới đây là các quán ngon nhất:`,
          results: restaurants
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: "Hmm... Ảnh khó nhận diện quá. Bạn thử chụp rõ hơn hoặc nhập tên món nhé! 🤔" }]);
      }
    } catch (error) {
      setLoading(false);
      setMessages(prev => [...prev, { id: Date.now(), sender: "bot", text: "Lỗi xử lý ảnh rồi. Thử lại sau nha!" }]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* --- NÚT MỞ CHAT (Floating) --- */}
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'opacity-0 translate-y-10 pointer-events-none scale-0' : 'opacity-100 translate-y-0 scale-100'}`}>
        <button 
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-700 text-white rounded-full shadow-2xl shadow-orange-900/50 hover:shadow-orange-600/70 transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20"
        >
          {/* Icon Chat */}
          <FaComments size={30} className="animate-bounce-slow drop-shadow-md" />
          
          {/* Tooltip */}
          <span className="absolute right-20 bg-slate-900 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
            Tìm quán ngon ngay!
          </span>
          
          {/* Ping Effect */}
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white"></span>
          </span>
        </button>
      </div>

      {/* --- KHUNG CHAT (Midnight Amber) --- */}
      <div 
        className={`fixed bottom-6 right-6 w-[380px] h-[600px] bg-slate-950/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/60 border border-slate-800 flex flex-col overflow-hidden transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        
        {/* HEADER */}
        <div className="bg-slate-900/80 p-4 flex justify-between items-center shadow-lg shrink-0 border-b border-white/5 relative overflow-hidden">
          {/* Decor background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
               <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur opacity-40"></div>
               <div className="relative w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-white/10">
                 <FaRobot size={20} className="text-amber-400" />
               </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-wide">NomNom Assistant</h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
             <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-white/10 p-2 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <FaChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent bg-slate-950">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              
              {/* Avatar Bot */}
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-amber-500 text-xs mr-2 shadow-md shrink-0 mt-1 border border-slate-700">
                  <FaRobot />
                </div>
              )}

              <div className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Ảnh user gửi */}
                {msg.isImage && msg.imageUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-amber-500/30 shadow-md">
                        <img src={msg.imageUrl} alt="Food" className="w-32 h-32 object-cover" />
                    </div>
                )}

                {/* Bong bóng Chat */}
                <div className={`px-4 py-3 text-[14px] leading-relaxed shadow-sm relative ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-700 text-white rounded-2xl rounded-tr-sm shadow-orange-900/20' 
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-sm'
                }`}>
                  {msg.text.split("**").map((part, i) => i % 2 === 1 ? <strong key={i} className="text-amber-400">{part}</strong> : part)}
                </div>

                {/* --- KẾT QUẢ TÌM KIẾM --- */}
                {msg.results && msg.results.length > 0 && (
                  <div className="mt-3 w-full space-y-2.5 pl-1">
                    {msg.results.map((item: any) => (
                      <Link href={`/restaurants/${item._id}`} key={item._id} className="block group">
                        <div className="bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800 hover:border-amber-500/30 shadow-sm hover:shadow-amber-500/10 transition-all duration-300 flex overflow-hidden cursor-pointer h-[80px] relative">
                          
                          {/* Hình ảnh */}
                          <div className="relative w-[80px] h-full shrink-0">
                            <img
                              src={item.avatarUrl || "/assets/image/pho.png"}
                              alt={item.tenQuan}
                              referrerPolicy="no-referrer"
                              className="object-cover w-full h-full opacity-90 group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes("/assets/image/pho.png")) target.src = "/assets/image/pho.png";
                              }}
                            />
                            <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-sm text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                               <FaStar size={8} /> {item.diemTrungBinh ? item.diemTrungBinh.toFixed(1) : "N/A"}
                            </div>
                          </div>

                          {/* Thông tin */}
                          <div className="p-2.5 flex flex-col justify-between flex-1 min-w-0">
                            <div>
                              <h4 className="font-bold text-[13px] text-slate-100 truncate group-hover:text-amber-400 transition-colors">
                                {item.tenQuan}
                              </h4>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                <FaMapMarkerAlt className="text-slate-500 shrink-0" /> 
                                {item.diaChi}
                              </p>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-amber-500 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-500/20">
                                {item.giaCa || "Menu"}
                              </span>
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
          
          {/* Loading */}
          {loading && (
            <div className="flex justify-start w-full animate-fade-in">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-amber-500 text-xs mr-2 mt-1 border border-slate-700">
                 <FaRobot />
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0 relative z-20">
          <div className="flex items-center gap-2 bg-black/40 rounded-xl px-2 py-2 border border-slate-700 focus-within:border-amber-500/50 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all duration-300">
            
            {/* Nút Upload Ảnh */}
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-amber-400 transition-colors" title="Gửi ảnh">
                <FaImage size={18} />
            </button>

            <div className="h-5 w-[1px] bg-slate-700 mx-1"></div>

            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-slate-200 placeholder-slate-500 caret-amber-500"
              placeholder="Nhập tên món..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-md hover:shadow-orange-500/20 active:scale-95"
            >
              {loading && input.trim() ? <FaSpinner className="animate-spin" /> : <FaPaperPlane size={12} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}