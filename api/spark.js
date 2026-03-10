console.log('[spark] env keys available:', Object.keys(process.env).filter(k => k.includes('ANTHROPIC')));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[spark] ANTHROPIC_API_KEY is not set');
    return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
  }

  const { messages, system } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system,
      messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[spark] Anthropic API error:', response.status, data);
    return res.status(response.status).json({
      error: data?.error?.message || data?.message || 'Anthropic API request failed',
      ...data,
    });
  }

  res.status(200).json(data);
}
