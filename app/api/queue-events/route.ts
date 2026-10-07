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

// In-memory backend event store across server requests
const globalEventStore: StoredEvent[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const since = Number(searchParams.get('since') || 0);

  const newEvents = globalEventStore.filter(e => e.timestamp > since);
  
  return NextResponse.json({
    success: true,
    serverTime: Date.now(),
    events: newEvents
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
