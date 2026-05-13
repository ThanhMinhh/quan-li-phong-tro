import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HoaDon from '@/models/HoaDon';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  const count = await HoaDon.countDocuments();
  return NextResponse.json({ count });
}
