import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiSend, FiSearch, FiMoreVertical, FiUser, FiChevronLeft } from "react-icons/fi"; // Added ChevronLeft
import { useSelector } from "react-redux";
import { db } from "../../../firebase"; 
import { 
  doc, 
  setDoc, 
  addDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";

const Messages = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputText, setInputText] = useState("");
  const containerRef = useRef();

  const loginUser = useSelector((state) => state.auth?.user) || null;
  const members = useSelector((state) => state.auth?.members) || [];

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const name = (member.name || member.displayName || "").toLowerCase();
      return name.includes(searchTerm.toLowerCase()) && member.uid !== loginUser?.uid;
    });
  }, [members, searchTerm, loginUser]);

  const getChatId = (id1, id2) => [id1, id2].sort().join("_");

  useEffect(() => {
    if (!selectedUser || !loginUser) return;
    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    const msgRef = collection(db, "direct_messages", chatId, "messages");
    const q = query(msgRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [selectedUser, loginUser]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser) return;

    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    const msgRef = collection(db, "direct_messages", chatId, "messages");
    const chatDocRef = doc(db, "direct_messages", chatId);

    const messageToSend = inputText;
    setInputText(""); 

    try {
      await setDoc(chatDocRef, {
        participants: [loginUser.uid, selectedUser.uid],
        lastMessage: messageToSend,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await addDoc(msgRef, {
        text: messageToSend,
        senderId: loginUser.uid,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (  
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] bg-white shadow-xl border md:mb-7 border-slate-100 overflow-hidden relative">
      
      {/* --- SIDEBAR --- */}
      {/* Added classes: absolute/hidden/md:relative/md:flex to handle mobile visibility */}
      <div className={`w-full md:w-80 border-r border-slate-50 flex flex-col bg-slate-50/30 transition-all duration-300 ${selectedUser ? "hidden md:flex" : "flex"}`}>
        <div className="p-6">
          <h3 className="text-xl font-black text-slate-800 mb-4">Messages</h3>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search teammates..." 
              className="w-full bg-white border-none rounded-xl py-3 pl-10 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <UserItem 
                key={member.uid}
                name={member.name || member.displayName || "User"} 
                role={member.role || "Member"} 
                active={selectedUser?.uid === member.uid} 
                onClick={() => setSelectedUser(member)} 
              />
            ))
          ) : (
            <p className="text-center text-slate-400 text-xs mt-4">
              {searchTerm ? "No teammates found" : "No other members"}
            </p>
          )}
        </div>
      </div>

      {/* --- CHAT WINDOW --- */}
      {/* Added dynamic classes to show/hide on mobile */}
      <div className={`flex-1 flex flex-col bg-white transition-all duration-300 ${!selectedUser ? "hidden md:flex" : "flex"}`}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                {/* Back button for mobile only */}
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="p-2 -ml-2 text-slate-400 md:hidden"
                >
                  <FiChevronLeft size={24} />
                </button>

                <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                  {selectedUser.name?.[0] || "U"}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-xs md:text-sm">{selectedUser.name}</h4>
                  <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><FiMoreVertical /></button>
            </div>

            {/* Messages Area */}
            <div 
              ref={containerRef} 
              className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-slate-50/20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {messages.map((m) => (
                <MessageBubble 
                  key={m.id} 
                  isMe={m.senderId === loginUser.uid} 
                  text={m.text} 
                  time={m.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                />
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 md:p-6 bg-white border-t border-slate-50">
              <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-indigo-200 transition-all">
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none px-3 md:px-4 py-2 text-sm outline-none" 
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white p-2.5 md:p-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  <FiSend size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FiUser size={36} className="opacity-20 md:size-[40px]" />
            </div>
            <p className="font-black uppercase tracking-widest text-[9px] md:text-[10px]">Select a teammate to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const UserItem = ({ name, role, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "hover:bg-white text-slate-600"}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${active ? "bg-white/20" : "bg-slate-200"}`}>
      {name[0]}
    </div>
    <div className="text-left overflow-hidden">
      <p className="text-sm font-black leading-none truncate">{name}</p>
      <p className={`text-[9px] font-bold uppercase mt-1 truncate ${active ? "text-indigo-100" : "text-slate-400"}`}>{role}</p>
    </div>
  </button>
);

const MessageBubble = ({ isMe, text, time }) => (
  <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
    <div className="group flex flex-col max-w-[85%] md:max-w-sm">
      <div className={`p-3 md:p-4 rounded-2xl text-sm font-medium shadow-sm ${
        isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
      }`}>
        {text}
      </div>
      <span className={`text-[9px] font-bold text-slate-400 mt-1 px-1 ${isMe ? "text-right" : "text-left"}`}>
        {time || "Sending..."}
      </span>
    </div>
  </div>
);

export default Messages;