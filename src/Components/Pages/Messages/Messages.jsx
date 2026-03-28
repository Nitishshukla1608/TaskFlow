import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiSend, FiSearch, FiMoreVertical, FiUser, FiChevronLeft, FiPlus } from "react-icons/fi";
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

// --- MEETING MODAL COMPONENT ---
const MeetingModal = ({ users, onClose, onCreate }) => {
  const [selected, setSelected] = useState([]);
  const toggleUser = (user) => {
    setSelected(prev =>
      prev.find(u => u.uid === user.uid)
        ? prev.filter(u => u.uid !== user.uid)
        : [...prev, user]
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100">
        <h2 className="text-xl font-black text-slate-800 mb-4">Create Team Meeting</h2>
        <div className="max-h-60 overflow-y-auto no-scrollbar space-y-2 mb-6 pr-2">
          {users.map(user => (
            <label key={user.uid} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-all">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={!!selected.find(u => u.uid === user.uid)}
                onChange={() => toggleUser(user)}
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">{user.name || user.email}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{user.role}</span>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
          <button
            onClick={() => onCreate(selected)}
            disabled={selected.length === 0}
            className="flex-1 bg-indigo-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Start Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

const Messages = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const containerRef = useRef();
  const typingTimeoutRef = useRef(null);

  const loginUser = useSelector((state) => state.auth?.user) || null;
  const members = useSelector((state) => state.auth?.members) || [];

  const getChatId = (id1, id2) => [id1, id2].sort().join("_");

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const name = (member.name || member.displayName || "").toLowerCase();
      return name.includes(searchTerm.toLowerCase()) && member.uid !== loginUser?.uid;
    });
  }, [members, searchTerm, loginUser]);

  const handleCreateMeeting = (selectedUsers) => {
    const emails = selectedUsers.map(user => user.email);
    console.log("Creating meeting with:", emails);
    setIsModalOpen(false);
  };

  // Typing Logic with Ref fix
  const handleTyping = async (e) => {
    const value = e.target.value;
    setInputText(value);
    
    if (!selectedUser || !loginUser) return;
    const chatId = getChatId(loginUser.uid, selectedUser.uid);

    await setDoc(doc(db, "direct_messages", chatId), {
      [`typing.${loginUser.uid}`]: true
    }, { merge: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(async () => {
      await setDoc(doc(db, "direct_messages", chatId), {
        [`typing.${loginUser.uid}`]: false
      }, { merge: true });
    }, 2000);
  };

  // Messages Listener
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

  // Typing Status Listener
  useEffect(() => {
    if (!selectedUser || !loginUser) return;
    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    
    const unsub = onSnapshot(doc(db, "direct_messages", chatId), (snap) => {
      const typingData = snap.data()?.typing || {};
      const someoneTyping = Object.entries(typingData).some(
        ([uid, val]) => uid !== loginUser.uid && val
      );
      setIsTyping(someoneTyping);
    });
    return () => unsub();
  }, [selectedUser, loginUser]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser || !loginUser) return;

    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    const msgRef = collection(db, "direct_messages", chatId, "messages");
    const chatDocRef = doc(db, "direct_messages", chatId);

    const messageToSend = inputText;
    setInputText(""); 

    try {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      await setDoc(chatDocRef, {
        participants: [loginUser.uid, selectedUser.uid],
        lastMessage: messageToSend,
        updatedAt: serverTimestamp(),
        [`typing.${loginUser.uid}`]: false 
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
    <div className="flex h-[calc(100vh-80px)] w-full max-w-full bg-white shadow-xl border border-slate-100 overflow-hidden relative">
      {isModalOpen && (
        <MeetingModal 
          users={filteredMembers} 
          onClose={() => setIsModalOpen(false)} 
          onCreate={handleCreateMeeting} 
        />
      )}

      {/* --- SIDEBAR --- */}
      <div className={`${selectedUser ? "hidden" : "flex"} w-full md:w-80 md:flex border-r border-slate-50 flex-col bg-slate-50/30 transition-all duration-300`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-slate-800">Messages</h3>
            <button onClick={() => setIsModalOpen(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all">
              <FiPlus size={20} />
            </button>
          </div>
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
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-2">
          {filteredMembers.map((member) => (
            <UserItem 
              key={member.uid}
              name={member.name || member.displayName || "User"} 
              role={member.role || "Member"} 
              active={selectedUser?.uid === member.uid} 
              onClick={() => setSelectedUser(member)} 
            />
          ))}
        </div>
      </div>

      {/* --- CHAT WINDOW --- */}
      <div className={`${!selectedUser ? "hidden" : "flex"} flex-1 md:flex flex-col bg-white transition-all duration-300 w-full`}>
        {selectedUser ? (
          <>
            <div className="p-4 md:p-5 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <button onClick={() => setSelectedUser(null)} className="p-2 -ml-2 text-slate-400 md:hidden"><FiChevronLeft size={24} /></button>
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

            <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-4 md:p-8 space-y-4 bg-slate-50/20 scroll-smooth">
              {messages.map((m) => (
                <MessageBubble 
                  key={m.id} 
                  isMe={m.senderId === loginUser.uid} 
                  text={m.text} 
                  time={m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending..."} 
                />
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <p className="text-indigo-500 text-[10px] font-bold italic animate-bounce px-2">
                    {selectedUser.name} is typing...
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 md:p-6 bg-white border-t border-slate-50 w-full">
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-indigo-200 transition-all">
                <input 
                  value={inputText}
                  onChange={handleTyping}
                  placeholder="Type a message..." 
                  className="flex-1 min-w-0 bg-transparent border-none px-2 md:px-4 py-2 text-sm outline-none" 
                />
                <button type="submit" className="shrink-0 bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                  <FiSend size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <FiUser size={48} className="opacity-10 mb-4" />
            <p className="font-black uppercase tracking-widest text-[10px]">Select a teammate to start</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const UserItem = ({ name, role, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "hover:bg-white text-slate-600 bg-transparent"}`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${active ? "bg-white/20" : "bg-slate-200 text-slate-500"}`}>
      {name ? name[0].toUpperCase() : "U"}
    </div>
    <div className="text-left overflow-hidden flex-1">
      <p className="text-sm font-black leading-none truncate mb-1.5">{name}</p>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${role === "Admin" ? "bg-amber-400" : "bg-emerald-400"}`} />
        <span className={`text-[10px] font-bold uppercase tracking-tight ${active ? "text-indigo-100" : "text-slate-400"}`}>{role}</span>
      </div>
    </div>
  </button>
);

const MessageBubble = ({ isMe, text, time }) => (
  <div className={`flex ${isMe ? "justify-end" : "justify-start"} w-full mb-1`}>
    <div className={`group flex flex-col items-${isMe ? "end" : "start"} max-w-[85%] sm:max-w-[70%]`}>
      <div className={`p-3 md:p-4 rounded-2xl text-sm font-medium shadow-sm break-words whitespace-pre-wrap ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-100"}`}>
        {text}
      </div>
      <span className="text-[9px] font-bold text-slate-400 mt-1 px-1 uppercase">
        {time}
      </span>
    </div>
  </div>
);

export default Messages;