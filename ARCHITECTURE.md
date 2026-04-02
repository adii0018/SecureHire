# SecureHire - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    React Frontend                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │  │
│  │  │   Pages    │  │ Components │  │  WebRTC Engine   │   │  │
│  │  │  (8 pages) │  │ (9 comps)  │  │  - Peer Conn     │   │  │
│  │  └────────────┘  └────────────┘  │  - Media Stream  │   │  │
│  │                                   └──────────────────┘   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │  │
│  │  │   Hooks    │  │  Context   │  │  Proctoring      │   │  │
│  │  │  - Auth    │  │  - Auth    │  │  - Face API      │   │  │
│  │  │  - Scroll  │  │            │  │  - Eye Track     │   │  │
│  │  └────────────┘  └────────────┘  └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST (Axios)
                              │ WebSocket (Signaling)
                              │ WebRTC (P2P Media)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Django + Channels                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │  │
│  │  │  REST API  │  │ WebSocket  │  │   Auth System    │   │  │
│  │  │  - Auth    │  │ - Signaling│  │   - JWT          │   │  │
│  │  │  - Sessions│  │ - Rooms    │  │   - User Model   │   │  │
│  │  │  - Alerts  │  │            │  │                  │   │  │
│  │  └────────────┘  └────────────┘  └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Database Queries
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   MongoDB    │  │    Redis     │  │   SQLite (Django)    │ │
│  │  - Sessions  │  │  - Channels  │  │   - Users            │ │
│  │  - Alerts    │  │  - WS State  │  │   - Admin            │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Registration Flow

```
User Browser                Frontend                Backend                 Database
     │                         │                       │                       │
     │──── Fill Form ─────────>│                       │                       │
     │                         │                       │                       │
     │                         │─── POST /auth/register/ ──>                   │
     │                         │                       │                       │
     │                         │                       │─── Create User ──────>│
     │                         │                       │                       │
     │                         │                       │<─── User Created ─────│
     │                         │                       │                       │
     │                         │<─── JWT Tokens ───────│                       │
     │                         │                       │                       │
     │<─── Store Tokens ───────│                       │                       │
     │                         │                       │                       │
     │<─── Redirect Dashboard ─│                       │                       │
```

### 2. Session Creation Flow

```
Host                    Frontend                Backend                MongoDB
 │                         │                       │                     │
 │─── Create Session ─────>│                       │                     │
 │                         │                       │                     │
 │                         │─── POST /sessions/create/ ──>               │
 │                         │                       │                     │
 │                         │                       │─── Generate Code ───│
 │                         │                       │    (6 chars)        │
 │                         │                       │                     │
 │                         │                       │─── Save Session ───>│
 │                         │                       │                     │
 │                         │<─── Session + Code ───│                     │
 │                         │                       │                     │
 │<─── Display Code ───────│                       │                     │
 │    (ABC123)             │                       │                     │
```

### 3. WebRTC Connection Flow

```
Host Browser          WebSocket Server         Candidate Browser
     │                       │                         │
     │─── join (host) ──────>│                         │
     │                       │                         │
     │                       │<─── join (candidate) ───│
     │                       │                         │
     │<─── peer_joined ──────│                         │
     │                       │                         │
     │─── offer (SDP) ───────>│                         │
     │                       │                         │
     │                       │─── offer (SDP) ────────>│
     │                       │                         │
     │                       │<─── answer (SDP) ───────│
     │                       │                         │
     │<─── answer (SDP) ─────│                         │
     │                       │                         │
     │─── ICE candidate ─────>│                         │
     │                       │─── ICE candidate ──────>│
     │                       │                         │
     │<═══════════════ WebRTC P2P Connection ═════════>│
     │              (Direct audio/video stream)        │
```

### 4. Proctoring Alert Flow

```
Candidate Browser     Proctoring Engine      WebSocket       Host Browser
      │                      │                   │                │
      │                      │                   │                │
      │─── Video Stream ────>│                   │                │
      │                      │                   │                │
      │                      │─── Detect Face ───│                │
      │                      │    (face-api.js)  │                │
      │                      │                   │                │
      │                      │─── Multiple Faces!│                │
      │                      │                   │                │
      │                      │─── alert ────────>│                │
      │                      │    {type: "extra_face"}            │
      │                      │                   │                │
      │                      │                   │─── alert ─────>│
      │                      │                   │                │
      │                      │                   │                │<─ Update UI
      │                      │                   │                │   Risk Score++
```

## Component Architecture

### Frontend Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Landing
│       │   ├── Navbar
│       │   ├── StarfieldCanvas
│       │   ├── PillBadge
│       │   ├── Button
│       │   ├── Card
│       │   └── CodeBlock
│       │
│       ├── Login
│       │   ├── StarfieldCanvas
│       │   ├── Card
│       │   └── Button
│       │
│       ├── Register
│       │   ├── StarfieldCanvas
│       │   ├── Card
│       │   └── Button
│       │
│       ├── Dashboard
│       │   ├── StarfieldCanvas
│       │   ├── Card
│       │   └── Button
│       │
│       ├── CreateSession
│       │   ├── StarfieldCanvas
│       │   ├── PillBadge
│       │   ├── Card
│       │   └── Button
│       │
│       ├── Join
│       │   ├── StarfieldCanvas
│       │   ├── Card
│       │   └── Button
│       │
│       ├── Room
│       │   ├── VideoTile (x2)
│       │   ├── RiskGauge
│       │   ├── AlertFeed
│       │   └── Button
│       │
│       └── Monitor
│           ├── Card
│           ├── VideoTile (x4)
│           └── Button
```

### Backend Module Structure

```
securehire/
├── settings.py (Configuration)
├── urls.py (Main routing)
├── asgi.py (ASGI + Channels)
└── wsgi.py (WSGI)

