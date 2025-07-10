
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import type { Category } from '@/lib/types';

export async function GET() {
  try {
    const categories = await db.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[API_ERROR] /api/categories GET:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body: Omit<Category, 'id'> = await request.json();
        const newCategory = await db.createCategory(body);
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error('[API_ERROR] /api/categories POST:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
