import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock prefix options
    const prefixes = [
      { name: 'Metro', number: '1000' },
      { name: 'UNIFIQUE', number: '6300' },
      { name: 'Echo Test', number: '4321' }
    ];

    // Return the prefix options
    return NextResponse.json(prefixes, { status: 200 });
  } catch (error) {
    console.error('Error fetching prefixes:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching prefixes' },
      { status: 500 }
    );
  }
}
