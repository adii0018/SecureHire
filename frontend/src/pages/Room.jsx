import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { theme, fonts } from '../theme';
import Button from '../components/Button';
import RiskGauge from '../components/RiskGauge';
import AlertFeed from '../components/AlertFeed';
import VideoTile from '../components/VideoTile';
import { MicOff, Mic, Video, VideoOff } from 'lucide-react';

export default function Room() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const role = location.state?.role || 'host';
  const userName = location.state?.name || 'User';

  useEffect(() => {
    initializeSession();
    
    // Session timer
    const timer = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      clearInterval(timer);
      cleanup();
    };
  }, []);

  const initializeSession = async () => {
    try {
      // Get local media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;

      // Initialize WebSocket
      const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/session/${code}/`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify({
          type: 'join',
          payload: { name: userName, role },
        }));
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        await handleSignalingMessage(message);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
      };

    } catch (err) {
      console.error('Failed to initialize session:', err);
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const handleSignalingMessage = async (message) => {
    const { type, payload } = message;

    switch (type) {
      case 'peer_joined':
        console.log('Peer joined:', payload);
        if (role === 'host') {
          await createOffer();
        }
        break;

      case 'offer':
        await handleOffer(payload);
        break;

      case 'answer':
        await handleAnswer(payload);
        break;

      case 'ice':
        await handleIceCandidate(payload);
        break;

      case 'alert_update':
        handleAlertUpdate(payload);
        break;

      case 'peer_left':
        console.log('Peer left');
        setRemoteStream(null);
        setIsConnected(false);
        break;
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ice',
          payload: { candidate: event.candidate },
        }));
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track');
      setRemoteStream(event.streams[0]);
      setIsConnected(true);
    };

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pcRef.current = pc;
    return pc;
  };

  const createOffer = async () => {
    const pc = createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    wsRef.current.send(JSON.stringify({
      type: 'offer',
      payload: { sdp: offer },
    }));
  };

  const handleOffer = async (payload) => {
    const pc = createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    wsRef.current.send(JSON.stringify({
      type: 'answer',
      payload: { sdp: answer },
    }));
  };

  const handleAnswer = async (payload) => {
    if (pcRef.current) {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    }
  };

  const handleIceCandidate = async (payload) => {
    if (pcRef.current && payload.candidate) {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
    }
  };

  const handleAlertUpdate = (payload) => {
    setRiskScore(payload.risk || 0);
    setAlerts(prev => [{
      type: payload.alertType,
      message: payload.alertType.replace('_', ' '),
      timestamp: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endSession = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'leave' }));
    }
    cleanup();
    navigate('/dashboard');
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: theme.bg,
      fontFamily: fonts.family,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Bar */}
      <div style={{
        padding: '16px 24px',
        background: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text }}>
            Session: {code}
          </div>
          <div style={{ fontSize: '0.9rem', color: theme.muted }}>
            {formatTime(sessionTime)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? theme.accent : theme.muted,
          }} />
          <span style={{ fontSize: '0.9rem', color: theme.muted }}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', padding: '24px', gap: '24px' }}>
        {/* Video Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Remote Video */}
          <div style={{ flex: 1, position: 'relative' }}>
            {remoteStream ? (
              <VideoTile
                stream={remoteStream}
                name={role === 'host' ? 'Candidate' : 'Interviewer'}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.muted,
              }}>
                Waiting for peer to join...
              </div>
            )}

            {/* Local Video PiP */}
            {localStream && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: '240px',
                height: '180px',
              }}>
                <VideoTile
                  stream={localStream}
                  name="You"
                  muted={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px',
            background: theme.surface,
            borderRadius: '12px',
          }}>
            <Button
              variant={isMuted ? 'primary' : 'outline'}
              onClick={toggleMute}
              style={{ minWidth: '120px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
            >
              {isMuted ? <><MicOff size={16} /> Unmute</> : <><Mic size={16} /> Mute</>}
            </Button>
            <Button
              variant={isVideoOff ? 'primary' : 'outline'}
              onClick={toggleVideo}
              style={{ minWidth: '120px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
            >
              {isVideoOff ? <><Video size={16} /> Start Video</> : <><VideoOff size={16} /> Stop Video</>}
            </Button>
            <Button
              variant="outline"
              style={{ minWidth: '120px', background: '#ff5f57', color: '#fff', border: 'none' }}
              onClick={endSession}
            >
              End Call
            </Button>
          </div>
        </div>

        {/* Proctoring Panel (only for host) */}
        {role === 'host' && (
          <div style={{
            width: '320px',
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
                Proctoring Panel
              </h2>
              <p style={{ fontSize: '0.85rem', color: theme.muted }}>
                Session: {code}
              </p>
            </div>

            <RiskGauge score={riskScore} />

            <AlertFeed alerts={alerts} />

            <div style={{
              padding: '16px',
              background: theme.bg,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
            }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.text, marginBottom: '12px' }}>
                Violation Count
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Eye Tracking', 'Multi-Face', 'Voice', 'Tab Switch', 'Copy-Paste'].map((label, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: theme.muted }}>{label}</span>
                    <span style={{ color: theme.text, fontWeight: 600 }}>0</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
