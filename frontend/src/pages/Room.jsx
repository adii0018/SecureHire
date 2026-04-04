import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { theme, fonts } from '../theme';
import Button from '../components/Button';
import RiskGauge from '../components/RiskGauge';
import AlertFeed from '../components/AlertFeed';
import VideoTile from '../components/VideoTile';
import api from '../api/axios';
import { MicOff, Mic, Video, VideoOff } from 'lucide-react';

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

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
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const riskScoreRef = useRef(0);

  const role = location.state?.role || 'host';
  const userName = location.state?.name || 'User';

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave', payload: {} }));
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
    }
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice',
          payload: { candidate: event.candidate },
        }));
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setIsConnected(true);
      setConnectionStatus('Connected');
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        setRemoteStream(null);
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pcRef.current = pc;
    return pc;
  }, []);

  const handleSignalingMessage = useCallback(async (message) => {
    const { type, payload } = message;

    switch (type) {
      case 'peer_joined': {
        setConnectionStatus('Peer joined, connecting...');
        if (role === 'host') {
          const pc = createPeerConnection();
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          wsRef.current?.send(JSON.stringify({ type: 'offer', payload: { sdp: pc.localDescription } }));
        }
        break;
      }
      case 'offer': {
        const pc = createPeerConnection();
        await pc.setRemoteDescription(payload.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsRef.current?.send(JSON.stringify({ type: 'answer', payload: { sdp: pc.localDescription } }));
        break;
      }
      case 'answer': {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(payload.sdp);
        }
        break;
      }
      case 'ice': {
        if (pcRef.current && payload.candidate) {
          try {
            await pcRef.current.addIceCandidate(payload.candidate);
          } catch {
            // ignore stale candidates
          }
        }
        break;
      }
      case 'alert_update': {
        const delta = payload.riskDelta || 5;
        const newScore = Math.min(100, riskScoreRef.current + delta);
        riskScoreRef.current = newScore;
        setRiskScore(newScore);
        setAlerts(prev => [{
          type: payload.alertType,
          message: payload.alertType.replace(/_/g, ' '),
          timestamp: new Date().toLocaleTimeString(),
        }, ...prev].slice(0, 20));
        break;
      }
      case 'peer_left': {
        setRemoteStream(null);
        setIsConnected(false);
        setConnectionStatus('Peer left');
        break;
      }
      default:
        break;
    }
  }, [role, createPeerConnection]);

  useEffect(() => {
    let timer;

    const initializeSession = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream;

        const wsBase = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
        const ws = new WebSocket(`${wsBase}/session/${code}/`);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnectionStatus('Waiting for peer...');
          ws.send(JSON.stringify({ type: 'join', payload: { name: userName, role } }));
        };

        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            await handleSignalingMessage(message);
          } catch (err) {
            console.error('Failed to handle message:', err);
          }
        };

        ws.onerror = () => {
          setConnectionStatus('Connection error');
        };

        ws.onclose = () => {
          setIsConnected(false);
          setConnectionStatus('Disconnected');
        };

      } catch (err) {
        console.error('Failed to initialize session:', err);
        if (err.name === 'NotAllowedError') {
          alert('Camera/microphone access denied. Please allow permissions and try again.');
        } else {
          alert('Failed to access camera/microphone. Please check your device.');
        }
        navigate('/dashboard');
      }
    };

    initializeSession();

    timer = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Tab visibility detection (proctoring)
    const handleVisibilityChange = () => {
      if (document.hidden && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'alert',
          payload: { alertType: 'tab_switch', riskDelta: 10 },
        }));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Copy-paste detection (proctoring)
    const handleCopy = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'alert',
          payload: { alertType: 'copy_paste', riskDelta: 5 },
        }));
      }
    };
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handleCopy);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handleCopy);
      cleanup();
    };
  }, [code, userName, role, navigate, handleSignalingMessage, cleanup]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsMuted(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsVideoOff(prev => !prev);
    }
  };

  const endSession = async () => {
    if (role === 'host') {
      try {
        await api.post(`/sessions/${code}/end/`);
      } catch {
        // best effort
      }
    }
    cleanup();
    navigate('/dashboard');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
            background: isConnected ? theme.accent : '#febc2e',
          }} />
          <span style={{ fontSize: '0.9rem', color: theme.muted }}>
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', padding: '24px', gap: '24px' }}>
        {/* Video Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Remote Video */}
          <div style={{ flex: 1, position: 'relative', minHeight: '400px' }}>
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
                fontSize: '1rem',
              }}>
                {connectionStatus}
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

        {/* Proctoring Panel (host only) */}
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
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text, marginBottom: '4px' }}>
                Proctoring Panel
              </h2>
              <p style={{ fontSize: '0.85rem', color: theme.muted }}>Session: {code}</p>
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
                {['Eye Tracking', 'Multi-Face', 'Voice', 'Tab Switch', 'Copy-Paste'].map((label) => {
                  const key = label.toLowerCase().replace('-', '_').replace(' ', '_');
                  const count = alerts.filter(a =>
                    a.type === key ||
                    a.type === label.toLowerCase().replace(' ', '_')
                  ).length;
                  return (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: theme.muted }}>{label}</span>
                      <span style={{ color: count > 0 ? '#ff5f57' : theme.text, fontWeight: 600 }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
