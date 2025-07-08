
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import type { Category } from '@/lib/types';

export async function GET() {
  try {
    // This now simulates fetching from a database via the db object
    const categories = await db.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body: Omit<Category, 'id'> = await request.json();
        // This now simulates creating a category in the database
        const newCategory = await db.createCategory(body);
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
