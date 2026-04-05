import React, { useEffect, useState } from 'react';
import AgoraUIKit, { layout } from 'agora-react-uikit';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from "../../firebase"; // Firebase path check karlein
import { 
  doc, updateDoc, serverTimestamp, collection, query, where, getDocs 
} from "firebase/firestore";

const VideoCallPage = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  // Note: Production mein Token server se aana chahiye, testing ke liye theek hai
  const AGORA_TOKEN = '007eJxTYGA9dKj3TFf4BH3m+uQHDc981ZzSyrVbImItHA8c+eK3ukqBwSLJJCUxOdE02cgi0STJwtjCMtXUyMg8yTzJwMjcLNnU/OiFzIZARoa37MdZGBkgEMTnZkhOzMmJTy1MNikpYWAAABkoIgI='; 

  useEffect(() => {
    if (!channelId) {
      navigate('/DashboardWrapper');
      return;
    }
    const timer = setTimeout(() => setIsReady(true), 800);
    return () => clearTimeout(timer);
  }, [channelId, navigate]);

  // --- DATABASE CLEANUP LOGIC ---
  const handleEndCallCleanup = async () => {
    try {
      // Hum us call document ko dhoondhte hain jiska channelId matches
      const q = query(
        collection(db, "activeCalls"), 
        where("channelId", "==", channelId),
        where("status", "==", "active")
      );
      
      const querySnapshot = await getDocs(q);
      
      // Status ko inactive set karte hain
      const updatePromises = querySnapshot.docs.map(callDoc => 
        updateDoc(doc(db, "activeCalls", callDoc.id), {
          status: "inactive",
          endedAt: serverTimestamp()
        })
      );

      await Promise.all(updatePromises);
    } catch (err) {
      console.error("Cleanup Error:", err);
    } finally {
      setIsReady(false);
      navigate('/DashboardWrapper/messages');
    }
  };

  const rtcProps = {
    appId: '8b4daca5c28a4b8389e5227b7b0276c5', 
    channel: channelId, // Isse dynamic rakha hai
    token: AGORA_TOKEN, 
    enableRtm: false,
    layout: layout.pinned,
  };

  const styleProps = {
    container: { 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      backgroundColor: 'transparent',
    },
    localVideoContainer: { 
      width: '240px', 
      height: '180px', 
      borderRadius: '20px', 
      position: 'absolute',
      bottom: '100px', 
      right: '30px',
      border: '4px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
      overflow: 'hidden',
      zIndex: 10,
      backgroundColor: '#0f172a'
    },
    remoteVideoContainer: { 
      width: '100%', 
      height: '100%', 
      borderRadius: '30px', 
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    UIKitColors: {
        primary: '#6366f1',
        secondary: '#1e293b',
        mainBg: '#020617',
    },
    navHolder: {
        position: 'absolute',
        bottom: '30px', 
        left: '50%',
        transform: 'translateX(-50%)', 
        backgroundColor: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(15px)',
        borderRadius: '100px', 
        padding: '10px 25px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        zIndex: 50,
        width: 'fit-content',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    btnHolder: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px'
    }
  };

  const callbacks = {
    EndCall: handleEndCallCleanup, // Updated with our cleanup method
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#020617] overflow-hidden flex items-center justify-center p-4 lg:p-10">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>

      {isReady ? (
        <div className="w-full h-full max-w-7xl max-h-[900px] relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-[40px] overflow-hidden border border-white/5">
            
            <div className="absolute top-8 left-8 z-20 flex items-center gap-4">
                <div className="bg-red-500 h-2 w-2 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                <h1 className="text-white/70 text-xs font-black uppercase tracking-[0.3em]">
                    Room: {channelId}
                </h1>
            </div>

            <AgoraUIKit 
              rtcProps={rtcProps} 
              callbacks={callbacks} 
              styleProps={styleProps} 
            />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
            <div className="absolute inset-0 h-20 w-20 rounded-full border-b-2 border-blue-500 animate-spin-reverse opacity-50"></div>
          </div>
          <p className="mt-8 text-indigo-400 font-bold text-sm uppercase tracking-[0.4em] animate-pulse">
            Configuring Studio...
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;




// {isMeetMailModel && ( <MeetMailModal 
//   users={filteredMembers} 
//   onClose={() => setIsMeetMailModel(false)} 
//   onCreate={handleMailCreateMeeting} 

  
// />)}