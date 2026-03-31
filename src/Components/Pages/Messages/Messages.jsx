import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiSend, FiSearch, FiMoreVertical, FiUser, FiChevronLeft, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";
import { db } from "../../../firebase"; 
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";

// --- MEETING MODAL ---
const MeetingModal = ({ users, onClose, onCreate }) => {
  const [selected, setSelected] = useState([]);
  const toggleUser = (user) => {
    setSelected(prev => prev.find(u => u.uid === user.uid) ? prev.filter(u => u.uid !== user.uid) : [...prev, user]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100">
        <h2 className="text-xl font-black text-slate-800 mb-4">Create Team Meeting</h2>
        <div className="max-h-60 overflow-y-auto no-scrollbar space-y-2 mb-6 pr-2">
          {users.map(user => (
            <label key={user.uid} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-all">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={!!selected.find(u => u.uid === user.uid)} onChange={() => toggleUser(user)} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">{user.name || user.email}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{user.role}</span>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
          <button onClick={() => onCreate(selected)} disabled={selected.length === 0} className="flex-1 bg-indigo-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold">Start Meeting</button>
        </div>
      </div>
    </div>
  );
};

const Messages = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null); 
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Selection States
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const containerRef = useRef();
  const typingTimeoutRef = useRef(null);
  const loginUser = useSelector((state) => state.auth?.user) || null;
  const members = useSelector((state) => state.auth?.members) || [];

  const getChatId = (id1, id2) => [id1, id2].sort().join("_");

  const filteredMembers = useMemo(() => {
    return members.filter((m) => (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) && m.uid !== loginUser?.uid);
  }, [members, searchTerm, loginUser]);

  // --- LISTENERS ---
  useEffect(() => {
    if (!selectedUser || !loginUser) return;
    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    const q = query(collection(db, "direct_messages", chatId, "messages"), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        messageId: doc.data().messageId || doc.id // Fallback for old messages
      })));
    });
    return () => unsubscribe();
  }, [selectedUser, loginUser]);

  useEffect(() => {
    if (!selectedUser || !loginUser) return;
    const unsub = onSnapshot(doc(db, "direct_messages", getChatId(loginUser.uid, selectedUser.uid)), (snap) => {
      if (snap.exists()) setIsTyping(snap.data()[`typing.${selectedUser.uid}`] === true);
    });
    return () => unsub();
  }, [selectedUser, loginUser]);

  // --- ACTIONS ---
  const handleTyping = async (e) => {
    setInputText(e.target.value);
    if (!selectedUser || !loginUser) return;
    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    await setDoc(doc(db, "direct_messages", chatId), { [`typing.${loginUser.uid}`]: true }, { merge: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await setDoc(doc(db, "direct_messages", chatId), { [`typing.${loginUser.uid}`]: false }, { merge: true });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser || !loginUser) return;
    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    const text = inputText;
    setInputText("");

    try {
      if (editingMessage) {
        const id = editingMessage.messageId || editingMessage.id;
        await updateDoc(doc(db, "direct_messages", chatId, "messages", id), { text, isEdited: true });
        setEditingMessage(null);
      } else {
        const msgRef = doc(collection(db, "direct_messages", chatId, "messages"));
        await setDoc(msgRef, { messageId: msgRef.id, text, senderId: loginUser.uid, timestamp: serverTimestamp() });
        await setDoc(doc(db, "direct_messages", chatId), { lastMessage: text, updatedAt: serverTimestamp(), [`typing.${loginUser.uid}`]: false }, { merge: true });
      }
    } catch (err) { console.error(err); }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} messages?`)) return;
    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    const batch = writeBatch(db);
    selectedIds.forEach(id => batch.delete(doc(db, "direct_messages", chatId, "messages", id)));
    await batch.commit();
    exitSelection();
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const exitSelection = () => {
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-white shadow-xl border border-red-400 overflow-hidden relative font-sans">
      {isModalOpen && <MeetingModal users={filteredMembers} onClose={() => setIsModalOpen(false)} onCreate={() => {}} />}

      {/* Sidebar */}
      <div className={`${selectedUser ? "hidden" : "flex"} w-full md:w-80 md:flex border-w flex-col bg-slate-50/30`}>
        <div className="p-6">
          <div className="flex justify-between mb-4 items-center">
            <h3 className="text-xl font-black text-slate-800">Messages</h3>
            <button onClick={() => setIsModalOpen(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FiPlus /></button>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full bg-white rounded-xl py-3 pl-10 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {filteredMembers.map(m => <UserItem key={m.uid} member={m} active={selectedUser?.uid === m.uid} onClick={() => setSelectedUser(m)} />)}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`${!selectedUser ? "hidden" : "flex"} flex-1 md:flex flex-col bg-white`}>
        {selectedUser ? (
          <>
            {/* Dynamic Header */}
            <div className="p-4 border-w flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                {isSelectionMode ? (
                  <button onClick={exitSelection} className="p-2 hover:bg-slate-100 rounded-full"><FiX /></button>
                ) : (
                  <button onClick={() => setSelectedUser(null)} className="md:hidden"><FiChevronLeft size={24} /></button>
                )}
                <div>
                  <h4 className="font-black text-slate-800">{isSelectionMode ? `${selectedIds.length} Selected` : selectedUser.name}</h4>
                  {!isSelectionMode && <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> Online</span>}
                </div>
              </div>
              {isSelectionMode ? (
                <button onClick={handleBulkDelete} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-red-100 transition-all"><FiTrash2 /> Delete Selected</button>
              ) : (
                <button className="text-slate-400"><FiMoreVertical /></button>
              )}
            </div>

            {/* Messages Area */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/20">
              {messages.map((m) => (
                <MessageBubble 
                  key={m.id} 
                  msg={m} 
                  isMe={m.senderId === loginUser.uid} 
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedIds.includes(m.messageId)}
                  onSelect={toggleSelect}
                  onLongPress={() => setIsSelectionMode(true)}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  onEdit={() => { setInputText(m.text); setEditingMessage(m); setActiveMenuId(null); }}
                  onDelete={async (id) => await deleteDoc(doc(db, "direct_messages", getChatId(loginUser.uid, selectedUser.uid), "messages", id))}
                />
              ))}
              {isTyping && <div className="text-indigo-500 text-[10px] font-black italic animate-pulse">{selectedUser.name} is typing...</div>}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-w">
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-indigo-200">
                <input value={inputText} onChange={handleTyping} placeholder={editingMessage ? "Editing message..." : "Type a message..."} className="flex-1 bg-transparent px-4 py-2 text-sm outline-none" />
                <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"><FiSend size={18} /></button>
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
const UserItem = ({ member, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${active ? "bg-indigo-600 text-white shadow-xl" : "hover:bg-white text-slate-600"}`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${active ? "bg-white/20" : "bg-slate-200 text-slate-500"}`}>{member.name?.[0].toUpperCase()}</div>
    <div className="text-left flex-1 truncate">
      <p className="text-sm font-black truncate">{member.name}</p>
      <p className={`text-[10px] font-bold uppercase ${active ? "text-indigo-100" : "text-slate-400"}`}>{member.role}</p>
    </div>
  </button>
);

const MessageBubble = ({ msg, isMe, isSelectionMode, isSelected, onSelect, onLongPress, activeMenuId, setActiveMenuId, onEdit, onDelete }) => {
  const mid = msg.messageId;
  const isMenuOpen = activeMenuId === mid;

  const handleContext = (e) => {
    e.preventDefault();
    onLongPress();
    onSelect(mid);
  };

  return (
    <div 
      onClick={() => isSelectionMode && onSelect(mid)}
      onContextMenu={handleContext}
      className={`flex items-center gap-3 w-full group transition-all duration-200 ${isSelected ? "bg-indigo-50/50 rounded-lg" : ""}`}
    >
      {isSelectionMode && <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 rounded border-slate-300 text-indigo-600" />}
      
      <div className={`flex-1 flex ${isMe ? "justify-end" : "justify-start"} relative`}>
        <div className={`relative flex flex-col items-${isMe ? "end" : "start"} max-w-[85%] sm:max-w-[70%]`}>
          
          {/* Menu Dropdown */}
          {isMe && !isSelectionMode && isMenuOpen && (
            <div className="absolute -top-12 right-0 z-20 bg-white border shadow-xl rounded-xl py-1 w-24 animate-in fade-in zoom-in duration-150">
              <button onClick={() => onEdit()} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Edit</button>
              <button onClick={() => onDelete(mid)} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50">Delete</button>
            </div>
          )}

          <div className={`p-3 md:p-4 rounded-2xl text-sm font-medium shadow-sm transition-all ${
            isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
          }`}>
            {msg.text}
            {msg.isEdited && <span className="text-[8px] opacity-70 ml-2">(edited)</span>}
          </div>

          {/* Three Dots - Only show for user's own messages when NOT in selection mode */}
          {isMe && !isSelectionMode && (
            <button onClick={() => setActiveMenuId(isMenuOpen ? null : mid)} className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600">
              <FiMoreVertical size={14} />
            </button>
          )}

          <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
            {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "..."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Messages;