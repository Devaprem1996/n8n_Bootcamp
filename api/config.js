export default function handler(req, res) {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        res.status(500).json({
            error: 'SUPABASE_URL and SUPABASE_ANON_KEY must be set in Vercel environment variables.'
        });
        return;
    }

    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.status(200).json({
        url,
        anonKey
    });
}

