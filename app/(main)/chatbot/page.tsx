"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithBot, searchRestaurantsByImage } from "@/app/lib/api"; // [MỚI] Import thêm hàm search ảnh
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPaperPlane, FaRobot, FaMapMarkerAlt, FaStar, FaEraser, FaChevronLeft, FaStore, FaMagic, FaImage, FaSpinner } from "react-icons/fa";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  results?: any[];
  isImage?: boolean; // [MỚI] Đánh dấu nếu là tin nhắn ảnh
  imageUrl?: string; // [MỚI] Để hiển thị preview ảnh user gửi
}

export default function ChatbotPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // [MỚI] Ref cho input file

  // 1. Random câu chào
  useEffect(() => {
    const greetings = [
      "Chào bạn! 👋 Hôm nay chúng ta sẽ khám phá món ngon nào đây?",
      "Hello! 🥘 Đang đói bụng phải không? Gửi tên món hoặc hình ảnh để mình tìm quán nhé!",
      "VietNomNom xin chào! 🍜 Phở, cơm, hay lẩu? Mình cân được hết!",
      "Hi there! ✨ Bạn có thể gửi ảnh món ăn để mình nhận diện giúp bạn nha!",
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
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, loading]);

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

  // --- [MỚI] XỬ LÝ GỬI ẢNH ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Hiển thị tin nhắn user gửi ảnh
    const imageUrl = URL.createObjectURL(file);
    const userMsg: Message = { 
      id: Date.now(), 
      sender: "user", 
      text: "Đã gửi một hình ảnh...", 
      isImage: true,
      imageUrl: imageUrl 
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // 2. Gọi API Search by Image
    try {
      const res = await searchRestaurantsByImage(file);
      
      setLoading(false);

      if (res && res.detectedFood) {
        // Tìm thấy món
        const detectedName = res.detectedFood; // Tên món AI đoán (Vd: Phở)
        const restaurants = res.data || [];
        
        const botMsg: Message = {
          id: Date.now() + 1,
          sender: "bot",
          text: `Wow! Mình nhận ra đây là món **"${detectedName}"**. 😋 Dưới đây là những quán bán món này ngon nhất mình tìm được:`,
          results: restaurants
        };
        setMessages(prev => [...prev, botMsg]);

      } else {
        // Không tìm thấy
        const botMsg: Message = {
          id: Date.now() + 1,
          sender: "bot",
          text: "Hmm... Hình ảnh hơi khó nhận diện. Bạn thử chụp rõ hơn hoặc nhập tên món ăn xem sao nhé! 🤔"
        };
        setMessages(prev => [...prev, botMsg]);
      }

    } catch (error) {
      setLoading(false);
      setMessages(prev => [...prev, { id: Date.now(), sender: "bot", text: "Lỗi khi xử lý hình ảnh. Bạn thử lại sau nhé!" }]);
    }

    // Reset input để chọn lại cùng 1 ảnh nếu muốn
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleClearChat = () => {
    setMessages([{ id: Date.now(), sender: "bot", text: "Lịch sử đã xóa. Chúng ta bắt đầu lại nhé! 🚀" }]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden overscroll-none selection:bg-amber-500/30">
      
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000"></div>
      
      {/* --- HEADER --- */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center shadow-lg relative z-20 shrink-0">
        <div className="flex items-center gap-5">
          <button onClick={() => router.push('/')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all group border border-white/5">
            <FaChevronLeft className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur opacity-40"></div>
              <div className="relative w-11 h-11 bg-slate-900 rounded-full flex items-center justify-center border border-white/10">
                <FaRobot size={22} className="text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                NomNom Assistant <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20">AI</span>
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
        <button onClick={handleClearChat} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-white/5 text-sm font-medium">
          <FaEraser /> <span className="hidden md:inline">Làm mới</span>
        </button>
      </header>

      {/* --- CHAT BODY --- */}
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
                
                {/* [MỚI] HIỂN THỊ ẢNH USER GỬI */}
                {msg.isImage && msg.imageUrl && (
                    <div className="mb-2 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-lg max-w-[200px]">
                        <img src={msg.imageUrl} alt="Uploaded food" className="w-full h-auto object-cover" />
                    </div>
                )}

                {/* Bong bóng Chat */}
                <div className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-lg backdrop-blur-sm relative ${
                    msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl rounded-tr-sm shadow-orange-500/20' 
                    : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-2xl rounded-tl-sm'
                }`}>
                    {/* Render text có in đậm */}
                    {msg.text.split("**").map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="text-amber-300">{part}</strong> : part
                    )}
                </div>

                {/* --- GRID KẾT QUẢ --- */}
                {msg.results && msg.results.length > 0 && (
                    <div className="mt-6 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {msg.results.map((item: any) => (
                        <Link href={`/restaurants/${item._id}`} key={item._id} className="block group h-full">
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
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                              <div className="absolute top-3 right-3 flex gap-2">
                                <div className="bg-slate-900/80 backdrop-blur text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10 shadow-sm">
                                    <FaStar size={10} /> {item.diemTrungBinh ? item.diemTrungBinh.toFixed(1) : "N/A"}
                                </div>
                              </div>
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
                                  <span className="text-xs text-slate-300">
                                      {item.giaCa || "Đang cập nhật"}
                                  </span>
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
            
            {loading && (
            <div className="flex justify-start w-full">
                <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-amber-500 text-sm mr-3 mt-1 border border-slate-700">
                   <FaRobot />
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  {/* Hiệu ứng loading dạng sóng */}
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

      {/* --- INPUT AREA --- */}
      <div className="p-4 md:p-6 shrink-0 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-xl rounded-2xl px-2 py-2 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.3)] focus-within:border-amber-500/50 focus-within:shadow-[0_8px_30px_rgba(245,158,11,0.2)] transition-all duration-300">
            
            {/* [MỚI] NÚT UPLOAD ẢNH */}
            <div className="relative group">
                <input 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors disabled:opacity-50"
                    disabled={loading}
                    title="Gửi ảnh món ăn"
                >
                    <FaImage size={20} />
                </button>
            </div>

            <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-base px-2 text-slate-200 placeholder-slate-500 caret-amber-500 h-11"
              placeholder="Bạn muốn tìm món gì? (hoặc gửi ảnh món ăn...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95"
            >
              {loading && input.trim() ? <FaSpinner className="animate-spin" /> : <FaPaperPlane size={18} className="-ml-0.5 mt-0.5" />}
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