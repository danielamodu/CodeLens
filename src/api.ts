export type Mode = 'algo' | 'security';

export interface AnalysisResult {
  blind_spot: string;
  severity: 'high' | 'medium' | 'low';
  why: string;
  fix: string;
  drill_topic: string;
}

export interface PatternResult {
  pattern: string;
  focus: string;
}

const SYSTEM_PROMPTS: Record<Mode, string> = {
  algo: `Analyze the code for algorithmic efficiency and return ONLY valid JSON (no markdown, no backticks):
{
  "blind_spot": "one-line weakness name",
  "severity": "low|medium|high",
  "why": "2 sentences max",
  "fix": "one concrete suggestion",
  "drill_topic": "interviewcake url slug e.g. hash-table"
}`,
  security: `Analyze the code for security vulnerabilities (injection, hardcoded secrets, unsafe eval, unvalidated input) and return ONLY valid JSON (no markdown, no backticks):
{
  "blind_spot": "one-line weakness name",
  "severity": "low|medium|high",
  "why": "2 sentences max",
  "fix": "one concrete suggestion",
  "drill_topic": "interviewcake url slug e.g. hash-table"
}`,
};

function parseAndValidateResponse(rawContent: string): AnalysisResult {
  let cleaned = rawContent.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  const parsed = JSON.parse(cleaned);

  const severityLower = String(parsed.severity || '').toLowerCase();
  const severity: 'high' | 'medium' | 'low' = 
    severityLower === 'high' || severityLower === 'medium' || severityLower === 'low'
      ? severityLower
      : 'medium';

  return {
    blind_spot: parsed.blind_spot || 'Unspecified weakness',
    severity,
    why: parsed.why || 'No explanation provided.',
    fix: parsed.fix || 'No fix suggested.',
    drill_topic: parsed.drill_topic || 'general',
  };
}

function parseAndValidatePattern(rawContent: string): PatternResult {
  let cleaned = rawContent.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  const parsed = JSON.parse(cleaned);

  return {
    pattern: parsed.pattern || 'Recurring performance or code structure bottleneck.',
    focus: parsed.focus || 'Review core data structures and algorithmic complexity.',
  };
}

async function callLLM(systemPrompt: string, userMessage: string): Promise<string> {
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  if (openRouterKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: 'anthropic/claude-haiku-4-5',
          temperature: 0.3,
          max_tokens: 500,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      }
      console.warn('OpenRouter call failed or empty response, attempting Groq fallback...');
    } catch (err) {
      console.warn('OpenRouter error, attempting Groq fallback...', err);
    }
  }

  if (groqKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
    }
    const errorText = await response.text();
    throw new Error(`Groq API error: ${errorText}`);
  }

  throw new Error('No API keys configured or active LLM calls failed.');
}

export async function analyzeCode(code: string, mode: Mode): Promise<AnalysisResult> {
  if (!code.trim()) {
    throw new Error('Please paste some code before analyzing.');
  }

  const rawContent = await callLLM(SYSTEM_PROMPTS[mode], code);
  return parseAndValidateResponse(rawContent);
}

export async function analyzePattern(historyItems: Array<{ blind_spot: string; drill_topic: string }>): Promise<PatternResult> {
  const itemsText = historyItems
    .map((item, idx) => `${idx + 1}. Blind Spot: "${item.blind_spot}" (Topic: ${item.drill_topic})`)
    .join('\n');

  const prompt = `Given these repeated blind spots from a developer's recent code analyses:\n${itemsText}\n\nIn 2 sentences max, identify their single biggest recurring weakness and what they should focus on. Return ONLY valid JSON: { "pattern": "one-line summary", "focus": "what to study" }`;

  const systemPrompt = `You are an expert developer mentor. Return ONLY valid JSON with fields "pattern" and "focus".`;

  const rawContent = await callLLM(systemPrompt, prompt);
  return parseAndValidatePattern(rawContent);
}
