import { supabaseAdmin } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    console.log('Updating spot ID:', id);
    console.log('Updates:', JSON.stringify(updates).slice(0, 200));

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('spots')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
