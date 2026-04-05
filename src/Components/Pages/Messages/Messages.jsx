import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  FiSend, FiSearch, FiMoreVertical, FiUser, FiChevronLeft, 
  FiPlus, FiTrash2, FiX, FiVideo, FiPhoneCall, FiMail 
} from "react-icons/fi"; 
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';
import { db } from "../../../firebase"; 
import { 
  doc, setDoc, collection, query, orderBy, onSnapshot, 
  serverTimestamp, updateDoc, deleteDoc, writeBatch, addDoc, where 
} from "firebase/firestore";

// --- 1. MEETING MODAL (VIDEO CALL) ---
const MeetingModal = ({ users, onClose, onCreate, onOpenMail }) => {
  const [selected, setSelected] = useState([]);
  const toggleUser = (user) => {
    setSelected(prev => prev.find(u => u.uid === user.uid) ? prev.filter(u => u.uid !== user.uid) : [...prev, user]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-indigo-100/50">
          <FiVideo size={28} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-1 uppercase tracking-tighter">Video Call</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-8">Select members to invite</p>
        
        <div className="max-h-60 overflow-y-auto no-scrollbar space-y-2 mb-8 pr-2 text-left">
          {users.map(user => (
            <label key={user.uid} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border transition-all ${selected.find(u => u.uid === user.uid) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
              <input type="checkbox" className="w-5 h-5 rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={!!selected.find(u => u.uid === user.uid)} onChange={() => toggleUser(user)} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">{user.name || user.email}</span>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{user.role}</span>
              </div>
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
             <button onClick={onClose} className="flex-1 px-4 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 uppercase text-[10px] tracking-widest">Cancel</button>
             <button onClick={() => onCreate(selected)} disabled={selected.length === 0} className="flex-1 bg-indigo-600 disabled:opacity-50 text-white px-4 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Start Now</button>
          </div>
          <button onClick={() => onOpenMail(selected)} disabled={selected.length === 0} className="w-full bg-slate-800 disabled:opacity-50 text-white px-4 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
            <FiMail /> Send Meeting Details via Mail
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. MEET MAIL MODAL (EMAILJS) ---
const MeetMailModal = ({ selectedUsers, onClose, onSend }) => {
  const [details, setDetails] = useState({ link: '', password: '', code: '' });
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[160] p-4">
      <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Schedule Mail</h2>
           <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-rose-500"><FiX /></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Meeting Link</label>
            <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="https://meet.google.com/..." value={details.link} onChange={(e)=>setDetails({...details, link: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Secret Code</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="XYZ-123" value={details.code} onChange={(e)=>setDetails({...details, code: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Password</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="123456" value={details.password} onChange={(e)=>setDetails({...details, password: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-indigo-50 rounded-2xl mb-6">
           <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">Sending to {selectedUsers.length} participants...</p>
        </div>

        <button 
          onClick={async () => {
            setLoading(true);
            await onSend(details, selectedUsers);
            setLoading(false);
          }} 
          disabled={!details.link || loading}
          className="w-full bg-indigo-600 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
        >
          {loading ? "Sending..." : "Send Invitations"}
        </button>
      </div>
    </div>
  );
};

// --- MAIN MESSAGES COMPONENT ---
const Messages = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null); 
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMeetMailModel, setIsMeetMailModel] = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [activeCall, setActiveCall] = useState(null);

  const containerRef = useRef();
  const typingTimeoutRef = useRef(null);
  const loginUser = useSelector((state) => state.auth?.user) || null;
  const members = useSelector((state) => state.auth?.members) || [];

  const getChatId = (id1, id2) => [id1, id2].sort().join("_");

  // Border Color Logic
  const borderColor = useMemo(() => {
    const borderColors = ["border-indigo-500", "border-blue-500", "border-emerald-500", "border-amber-500", "border-red-500", "border-violet-500"];
    return borderColors[Math.floor(Math.random() * borderColors.length)];
  }, [selectedUser?.uid]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) && m.uid !== loginUser?.uid);
  }, [members, searchTerm, loginUser]);

  // --- 1. LISTEN FOR ACTIVE CALLS ---
  useEffect(() => {
    if (!loginUser) return;
    const q = query(collection(db, "activeCalls"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const calls = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveCall(calls[0] || null); 
    });
    return () => unsubscribe();
  }, [loginUser]);

  const isParticipant = useMemo(() => {
    if (!activeCall || !loginUser) return false;
    return activeCall.hostId === loginUser.uid || activeCall.participants?.includes(loginUser.uid);
  }, [activeCall, loginUser]);

  // --- 2. HANDLERS ---
  const handleEndCall = async (callDocId) => {
    if (!callDocId) return;
    try {
      const callRef = doc(db, "activeCalls", callDocId);
      await updateDoc(callRef, { status: "inactive", endedAt: serverTimestamp() });
      setActiveCall(null);
    } catch (err) { console.error(err); }
  };

  const handleCreateMeeting = async (selectedUsers) => {
    if (!loginUser) return;
    const channelName = `call_${Math.random().toString(36).substring(7)}`;
    const participantIds = selectedUsers.map(u => u.uid);
    try {
      await addDoc(collection(db, "activeCalls"), {
        channelId: channelName,
        hostId: loginUser.uid,
        hostName: loginUser.name || "Admin",
        participants: participantIds,
        status: "active",
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      navigate(`/video-call/${channelName}`);
    } catch (err) { console.error(err); }
  };

  // EMAILJS INTEGRATION
  const handleMailCreateMeeting = async (details, selectedUsers) => {
    const serviceID = 'service_d6r58da'; // EmailJS Service ID
    const templateID = 'template_yddpbhe'; // EmailJS Template ID
    const publicKey = 'RG-epL79tbuC7qcZI'; // EmailJS Public Key

    try {
      const emailPromises = selectedUsers.map(u => {
        const templateParams = {
          to_name: u.name,
          to_email: u.email,
          from_name: loginUser.name,
          from_email:loginUser.email,
          meet_link: details.link,
          meet_code: details.code,
          meet_pass: details.password
        };
        return emailjs.send(serviceID, templateID, templateParams, publicKey);
      });

      await Promise.all(emailPromises);
      alert("All invitation emails sent successfully!");
      setIsMeetMailModel(false);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Email Error:", err);
      alert("Failed to send some emails.");
    }
  };

  const handleVideoAction = () => {
    if (activeCall) {
      if (isParticipant) navigate(`/video-call/${activeCall.channelId}`);
      return;
    }
    setIsModalOpen(true);
  };

  // Messaging Logic
  useEffect(() => {
    if (!selectedUser || !loginUser) return;
    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    const q = query(collection(db, "direct_messages", chatId, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [selectedUser, loginUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser || !loginUser) return;
    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    const text = inputText;
    setInputText("");
    try {
      if (editingMessage) {
        await updateDoc(doc(db, "direct_messages", chatId, "messages", editingMessage.id), { text, isEdited: true });
        setEditingMessage(null);
      } else {
        const msgRef = doc(collection(db, "direct_messages", chatId, "messages"));
        await setDoc(msgRef, { text, senderId: loginUser.uid, timestamp: serverTimestamp() });
        await setDoc(doc(db, "direct_messages", chatId), { lastMessage: text, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (err) { console.error(err); }
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const exitSelection = () => { setSelectedIds([]); setIsSelectionMode(false); };

  return (
    <div className={`flex h-[calc(100vh-80px)] w-full bg-white shadow-xl border ${selectedUser ? borderColor : 'border-slate-100'} overflow-hidden relative font-sans transition-all duration-500`}>
      
      {/* ACTIVE CALL BUBBLE */}
      {activeCall && isParticipant && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2">
          <button onClick={() => navigate(`/video-call/${activeCall.channelId}`)} className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 border-2 border-white animate-bounce">
            <FiPhoneCall size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Join Live</span>
          </button>
          {activeCall.hostId === loginUser.uid && (
            <button onClick={() => handleEndCall(activeCall.id)} className="bg-rose-500 text-white p-3.5 rounded-full border-2 border-white shadow-lg"><FiX size={18} /></button>
          )}
        </div>
      )}

      {/* MODALS */}
      {isModalOpen && (
        <MeetingModal 
          users={filteredMembers} 
          onClose={() => setIsModalOpen(false)} 
          onCreate={handleCreateMeeting} 
          onOpenMail={(users) => { setTempSelectedUsers(users); setIsMeetMailModel(true); }}
        />
      )}

      {isMeetMailModel && (
        <MeetMailModal 
          selectedUsers={tempSelectedUsers} 
          onClose={() => setIsMeetMailModel(false)} 
          onSend={handleMailCreateMeeting} 
        />
      )}

      {/* SIDEBAR */}
      <div className={`${selectedUser ? "hidden" : "flex"} w-full md:w-80 md:flex flex-col bg-slate-50/50 border-r border-slate-100`}>
        <div className="p-6">
          <div className="flex justify-between mb-4 items-center">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Messages</h3>
            <button onClick={handleVideoAction} className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 shadow-xl transition-all active:scale-90">
              <FiVideo size={20} />
            </button>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search workspace..." className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-10 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-2 pb-6">
          {filteredMembers.map(m => (
            <button key={m.uid} onClick={() => { setSelectedUser(m); exitSelection(); }} className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${selectedUser?.uid === m.uid ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "hover:bg-white text-slate-600"}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${selectedUser?.uid === m.uid ? "bg-white/20" : "bg-slate-200 text-slate-500"}`}>{m.name?.[0].toUpperCase()}</div>
              <div className="text-left flex-1 truncate">
                <p className="text-[14px] font-black truncate uppercase tracking-tight">{m.name}</p>
                <p className={`text-[9px] font-black uppercase tracking-widest ${selectedUser?.uid === m.uid ? "text-indigo-100" : "text-slate-400"}`}>{m.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className={`${!selectedUser ? "hidden" : "flex"} flex-1 md:flex flex-col bg-white`}>
        {selectedUser ? (
          <>
            <div className="p-4 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-3">
                <button onClick={() => isSelectionMode ? exitSelection() : setSelectedUser(null)} className="p-2 hover:bg-slate-50 rounded-full">
                  {isSelectionMode ? <FiX size={20} /> : <FiChevronLeft size={24} className="md:hidden" />}
                </button>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{isSelectionMode ? `${selectedIds.length} Selected` : selectedUser.name}</h4>
              </div>
            </div>

            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50/30 no-scrollbar">
              {messages.map((m) => (
                <MessageBubble 
                  key={m.id} 
                  msg={m} 
                  isMe={m.senderId === loginUser.uid} 
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedIds.includes(m.id)}
                  onSelect={() => toggleSelect(m.id)}
                  onLongPress={() => { setIsSelectionMode(true); toggleSelect(m.id); }}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  onEdit={() => { setInputText(m.text); setEditingMessage(m); setActiveMenuId(null); }}
                  onDelete={async (id) => await deleteDoc(doc(db, "direct_messages", getChatId(loginUser.uid, selectedUser.uid), "messages", id))}
                />
              ))}
            </div>

            <div className="p-4">
               <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200">
                 <input value={inputText} onChange={(e)=>setInputText(e.target.value)} placeholder="Type a message..." className="flex-1 bg-transparent px-4 py-2 text-sm font-bold outline-none" />
                 <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 active:scale-90 transition-all"><FiSend size={18} /></button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
            <FiUser size={48} className="opacity-10 mb-4" />
            <p className="font-black uppercase tracking-[0.4em] text-[10px]">Select a chat</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MESSAGE BUBBLE COMPONENT ---
const MessageBubble = ({ msg, isMe, isSelectionMode, isSelected, onSelect, onLongPress, activeMenuId, setActiveMenuId, onEdit, onDelete }) => {
  const mid = msg.id;
  const isMenuOpen = activeMenuId === mid;
  return (
    <div onContextMenu={(e)=>{e.preventDefault(); onLongPress();}} onClick={()=>isSelectionMode && onSelect(mid)} className={`group flex items-center gap-3 w-full transition-all py-1 px-2 rounded-2xl ${isSelected ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
      <div className={`flex-1 flex ${isMe ? "justify-end" : "justify-start"} items-center gap-2`}>
        {isMe && !isSelectionMode && (
          <button onClick={(e)=>{e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : mid);}} className={`p-1.5 rounded-full text-slate-400 hover:bg-slate-100 ${isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}><FiMoreVertical size={16} /></button>
        )}
        <div className={`relative flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
          {isMe && isMenuOpen && (
            <div className="absolute -top-20 right-0 z-[100] bg-white border border-slate-100 shadow-xl rounded-xl py-2 min-w-[100px]">
              <button onClick={(e)=>{e.stopPropagation(); onEdit();}} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-slate-600 hover:bg-indigo-50">Edit</button>
              <button onClick={(e)=>{e.stopPropagation(); onDelete(mid);}} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50">Delete</button>
            </div>
          )}
          <div className={`p-4 rounded-2xl text-sm font-bold ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-100"}`}>
            {msg.text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;