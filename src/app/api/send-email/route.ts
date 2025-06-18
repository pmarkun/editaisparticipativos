import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const data = await req.json();
  console.log('Sending email', data);
  // TODO: integrate email service
  return NextResponse.json({ ok: true });
}
