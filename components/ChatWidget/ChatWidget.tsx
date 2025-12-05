"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithBot } from "@/app/lib/api";
import Link from "next/link";
import { FaPaperPlane, FaComments, FaTimes, FaRobot, FaMapMarkerAlt, FaStar } from "react-icons/fa";

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
      "Xin chào! 👋 Trợ lý VietNomNom (Golden Mode) đây. Bạn muốn ăn gì?",
      "Hello! 🤖 Năng lượng tràn trề! Bạn đang thèm món gì nào?",
      "Chào bạn! 🍜 Phở, cơm, hay lẩu? Mình cân được hết!",
      "Hi there! 👋 Đang đói bụng hả? Nói cho mình biết đi!",
      "Chào đồng chí! 🫡 Sẵn sàng tìm quán ngon 'nhức nách' cho bạn!"
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
      setMessages(prev => [...prev, { id: Date.now(), sender: "bot", text: "Xin lỗi, mình đang mất kết nối. Thử lại sau nhé! 😓" }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* --- NÚT MỞ CHAT (Tông Vàng Kim) --- */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          // [THAY ĐỔI MÀU Ở ĐÂY] Gradient từ vàng sáng đến vàng đậm
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full shadow-lg shadow-yellow-500/40 hover:shadow-yellow-400/60 transition-all duration-300 hover:scale-110 active:scale-95 border border-yellow-300/30"
        >
          <FaComments size={24} className="animate-bounce-slow" />
          <span className="absolute right-16 bg-gray-900 text-yellow-400 text-xs font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-yellow-500/30">
            Chat ngay!
          </span>
        </button>
      )}

      {/* --- KHUNG CHAT CHÍNH --- */}
      {isOpen && (
        <div className="bg-gray-900 w-[380px] h-[600px] rounded-2xl shadow-2xl shadow-black/60 border border-gray-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          {/* HEADER: Gradient Vàng Kim */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 p-4 text-white flex justify-between items-center shadow-md shrink-0 border-b border-yellow-600/20">
            <div className="flex items-center gap-2">
              <div className="bg-black/20 p-2 rounded-full backdrop-blur-sm border border-yellow-400/10">
                <FaRobot size={20} className="text-yellow-100" />
              </div>
              <div>
                {/* [ĐỒNG BỘ MÀU TIÊU ĐỀ TẠI ĐÂY] */}
                <h3 className="font-bold text-base tracking-wide text-white">VietNomNom AI</h3>
                <p className="text-xs text-yellow-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                  Sẵn sàng hỗ trợ
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-black/20 p-2 rounded-full transition-colors text-yellow-100 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>

          {/* BODY: Nền tối */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#0f0f10] space-y-5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {/* Avatar Bot */}
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-white text-xs mr-2 shadow-sm shrink-0 mt-1 border border-yellow-500/20">
                    <FaRobot />
                  </div>
                )}

                <div className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {/* Bong bóng Chat */}
                  <div className={`px-4 py-3 text-sm shadow-md relative ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium rounded-2xl rounded-tr-none shadow-yellow-900/20 border border-yellow-400/10' // User: Vàng Kim
                      : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-2xl rounded-tl-none' // Bot: Xám đậm
                  }`}>
                    {msg.text}
                  </div>

                  {/* KẾT QUẢ TÌM KIẾM (Card) */}
                  {msg.results && msg.results.length > 0 && (
                    <div className="mt-3 w-full space-y-3 pl-1">
                      {msg.results.map((item: any) => (
                        <Link href={`/restaurants/${item._id}`} key={item._id} className="block group">
                          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-sm hover:shadow-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden flex h-24 cursor-pointer transform hover:-translate-y-1">
                            
                            {/* Hình ảnh */}
                            <div className="relative w-24 h-full shrink-0">
                              <img
                                src={item.avatarUrl || "/assets/image/pho.png"}
                                alt={item.tenQuan}
                                referrerPolicy="no-referrer"
                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (!target.src.includes("/assets/image/pho.png")) {
                                     target.src = "/assets/image/pho.png";
                                  }
                                }}
                              />
                            </div>

                            {/* Thông tin */}
                            <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                              <div>
                                {/* Hover text màu vàng */}
                                <h4 className="font-bold text-sm text-gray-100 truncate group-hover:text-yellow-400 transition-colors">
                                  {item.tenQuan}
                                </h4>
                                {/* Icon map màu vàng */}
                                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 truncate">
                                  <FaMapMarkerAlt className="text-yellow-500" /> 
                                  {item.diaChi}
                                </p>
                              </div>
                              
                              <div className="flex justify-between items-end">
                                {/* Giá tiền màu vàng */}
                                <span className="text-xs font-semibold text-yellow-500 bg-yellow-900/20 px-2 py-0.5 rounded-md border border-yellow-500/20">
                                  {item.giaCa ? item.giaCa : "Liên hệ"}
                                </span>
                                <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                                  <FaStar /> {item.diemTrungBinh ? item.diemTrungBinh.toFixed(1) : "N/A"}
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
            
            {/* Hiệu ứng Typing (Màu Vàng) */}
            {loading && (
              <div className="flex justify-start w-full">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-white text-xs mr-2 mt-1 border border-yellow-500/10">
                   <FaRobot />
                </div>
                <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-3 bg-gray-900 border-t border-gray-800 shrink-0">
            <div className="flex items-center gap-2 bg-gray-800 rounded-full px-2 py-2 border border-gray-700 focus-within:border-yellow-500/50 focus-within:bg-gray-800 focus-within:shadow-lg focus-within:shadow-yellow-500/10 transition-all">
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-sm px-3 text-gray-200 placeholder-gray-500 caret-yellow-500"
                placeholder="Hôm nay bạn muốn ăn gì?..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                // Gradient nút gửi màu vàng
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:scale-105 active:scale-95"
              >
                <FaPaperPlane size={14} className="-ml-0.5 mt-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}