# Stream Metadata Setup (Optional)

The radio site now includes **station logos** and **"Now Playing" song detection**, but due to CORS restrictions, metadata fetching must be done server-side.

## Current Status

✅ **Station Logos**: Working (uses initials fallback)  
✅ **Station Info**: Working (country, genre, type)  
⚠️ **Song Metadata**: Requires backend implementation

## To Enable "Now Playing" Songs

If you want to show current songs, add this endpoint to your backend:

### Backend Endpoint

```javascript
// GET /metadata?stream=<stream_url>
app.get('/metadata', async (req, res) => {
  const streamUrl = req.query.stream;
  
  try {
    // Extract hostname from stream URL
    const url = new URL(streamUrl);
    
    // Try common Icecast metadata endpoints
    const endpoints = [
      `${url.protocol}//${url.host}/status-json.xsl`,
      `${url.protocol}//${url.host}/stats`,
      `${url.protocol}//${url.host}/currentsong`
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.text();
          
          // Parse JSON response
          if (data.startsWith('{')) {
            const json = JSON.parse(data);
            if (json.icestats?.source?.title) {
              return res.json({
                title: json.icestats.source.title,
                song: json.icestats.source.title
              });
            }
          }
          
          // Parse HTML/XML response
          const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
          const songMatch = data.match(/now playing[:\s]*([^<\n]+)/i);
          
          if (titleMatch || songMatch) {
            return res.json({
              title: songMatch?.[1] || titleMatch?.[1],
              song: songMatch?.[1] || titleMatch?.[1]
            });
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    res.json({ title: null, song: null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});
```

### What This Enables

- ♪ **Real-time song titles** in the player footer
- 🔄 **Auto-updates** every 60 seconds
- 🎵 **Blue song indicator** with music note

### Alternative: Radio Browser API

Some stations provide metadata through the Radio Browser API. You could also enhance your backend to fetch this data when importing stations.

---

**Note**: This is completely optional. The radio site works perfectly without song metadata!