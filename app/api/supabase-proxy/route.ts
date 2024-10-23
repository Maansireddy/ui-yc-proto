import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')

  if (!table) {
    return NextResponse.json({ error: 'Invalid table parameter' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.from(table).select('*')
    
    if (error) {
      throw error
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Supabase query error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
