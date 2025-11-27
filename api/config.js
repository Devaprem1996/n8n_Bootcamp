export default function handler(req, res) {
    const url = "https://bovtrdrmivmyglafpojx.supabase.co"
    const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdnRyZHJtaXZteWdsYWZwb2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDk0MzcsImV4cCI6MjA3OTU4NTQzN30.P2eUq0MxyvX_5O0i4B1gjwjcvjbf9vy5lYl05AETHx8";

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

