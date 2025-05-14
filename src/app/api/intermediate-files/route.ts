import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const audioDir = path.join(process.cwd(), 'public', 'audio2');
    const files = fs.readdirSync(audioDir)
      .filter(file => file.endsWith('.mp3'))
      .sort((a, b) => {
        const numA = parseInt(a.split('_')[0]);
        const numB = parseInt(b.split('_')[0]);
        return numA - numB;
      });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error reading intermediate files:', error);
    return NextResponse.json(
      { error: 'Failed to read intermediate files' },
      { status: 500 }
    );
  }
}