apps/
├── auth_app/
│   ├── models.py (User)
│   ├── views.py (register, login, get_user)
│   ├── serializers.py (UserSerializer, RegisterSerializer)
│   └── urls.py
│
├── sessions/
│   ├── models.py (SessionManager + MongoDB)
│   ├── views.py (CRUD operations)
│   ├── serializers.py (SessionSerializer)
│   └── urls.py
│
└── alerts/
    ├── models.py (AlertManager + MongoDB)
    ├── views.py (create, list)
    └── urls.py

signaling/
├── consumers.py (SignalingConsumer)
└── routing.py (WebSocket URLs)
```

## Database Schema

### MongoDB Collections

#### sessions
```javascript
{
  _id: ObjectId,
  code: String (6 chars, unique),
  title: String,
  mode: String ('interview' | 'meeting'),
  hostId: String,
  participants: Array,
  config: {
    eyeTracking: Boolean,
    multiFace: Boolean,
    voiceDetection: Boolean,
    tabSwitch: Boolean,
    copyPaste: Boolean,
    riskThreshold: String ('low' | 'medium' | 'high')
  },
  status: String ('waiting' | 'active' | 'ended'),
  startedAt: Date,
  endedAt: Date,
  createdAt: Date
}
```

#### alerts
```javascript
{
  _id: ObjectId,
  sessionCode: String,
  participantId: String,
  alertType: String,
  riskDelta: Number,
  metadata: Object,
  timestamp: Date
}
```

### SQLite Tables (Django)

#### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(150) UNIQUE,
  email VARCHAR(254) UNIQUE,
  password VARCHAR(128),
  first_name VARCHAR(150),
  last_name VARCHAR(150),
  google_id VARCHAR(255) UNIQUE,
  is_active BOOLEAN,
  is_staff BOOLEAN,
  date_joined DATETIME
);
```

## Security Architecture

### Authentication Flow
```
1. User registers/logs in
2. Backend generates JWT (access + refresh)
3. Frontend stores tokens in localStorage
4. Every API request includes: Authorization: Bearer <token>
5. Backend validates JWT on each request
6. If expired, frontend uses refresh token
7. If refresh fails, redirect to login
```

### WebRTC Security
```
- Peer-to-peer encrypted connection (DTLS-SRTP)
- No media passes through server
- STUN server for NAT traversal
- TURN server recommended for production
```

### CORS Configuration
```
Backend allows requests from:
- http://localhost:5173 (development)
- https://yourdomain.com (production)

Credentials allowed for JWT cookies
```

## Scalability Considerations

### Current Architecture (MVP)
- WebRTC: Peer-to-peer (1:1 only)
- WebSocket: Single server with Redis
- Database: Single MongoDB instance

### Production Scaling
```
┌─────────────┐
│   CDN       │ (Static assets)
└─────────────┘
       │
┌─────────────┐
│ Load Balancer│
└─────────────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐ ┌──▼──┐
│App 1│ │App 2│ (Django + Channels)
└──┬──┘ └──┬──┘
   │       │
   └───┬───┘
       │
┌──────▼──────┐
│ Redis Cluster│ (Channel layer)
└─────────────┘
       │
┌──────▼──────┐
│MongoDB Atlas│ (Replica set)
└─────────────┘
```

### For Meeting Mode (1:Many)
- Add mediasoup SFU (Selective Forwarding Unit)
- Server receives all streams
- Forwards to participants selectively
- Reduces client bandwidth requirements

## Monitoring & Logging

### Application Logs
```
Backend: Django logging to console/file
Frontend: Browser console + error boundaries
WebSocket: Connection/disconnection events
WebRTC: ICE connection state changes
```

### Metrics to Track
- Active sessions count
- WebRTC connection success rate
- Alert frequency by type
- API response times
- WebSocket message latency

## Deployment Architecture

### Development
```
localhost:5173 (Vite dev server)
localhost:8000 (Daphne)
localhost:27017 (MongoDB)
localhost:6379 (Redis)
```

### Production
```
Frontend: Vercel/Netlify (CDN)
Backend: AWS EC2/DigitalOcean (Docker)
MongoDB: MongoDB Atlas
Redis: Redis Cloud/AWS ElastiCache
WebRTC: Coturn (TURN server)
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 | UI components |
| Build Tool | Vite | Fast dev server & bundling |
| Routing | React Router v6 | Client-side routing |
| HTTP Client | Axios | API requests |
| State Management | Context API | Auth state |
| Styling | Inline styles | Component styling |
| Animation | Canvas API | Starfield background |
| Face Detection | face-api.js | AI proctoring |
| Video/Audio | WebRTC | P2P communication |
| Backend Framework | Django 4.2 | REST API |
| API Framework | DRF | RESTful endpoints |
| WebSocket | Django Channels | Real-time signaling |
| Authentication | JWT | Token-based auth |
| Database (Sessions) | MongoDB | NoSQL storage |
| Database (Users) | SQLite | Django ORM |
| Cache/Channels | Redis | WebSocket layer |
| ASGI Server | Daphne | Async server |

---

This architecture provides a solid foundation for a production-ready interview platform with room for scaling and feature additions.
