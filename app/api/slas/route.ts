import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Configuración del adaptador para Prisma 7+
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Obtener todos los SLAs (GET)
export async function GET() {
  try {
    const slas = await prisma.slaRecord.findMany({
      orderBy: { department: 'asc' }
    });
    return NextResponse.json(slas);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo los SLAs' }, { status: 500 });
  }
}

// Crear un nuevo SLA (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSla = await prisma.slaRecord.create({
      data: body,
    });
    return NextResponse.json(newSla, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creando el SLA' }, { status: 500 });
  }
}