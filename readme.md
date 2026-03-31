# ⚡ EventFlow

> A lightweight, fault-tolerant event streaming backend built with Node.js, Redis, and MongoDB.

EventFlow implements an **offset-based event log** with atomic offset generation, pull-based consumption, and a full fault-tolerance pipeline — retries, dead-letter queuing, and live metrics.

---

## 📐 Architecture Overview

```
┌─────────────┐     POST /publish      ┌──────────────────────────────────────┐
│   Producer  │ ─────────────────────► │              EventFlow               │
└─────────────┘                        │                                      │
                                       │  Redis INCR  →  Atomic Offset        │
                                       │  MongoDB     →  Append-Only Log      │
                                       └──────────────────┬───────────────────┘
                                                          │  GET /consume
                                              ┌───────────▼───────────┐
                                              │    Consumer Worker    │
                                              │  ┌─────────────────┐  │
                                              │  │  Process Event  │  │
                                              │  └────────┬────────┘  │
                                              │      ✅ success       │
                                              │      ❌ retry x3      │
                                              │      💀 → DLQ         │
                                              └───────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔢 **Atomic Offsets** | Redis `INCR` ensures no race conditions across concurrent publishers |
| 📜 **Append-Only Log** | Events stored in MongoDB — fully replayable, never overwritten |
| 📥 **Pull-Based Consumption** | Consumers control their own pace using `offset > lastOffset` queries |
| 🔁 **Retry Mechanism** | Each event is retried up to **3 times** before escalation |
| 💀 **Dead Letter Queue** | Failed events are isolated in a separate `dead_events` collection |
| 📊 **Live Metrics** | Track total events, failures, and consumer lag per event type |

---

## 📁 Project Structure

```
EventFlow/
│
├── config/
│   ├── db.js                  # MongoDB connection
│   └── redis.js               # Redis connection
│
├── controller/
│   ├── publishController.js   # Handle event ingestion
│   ├── consumeController.js   # Serve events to consumers
│   ├── dlqController.js       # Dead letter queue writes
│   ├── metricsController.js   # Lag and stats tracking
│   └── healthController.js    # Health check endpoint
│
├── model/
│   ├── publishModel.js        # Event schema
│   └── dlqModel.js            # DLQ schema
│
├── routes/
│   └── Route.js               # All route definitions
│
├── consumer/
│   └── consumer.js            # Standalone worker script
│
├── app.js
├── server.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js
- MongoDB (running locally)
- Redis (running locally)

### 1. Start MongoDB

```bash
mongod
```

### 2. Start Redis

```bash
redis-server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
node server.js
```

Server runs at **http://localhost:3000**

---

## 📡 API Reference

### `POST /publish`

Publish a new event to the log.

**Request body:**
```json
{
  "type": "email",
  "data": { "msg": "hello" }
}
```

**What happens internally:**
1. Redis `INCR offset:<type>` → generates an atomic offset
2. Event stored in MongoDB: `{ type, data, offset }`
3. Metrics updated: `totalEvents++`, `latestOffset` refreshed

---

### `GET /consume`

Fetch events after a given offset.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `type` | string | Event type to consume (e.g. `email`) |
| `offset` | number | Return events with offset greater than this value |

**Example:**
```
GET /consume?type=email&offset=5
```

**Response:**
```json
{
  "events": [
    { "offset": 6, "type": "email", "data": { "msg": "hello" } },
    { "offset": 7, "type": "email", "data": { "msg": "world" } }
  ]
}
```

---

### `POST /dlq`

Internally called by the consumer worker when an event exhausts all retries. Stores the failed event in the `dead_events` MongoDB collection.

---

### `GET /metrics`

Get stats for a specific consumer.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `type` | string | Event type |
| `offset` | number | Consumer's current offset |

**Response:**
```json
{
  "totalEvents": 42,
  "failedEvents": 2,
  "consumerLag": 5
}
```

> **Consumer Lag** = `latestOffset - consumerOffset`

---

## ⚙️ Consumer Worker

The worker runs as a **separate process**, continuously polling for new events.

```bash
node consumer/consumer.js
```

### Processing Pipeline

```
fetch events (offset > lastOffset)
     │
     ▼
process event
     │
   ✅ success → update offset → next event
     │
   ❌ failure → retry (up to 3x)
                    │
                  still failing → POST /dlq → move on
```

- Events are processed **sequentially**
- Offset is only updated **after successful processing**
- The DLQ prevents a single bad event from blocking the entire queue

---

## 🔁 End-to-End Flow Example

```bash
# 1. Publish two events
POST /publish  →  { type: "orders", data: { id: 1 } }  →  offset=1
POST /publish  →  { type: "orders", data: { id: 2 } }  →  offset=2

# 2. Consumer starts from offset=0
GET /consume?type=orders&offset=0  →  returns events [1, 2]

# 3. Consumer processes event 1 → success → offset updated to 1
# 4. Consumer processes event 2 → fails → retried 3x → sent to DLQ

# 5. Check metrics
GET /metrics?type=orders&offset=2
→ { totalEvents: 2, failedEvents: 1, consumerLag: 0 }
```

---

## 🧠 Key Engineering Decisions

**Redis for atomic offset generation** — Using `INCR` prevents race conditions when multiple publishers write simultaneously. Each event gets a guaranteed unique, monotonically increasing offset.

**Append-only MongoDB log** — Events are never updated or deleted. This makes the log fully replayable: any consumer can re-read from any offset at any time.

**Pull-based consumption** — Consumers request events on their own schedule rather than being pushed to. This gives consumers full control over throughput and backpressure handling.

**Dead Letter Queue** — Rather than blocking on a failing event indefinitely, failed events are moved to a separate collection after exhausting retries. This keeps the main pipeline healthy and makes failures visible and recoverable.

---

## 🎯 One-Line Summary

> EventFlow is an event-driven backend with offset-based consumption, atomic concurrency handling via Redis, and a fault-tolerant processing pipeline with retry and dead-letter queue support.

---

## 📄 License

MIT