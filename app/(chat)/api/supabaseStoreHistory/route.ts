// app/api/chatHistory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Define an interface for the chat history record
interface ChatHistory {
    conv_id?: string;
    title: string;
    user_id: string;
    conversation_history: any; // You can replace `any` with a more specific type if desired
    created_at?: string;
    updated_at?: string;
}

/**
 * GET /api/chatHistory?user_id=...
 * Retrieves chat history records for a given user.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
        return NextResponse.json(
            { error: 'user_id query parameter is required' },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from<ChatHistory>('chat_history')
        .select('*')
        .eq('user_id', user_id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

/**
 * POST /api/chatHistory
 * Inserts a new chat history record.
 *
 * Expected JSON body:
 * {
 *   "title": "Conversation Title",
 *   "user_id": "user-uuid",
 *   "conversation_history": { ... }  // A valid JSON object representing the conversation history.
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, user_id, conversation_history } = body;

        // Basic validation
        if (!title || !user_id || !conversation_history) {
            return NextResponse.json(
                { error: 'Missing required fields: title, user_id, conversation_history' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from<ChatHistory>('chat_history')
            .insert([{ title, user_id, conversation_history }]);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
