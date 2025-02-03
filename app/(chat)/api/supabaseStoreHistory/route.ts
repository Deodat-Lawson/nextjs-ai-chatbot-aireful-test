// pages/api/notes.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // CREATE: Insert a new note (HTTP POST)
    if (req.method === 'POST') {
        const { title, content } = req.body;
        const { data, error } = await supabase
            .from('notes')
            .insert([{ title, content }]);

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
    }

    // READ: Get all notes (HTTP GET)
    else if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('notes')
            .select('*');

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
    }

    // UPDATE: Update a note (HTTP PUT)
    else if (req.method === 'PUT') {
        const { id, title, content } = req.body;
        const { data, error } = await supabase
            .from('notes')
            .update({ title, content })
            .eq('id', id);

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
    }

    // DELETE: Delete a note (HTTP DELETE)
    else if (req.method === 'DELETE') {
        const { id } = req.body;
        const { data, error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id);

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json(data);
    }

    // If the method is not supported, return a 405 error
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
