import { NextRequest, NextResponse } from 'next/server';

interface StoredEvent {
  id: string;
  type: string;
  tokenNumber: string;
  counterNumber?: number;
  counterNameGu?: string;
  talukaId?: string;
  timestamp: number;
  payload?: any;
}

// In-memory backend event store across server requests (persists across hot-reloads)
const globalForEvents = globalThis as unknown as {
  globalEventStore?: StoredEvent[];
  globalActiveTokens?: Record<string, { counterNumber: number; timestamp: number }>;
};

const globalEventStore: StoredEvent[] = globalForEvents.globalEventStore || [];
if (!globalForEvents.globalEventStore) {
  globalForEvents.globalEventStore = globalEventStore;
}

const globalActiveTokens: Record<string, { counterNumber: number; timestamp: number }> = 
  globalForEvents.globalActiveTokens || {};
if (!globalForEvents.globalActiveTokens) {
  globalForEvents.globalActiveTokens = globalActiveTokens;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const since = Number(searchParams.get('since') || 0);

  const newEvents = globalEventStore.filter(e => e.timestamp > since);
  
  return NextResponse.json({
    success: true,
    serverTime: Date.now(),
    activeTokens: globalActiveTokens,
    events: newEvents
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tokenNumber = body.tokenNumber;
    const counterNumber = body.counterNumber;

    // Authoritative double-call / state-conflict validation
    if (body.type === 'TOKEN_CALLED' && tokenNumber) {
      const active = globalActiveTokens[tokenNumber];
      // If token is currently active at another counter (within last 30 minutes)
      if (active && active.counterNumber !== counterNumber && (Date.now() - active.timestamp < 30 * 60 * 1000)) {
        return NextResponse.json({
          success: false,
          error: `Token ${tokenNumber} is already being handled by Counter ${active.counterNumber}.`
        }, { status: 409 });
      }
      globalActiveTokens[tokenNumber] = {
        counterNumber: counterNumber || 1,
        timestamp: Date.now()
      };
    } else if (['TOKEN_COMPLETED', 'TOKEN_SKIPPED', 'TOKEN_TRANSFERRED', 'TOKEN_CANCELLED'].includes(body.type) && tokenNumber) {
      delete globalActiveTokens[tokenNumber];
    }

    const event: StoredEvent = {
      id: body.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: body.type,
      tokenNumber: body.tokenNumber,
      counterNumber: body.counterNumber,
      counterNameGu: body.counterNameGu,
      talukaId: body.talukaId,
      timestamp: body.timestamp || Date.now(),
      payload: body.payload
    };

    globalEventStore.push(event);

    // Keep memory clean: cap at last 100 events
    if (globalEventStore.length > 100) {
      globalEventStore.shift();
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
