import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';
import { 
  FiSend, FiSearch, FiMoreHorizontal, FiUser, FiChevronLeft, FiInfo,
  FiPlus, FiTrash2, FiUsers ,FiX, FiVideo, FiPhoneCall, FiMail, FiCheck, FiClock 
} from "react-icons/fi"; 
import { db } from "../../../firebase"; 
import { 
  doc, setDoc, collection, query, orderBy, onSnapshot, 
  serverTimestamp, updateDoc, deleteDoc, addDoc, where, getDocs, writeBatch 
} from "firebase/firestore";

// --- 1. MEETING MODAL ---
const MeetingModal = ({ users, onClose, onCreate, onOpenMail }) => {
  const [selected, setSelected] = useState([]);

  const toggleUser = (user) => {
    setSelected(prev => 
      prev.find(u => u.uid === user.uid) 
        ? prev.filter(u => u.uid !== user.uid) 
        : [...prev, user]
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
              <FiVideo size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 leading-none">Video Conference</h2>
              <p className="text-xs text-slate-500 mt-1">Select participants to invite</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <FiX size={20} />
          </button>
        </div>
        
        {/* User List */}
        <div className="px-6 py-4">
          <div className="max-h-[320px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
            {users.map(user => {
              const isSelected = !!selected.find(u => u.uid === user.uid);
              return (
                <label 
                  key={user.uid} 
                  className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                    isSelected 
                    ? 'bg-indigo-50/50 border-indigo-200' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:bg-indigo-600 checked:border-indigo-600 transition-all"
                      checked={isSelected} 
                      onChange={() => toggleUser(user)} 
                    />
                    <FiCheck className="absolute text-white opacity-0 peer-checked:opacity-100 w-5 h-5 pointer-events-none p-1" />
                  </div>
                  
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {user.name || user.email}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium truncate uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={() => onCreate(selected)} 
              disabled={selected.length === 0} 
              className="flex-1 bg-indigo-600 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm hover:bg-indigo-700 active:transform active:scale-[0.98] transition-all"
            >
              Start Meeting
            </button>
          </div>
          
          <button 
            onClick={() => onOpenMail(selected)} 
            disabled={selected.length === 0} 
            className="w-full bg-slate-900 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
          >
            <FiMail size={16} />
            Send Invitations via Email
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. MEET MAIL MODAL ---
const MeetMailModal = ({ selectedUsers, onClose, onSend }) => {
  const [details, setDetails] = useState({ link: '', password: '', code: '' });
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[160] p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Schedule Invitation</h2>
            <p className="text-sm text-slate-500 mt-1">Configure access details for participants</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-md transition-colors">
            <FiX size={20} />
          </button>
        </div>
        
        {/* Form */}
        <div className="px-8 pb-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FiLink size={12} /> Meeting Link
            </label>
            <input 
              type="text" 
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder:text-slate-300 font-medium" 
              placeholder="https://conference.io/room/..." 
              value={details.link} 
              onChange={(e)=>setDetails({...details, link: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FiInfo size={12} /> Access Code
              </label>
              <input 
                type="text" 
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-mono" 
                placeholder="ABC-123" 
                value={details.code} 
                onChange={(e)=>setDetails({...details, code: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FiLock size={12} /> Password
              </label>
              <input 
                type="text" 
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-mono" 
                placeholder="••••••" 
                value={details.password} 
                onChange={(e)=>setDetails({...details, password: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex -space-x-2 overflow-hidden">
              {[...Array(Math.min(selectedUsers.length, 3))].map((_, i) => (
                <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-300" />
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-600">
              Ready to send to {selectedUsers.length} participant{selectedUsers.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={async () => {
              setLoading(true);
              await onSend(details, selectedUsers);
              setLoading(false);
            }}
            disabled={!details.link || loading}
            className="w-full bg-indigo-600 disabled:opacity-50 text-white py-3.5 rounded-lg font-bold text-sm shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2 italic">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : "Confirm & Send Invitations"}
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkMessageSelector = ({ users, onClose, onCreate }) => {
  const [selected, setSelected] = useState([]);

  const toggleUser = (user) => {
    setSelected(prev => 
      prev.find(u => u.uid === user.uid) 
        ? prev.filter(u => u.uid !== user.uid) 
        : [...prev, user]
    );
  };

  const isAllSelected = selected.length === users.length;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded flex items-center justify-center">
              <FiUsers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Broadcast Audience</h2>
              <p className="text-xs text-slate-500">Target specific recipients for messaging</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* List Section */}
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Directory ({users.length})
            </span>
            <button 
              onClick={() => setSelected(isAllSelected ? [] : users)}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
            {users.map(user => {
              const isSelected = !!selected.find(u => u.uid === user.uid);
              return (
                <label 
                  key={user.uid} 
                  className={`group flex items-center gap-3 p-3 rounded-md cursor-pointer border transition-all ${
                    isSelected 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 checked:bg-emerald-600 checked:border-emerald-600 transition-all"
                      checked={isSelected} 
                      onChange={() => toggleUser(user)} 
                    />
                    <FiCheck className="absolute text-white opacity-0 peer-checked:opacity-100 w-4 h-4 pointer-events-none p-0.5" />
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-700 truncate">
                      {user.name || user.email}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                      {user.role}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2.5 rounded-lg font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => onCreate(selected)} 
            disabled={selected.length === 0} 
            className="flex-1 bg-emerald-600 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Configure Message
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. BULK MESSAGES MODAL ---
const BulkMessagesModal = ({ selectedUsers, onClose, onSend }) => {
  const [details, setDetails] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[160] p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
               <FiSend size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Compose Broadcast</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <FiX size={20} />
          </button>
        </div>
        
        {/* Input Fields */}
        <div className="px-8 pb-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
              Broadcast Title
            </label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all placeholder:text-slate-400" 
              placeholder="e.g. Q4 System Maintenance" 
              value={details.title} 
              onChange={(e)=>setDetails({...details, title: e.target.value})} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
              Body Content
            </label>
            <textarea 
              rows="5" 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all resize-none placeholder:text-slate-400" 
              placeholder="Type your message details here..." 
              value={details.description} 
              onChange={(e)=>setDetails({...details, description: e.target.value})} 
            />
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <FiInfo className="text-blue-500 mt-0.5" size={14} />
            <p className="text-[11px] leading-relaxed text-blue-700 font-medium">
              This message will be dispatched to <strong>{selectedUsers.length}</strong> verified recipients. Ensure content complies with company communication guidelines.
            </p>
          </div>

          <button
            onClick={async () => {
              setLoading(true);
              await onSend(details, selectedUsers);
              setLoading(false);
            }}
            disabled={!details.title || !details.description || loading}
            className="w-full bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3.5 rounded-lg font-bold text-sm shadow-lg hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm and Dispatch Message
              </>
            )}
          </button>
        </div>
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
  const [inputText, setInputText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMeetMailModel, setIsMeetMailModel] = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [bulkMessageModalOpen, setBulkMessageModalOpen] = useState(false);
  const [bulkMessageSelectorOpen, setBulkMessageSelectorOpen] = useState(false);
  
  const containerRef = useRef();
  const loginUser = useSelector((state) => state.auth?.user) || null;
  const members = useSelector((state) => state.auth?.members) || [];

// Example helper
const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join("_"); 
};

  const filteredMembers = useMemo(() => {
    return members.filter((m) => (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) && m.uid !== loginUser?.uid);
  }, [members, searchTerm, loginUser]);

  // --- LOGIC: MARK MESSAGES AS READ ---
  const markAsRead = useCallback(async (chatId, otherUserId) => {
    if (!chatId || !loginUser || isMarkingRead.current) return;
  
    isMarkingRead.current = true;
  
    try {
      const msgRef = collection(db, "direct_messages", chatId, "messages");
  
      const q = query(
        msgRef,
        where("senderId", "==", otherUserId),
        where("status", "==", "sent")
      );
  
      const snapshot = await getDocs(q);
  
      if (!snapshot.empty) {
        const batch = writeBatch(db);
  
        snapshot.docs.forEach((d) => {
          batch.update(d.ref, { status: "read" });
        });
  
        await batch.commit();
      }
    } catch (err) {
      console.error("Read receipt failed", err);
    }
  
    isMarkingRead.current = false;
  }, [loginUser]);


  // --- SCROLL TO BOTTOM ---
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // --- LISTEN FOR ACTIVE CALLS ---
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

  useEffect(() => {
    if (!selectedUser?.uid || !loginUser?.uid) {
      setMessages([]);
      return;
    }
  
    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    const q = query(
      collection(db, "direct_messages", chatId, "messages"), 
      orderBy("timestamp", "asc")
    );
    
    
    const unsubscribe = onSnapshot(q, (snap) => {
      // 1. Update UI immediately
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
  
      // 2. Filter unread messages sent by the OTHER person
      const unreadDocs = snap.docs.filter(d => {
        const data = d.data();
        return data.senderId === selectedUser.uid && data.status !== "read";
      });
  
      // 3. Update status in a single batch
      if (unreadDocs.length > 0) {
        const batch = writeBatch(db);
        unreadDocs.forEach((docItem) => {
          batch.update(docItem.ref, { status: "read" });
        });
        
        // We don't 'await' here to keep the listener thread fast
        batch.commit().catch(err => console.error("Failed to update read receipts:", err));
      }
    });
    
    return () => unsubscribe();
    // REMOVED 'markAsRead' from dependencies if it's a function defined inside the component 
    // to prevent unnecessary re-subscriptions unless you use useCallback.
  }, [selectedUser?.uid, loginUser?.uid]);

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
        await setDoc(msgRef, { 
            text, 
            tempMessage: true, 
            senderId: loginUser.uid, 
            timestamp: serverTimestamp(),
            status: "sent" // Added status
        });
        await setDoc(doc(db, "direct_messages", chatId), { lastMessage: text, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (err) { console.error(err); }
  };

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

  const handleMailCreateMeeting = async (details, selectedUsers) => {
    const serviceID = 'service_d6r58da';
    const templateID = 'template_yddpbhe';
    const publicKey = 'RG-epL79tbuC7qcZI';
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

  const handleBulkBroadcast = async (details, selectedUsers) => {
    if (!details.title || !details.description) {
      alert("Title and Description required");
      return;
    }
  
    const serviceID = 'service_qqkfdee';
    const templateID = 'template_o5f36ch';
    const publicKey = 'A4ovkNHhyqVBb6k6k';
  
    try {
      // 1️⃣ SAVE TO FIRESTORE
      await Promise.all(
        selectedUsers.map(async (u) => {
          const chatId = getChatId(loginUser.uid, u.uid);
          const messagesRef = collection(db, "direct_messages", chatId, "messages");
  
          await addDoc(messagesRef, {
            text: details.title,
            description: details.description,
            tempMessage: true,
            senderId: loginUser.uid,
            timestamp: serverTimestamp(),
            status: "sent"
          });
  
          await setDoc(
            doc(db, "direct_messages", chatId),
            {
              lastMessage: details.title,
              updatedAt: serverTimestamp()
            },
            { merge: true }
          );
        })
      );
  
      // 2️⃣ SEND EMAILS (using allSettled so one fail doesn't stop the rest)
      const emailResults = await Promise.allSettled(
        selectedUsers.map((u) => {
          const templateParams = {
            description: details.description,
            title: details.title,
            to_name: u.name,
            organization: loginUser.organization || "N/A",
            to_email: u.email,
            from_name: loginUser.name,
            from_email: loginUser.email,
          };
          return emailjs.send(serviceID, templateID, templateParams, publicKey);
        })
      );
  
      // 3️⃣ ANALYZE RESULTS
      const failures = emailResults.filter(r => r.status === 'rejected');
      
      if (failures.length > 0) {
        console.warn("Some emails failed to send:", failures);
        alert(`Messages saved to chat, but ${failures.length} emails failed to reach users.`);
      } else {
        alert("All broadcast messages and emails sent successfully!");
      }
  
      setBulkMessageSelectorOpen(false);
      setBulkMessageModalOpen(false);
  
    } catch (err) {
      console.error("Critical Broadcast Error:", err);
      alert("Failed to process the broadcast. Check console for details.");
    }
  };

  const handleVideoAction = () => {
    if (activeCall) {
      if (isParticipant) navigate(`/video-call/${activeCall.channelId}`);
      return;
    }
    setIsModalOpen(true);
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm("Delete selected messages?")) return;
    const chatId = getChatId(loginUser.uid, selectedUser.uid);
    try {
        await Promise.all(selectedIds.map(id => deleteDoc(doc(db, "direct_messages", chatId, "messages", id))));
        exitSelection();
    } catch(err) { console.error(err); }
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const exitSelection = () => { setSelectedIds([]); setIsSelectionMode(false); };

 
    return (
      <div className="flex h-[calc(100vh-64px)] w-full bg-[#f8fafc] overflow-hidden relative font-sans border-t border-slate-200">
        {/* PROFESSIONAL NOTIFICATION BAR */}
        {activeCall && isParticipant && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] flex items-center bg-emerald-600 text-white px-4 py-2 rounded shadow-lg border border-emerald-500 transition-all">
            <button 
              onClick={() => navigate(`/video-call/${activeCall.channelId}`)} 
              className="flex items-center gap-3 hover:bg-emerald-700 py-1 px-2 rounded transition-colors"
            >
              <FiPhoneCall size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Join Active Session</span>
            </button>
            
            {activeCall.hostId === loginUser.uid && (
              <>
                <div className="w-[1px] h-4 bg-emerald-400/50 mx-2" />
                <button 
                  onClick={() => handleEndCall(activeCall.id)} 
                  className="hover:bg-rose-600 p-1.5 rounded transition-colors"
                  title="Terminate Session"
                >
                  <FiX size={14} />
                </button>
              </>
            )}
          </div>
        )}
  
        {/* OVERLAY COMPONENTS */}
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
        {bulkMessageSelectorOpen && (
          <BulkMessageSelector 
            users={filteredMembers} 
            onClose={() => setBulkMessageSelectorOpen(false)} 
            onCreate={(users) => { setTempSelectedUsers(users); setBulkMessageModalOpen(true); }} 
          />
        )}
        {bulkMessageModalOpen && (
          <BulkMessagesModal 
            selectedUsers={tempSelectedUsers} 
            onClose={() => setBulkMessageModalOpen(false)} 
            onSend={handleBulkBroadcast} 
          />
        )}
  
        {/* NAVIGATION SIDEBAR */}
        <div className={`${selectedUser ? "hidden" : "flex"} w-full md:w-[320px] md:flex flex-col bg-white border-r border-slate-200`}>
          <div className="p-5 border-b border-slate-100">
            <div className="flex justify-between mb-5 items-center">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">Workspace Messages</h3>
              <div className="flex gap-1">
                <button 
                  onClick={() => setBulkMessageSelectorOpen(true)} 
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded transition-all"
                  title="Bulk Transmission"
                >
                  <FiSend size={18} />
                </button>
                <button 
                  onClick={handleVideoAction} 
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded transition-all"
                  title="Initiate Meeting"
                >
                  <FiVideo size={18} />
                </button>
              </div>
            </div>
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Filter members..." 
                className="w-full bg-slate-50 border border-slate-200 rounded py-2.5 pl-10 text-xs font-medium outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all" 
              />
            </div>
          </div>
  
          <div className="flex-1 overflow-y-auto no-scrollbar py-2">
            {filteredMembers.map(m => (
              <button 
                key={m.uid} 
                onClick={() => { setSelectedUser(m); exitSelection(); }} 
                className={`w-full flex items-center gap-3 px-5 py-3.5 transition-all border-l-2 ${
                  selectedUser?.uid === m.uid 
                    ? "bg-indigo-50/50 border-indigo-600 text-indigo-900" 
                    : "border-transparent hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-9 h-9 rounded flex items-center justify-center text-xs font-bold ${
                    selectedUser?.uid === m.uid ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {m.name?.[0].toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    m.role === "Admin" ? "bg-amber-500" : "bg-indigo-400"
                  }`} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate tracking-tight">{m.name}</p>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider truncate opacity-60`}>
                    ID: {m.uid?.slice(0, 8)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
  
        {/* COMMUNICATION VIEWPORT */}
        <div className={`${!selectedUser ? "hidden" : "flex"} flex-1 md:flex flex-col bg-white`}>
          {selectedUser ? (
            <>
              <div className="h-[65px] px-6 flex items-center justify-between border-b border-slate-100 bg-white">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => isSelectionMode ? exitSelection() : setSelectedUser(null)} 
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {isSelectionMode ? <FiX size={18} /> : <FiChevronLeft size={22} className="md:hidden" />}
                  </button>
                  <div className="flex flex-col">
                      <h4 className="font-bold text-slate-800 text-[14px] leading-tight">
                        {isSelectionMode ? `${selectedIds.length} Objects Selected` : selectedUser.name}
                      </h4>
                      {!isSelectionMode && (
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.1em]">
                          {selectedUser.uid.slice(0,10)} 
                        </span>
                      )}
                  </div>
                </div>
                
                {isSelectionMode && selectedIds.length > 0 && (
                    <button 
                      onClick={handleDeleteSelected} 
                      className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-all"
                    >
                      <FiTrash2 size={14} /> Clear Records
                    </button>
                )}
              </div>
  
              <div 
                ref={containerRef} 
                className="flex-1 overflow-y-auto p-6 md:px-12 space-y-4 bg-[#fcfcfd] no-scrollbar"
              >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <FiMail size={32} className="mb-4 opacity-20" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40">No Communication History</p>
                    </div>
                ) : (
                    messages.map((m) => (
                      <MessageBubble
                        key={m.id}
                        msg={m}
                        isMe={m.senderId === loginUser?.uid}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedIds.includes(m.id)}
                        onSelect={() => toggleSelect(m.id)}
                        onLongPress={() => { setIsSelectionMode(true); toggleSelect(m.id); }}
                        activeMenuId={activeMenuId}
                        setActiveMenuId={setActiveMenuId}
                        onEdit={() => { setInputText(m.text); setEditingMessage(m); setActiveMenuId(null); }}
                        onDelete={async (id) => {
                            const chatId = getChatId(loginUser.uid, selectedUser.uid);
                            await deleteDoc(doc(db, "direct_messages", chatId, "messages", id));
                        }}
                      />
                    ))
                )}
              </div>
  
              <div className="p-5 border-t border-slate-100 bg-white">
                 {editingMessage && (
                     <div className="mb-3 flex items-center justify-between bg-indigo-600 text-white px-4 py-1.5 rounded-t text-[10px] font-bold uppercase tracking-[0.1em]">
                         <span>Modifying Entry</span>
                         <button onClick={() => { setEditingMessage(null); setInputText(""); }}><FiX size={14}/></button>
                     </div>
                 )}
                 <form 
                   onSubmit={handleSendMessage} 
                   className={`flex items-end gap-2 bg-white border border-slate-200 p-1.5 rounded shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all`}
                 >
                 <input value={inputText} onChange={(e)=>setInputText(e.target.value)} placeholder="Type a message..." className="flex-1 bg-transparent px-4 py-2 text-sm font-medium outline-none" />

                   <button 
                     type="submit" 
                     className="bg-slate-900 text-white p-3 rounded hover:bg-indigo-600 active:scale-95 transition-all flex-shrink-0"
                   >
                       {editingMessage ? <FiCheck size={18}/> : <FiSend size={18} />}
                   </button>
                 </form>
                 <p className="mt-2 text-[9px] text-slate-400 font-bold uppercase tracking-tight px-1">
                   Secure Workspace Encryption Enabled
                 </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
              <div className="w-20 h-20 rounded-full border border-slate-100 flex items-center justify-center mb-6">
                 <FiUser size={32} className="opacity-20" />
              </div>
              <p className="font-bold uppercase tracking-[0.3em] text-[11px] text-slate-400">Select Session to View Logs</p>
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

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isMenuOpen, setActiveMenuId]);

  return (
    <div onContextMenu={(e)=>{e.preventDefault(); onLongPress();}} onClick={(e)=>{ if(isSelectionMode) { onSelect(mid); } else if (isMenuOpen) { setActiveMenuId(null); } }} className={`group flex items-center gap-3 w-full transition-all py-1 px-2 rounded-2xl ${isSelected ? "bg-indigo-50" : "hover:bg-slate-50/50"}`}>
      {isSelectionMode && (
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300"}`}>
              {isSelected && <div className="w-2 h-2 bg-white rounded-full"/>}
          </div>
      )}

      <div className={`flex-1 flex ${isMe ? "justify-end" : "justify-start"} items-center gap-2`}>
        {isMe && !isSelectionMode && (
          <button onClick={(e)=>{e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : mid);}} className={`p-1.5 rounded-full text-slate-400 hover:bg-slate-100 ${isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <FiMoreHorizontal size={16} />
          </button>
        )}
        <div className={`relative flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
          {isMe && isMenuOpen && (
            <div className="absolute -top-20 right-0 z-[100] bg-white border border-slate-100 shadow-xl rounded-xl py-2 min-w-[100px] animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button onClick={(e)=>{e.stopPropagation(); onEdit();}} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-slate-600 hover:bg-indigo-50">Edit</button>
              <button onClick={(e)=>{e.stopPropagation(); onDelete(mid);}} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50">Delete</button>
            </div>
          )}
          <div className={`p-4 rounded-2xl text-sm font-bold shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"}`}>
          <p className={`font-bold ${msg.description && "text-red-600"}`}>{msg.text}</p>
          {msg.description && <p>{msg.description}</p>}
            <div className={`flex items-center gap-1 mt-1.5 text-[9px] ${isMe ? "text-slate-400 justify-end" : "text-slate-400"}`}>
          
              {msg.timestamp ? new Date(msg.timestamp?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "..."}
              
              {/* DOUBLE TICK LOGIC */}
              {isMe && (
                <div className="flex ml-1">
                  <FiCheck size={11} className={msg.status === "read" ? "text-indigo-400 -mr-1.5" : "text-slate-500"} />
                  {msg.status === "read" && <FiCheck size={11} className="text-indigo-400" />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;