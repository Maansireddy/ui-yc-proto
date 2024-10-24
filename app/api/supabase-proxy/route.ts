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

export async function POST(request: Request) {
  const body = await request.json()
  const { table, data } = body

  if (!table || !data) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  try {
    const { data: insertedData, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json(insertedData)
  } catch (error) {
    console.error('Supabase query error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
