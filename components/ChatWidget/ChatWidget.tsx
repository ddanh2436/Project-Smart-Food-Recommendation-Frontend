"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithBot } from "@/app/lib/api";
import Link from "next/link";
import { FaPaperPlane, FaComments, FaTimes, FaRobot, FaMapMarkerAlt, FaStar, FaStore } from "react-icons/fa";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  results?: any[];
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Random câu chào
  useEffect(() => {
    const greetings = [
      "Xin chào! 👋 VietNomNom (Golden Edition) đây. Bạn muốn ăn gì?",
      "Hello! 🤖 Màu vàng may mắn! Bạn đang thèm món gì nào?",
      "Chào bạn! 🍜 Phở, cơm, hay lẩu? Mình cân được hết!",
      "Hi there! 👋 Hôm nay ăn gì nhỉ? Gõ tên món vào đây nhé!",
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

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* --- NÚT MỞ CHAT (Tông Vàng) --- */}
      <div className={`transition-all duration-300 ${isOpen ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <button 
          onClick={() => setIsOpen(true)}
          // Gradient Vàng rực rỡ
          className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full shadow-xl shadow-yellow-500/40 hover:shadow-yellow-400/60 transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20"
        >
          <FaComments size={28} className="animate-bounce-slow drop-shadow-md text-white" />
          
          {/* Tooltip */}
          <span className="absolute right-20 bg-gray-900 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700">
            Chat ngay!
          </span>
          
          {/* Ping effect (Màu vàng) */}
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 border-2 border-white"></span>
          </span>
        </button>
      </div>

      {/* --- KHUNG CHAT CHÍNH (Glassmorphism + Vàng) --- */}
      <div 
        className={`fixed bottom-6 right-6 w-[380px] h-[600px] bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/50 border border-gray-700 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        
        {/* HEADER: Gradient Vàng Kim */}
        <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 p-4 flex justify-between items-center shadow-lg shrink-0 relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-white/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/20 shadow-inner">
              <FaRobot size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-wide drop-shadow-sm">VietNomNom AI</h3>
              <p className="text-[11px] text-yellow-100 flex items-center gap-1.5 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Sẵn sàng hỗ trợ
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="relative z-10 hover:bg-white/20 p-2 rounded-full transition-colors text-white/90 hover:text-white"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent bg-gradient-to-b from-gray-900 to-gray-950">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Avatar Bot */}
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-yellow-500 text-xs mr-2 shadow-md shrink-0 mt-1 border border-gray-600">
                  <FaRobot />
                </div>
              )}

              <div className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Text Bubble */}
                <div className={`px-4 py-2.5 text-[14px] leading-relaxed shadow-md backdrop-blur-sm ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white font-medium rounded-2xl rounded-tr-sm shadow-yellow-900/20 border border-white/10' // User: Vàng
                    : 'bg-gray-800/80 border border-gray-700 text-gray-200 rounded-2xl rounded-tl-sm' // Bot: Xám
                }`}>
                  {msg.text}
                </div>

                {/* --- CARD KẾT QUẢ TÌM KIẾM --- */}
                {msg.results && msg.results.length > 0 && (
                  <div className="mt-3 w-full space-y-2.5 pl-1">
                    {msg.results.map((item: any) => (
                      <Link href={`/restaurants/${item._id}`} key={item._id} className="block group">
                        <div className="bg-gray-800/60 hover:bg-gray-800 rounded-xl border border-gray-700/50 hover:border-yellow-500/50 shadow-sm hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 flex overflow-hidden cursor-pointer h-[88px] relative group">
                          
                          {/* Dải màu hover bên trái (Vàng) */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          {/* Hình ảnh */}
                          <div className="relative w-[88px] h-full shrink-0">
                            <img
                              src={item.avatarUrl || "/assets/image/pho.png"}
                              alt={item.tenQuan}
                              referrerPolicy="no-referrer"
                              className="object-cover w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes("/assets/image/pho.png")) {
                                   target.src = "/assets/image/pho.png";
                                }
                              }}
                            />
                            {/* Rating Badge Overlay */}
                            <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                               <FaStar size={8} /> {item.diemTrungBinh ? item.diemTrungBinh.toFixed(1) : "N/A"}
                            </div>
                          </div>

                          {/* Thông tin */}
                          <div className="p-2.5 flex flex-col justify-between flex-1 min-w-0">
                            <div>
                              {/* Tên quán hover màu vàng */}
                              <h4 className="font-bold text-[13px] text-gray-100 truncate group-hover:text-yellow-400 transition-colors leading-tight">
                                {item.tenQuan}
                              </h4>
                              {/* Icon map màu vàng */}
                              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 truncate">
                                <FaMapMarkerAlt className="text-gray-500 group-hover:text-yellow-500 transition-colors shrink-0" size={10} /> 
                                {item.diaChi}
                              </p>
                            </div>
                            
                            <div className="flex justify-between items-center mt-1">
                              {/* Giá tiền viền vàng */}
                              <span className="text-[10px] font-medium text-yellow-500 bg-yellow-950/30 px-2 py-0.5 rounded border border-yellow-500/20">
                                {item.giaCa ? item.giaCa : "Đang cập nhật"}
                              </span>
                              
                              <div className="bg-gray-700/50 p-1 rounded-full group-hover:bg-yellow-500 group-hover:text-white transition-colors text-gray-400">
                                 <FaStore size={10} />
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
          
          {/* Typing Animation */}
          {loading && (
            <div className="flex justify-start w-full animate-fade-in">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-yellow-500 text-xs mr-2 mt-1 border border-gray-700">
                 <FaRobot />
              </div>
              <div className="bg-gray-800 border border-gray-700 px-3 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-3 bg-gray-900 border-t border-gray-800 shrink-0 relative z-20">
          <div className="flex items-center gap-2 bg-gray-950 rounded-full px-1.5 py-1.5 border border-gray-800 focus-within:border-yellow-500/50 focus-within:bg-black focus-within:shadow-[0_0_15px_rgba(250,204,21,0.15)] transition-all duration-300">
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-sm px-4 text-gray-200 placeholder-gray-500 caret-yellow-500 h-9"
              placeholder="Hôm nay ăn gì?..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              // Nút gửi Gradient Vàng
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-md hover:shadow-yellow-500/30 hover:scale-105 active:scale-95"
            >
              <FaPaperPlane size={13} className="-ml-0.5 mt-0.5" />
            </button>
          </div>
          <div className="text-center mt-1">
             <span className="text-[9px] text-gray-600">Powered by AI &bull; Kết quả có thể thay đổi</span>
          </div>
        </div>
      </div>
    </div>
  );
}