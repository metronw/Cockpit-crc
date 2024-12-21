import { NextResponse } from 'next/server';
import prisma from '@/app/lib/localDb'; // Adjust path based on your setup

export async function GET() {
  try {
    const prefixes = await prisma.phonePrefix.findMany();
    return NextResponse.json(prefixes, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar os prefixos:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao buscar os prefixos' },
      { status: 500 }
    );
  }
}
