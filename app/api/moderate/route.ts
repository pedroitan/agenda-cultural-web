import { NextRequest, NextResponse } from "next/server";

// Lista de palavrões em português (básico)
const BAD_WORDS = [
  // Palavrões comuns
  "caralho", "porra", "puta", "merda", "foda", "fodase", "fdp", "filho da puta",
  "arrombado", "buceta", "xoxota", "pica", "pau", "caral", "cacete", "bosta",
  "cagão", "cagar", "cagado", "desgraça", "desgraçado", "porcaria",
  "viado", "bicha", "boiola", "sapatão", "traveco",
  "vagabundo", "vadia", "piranha", "prostituta", "putaria",
  // Variações comuns
  "caralh0", "p0rra", "put@", "m3rda", "f0da", "f0d4",
];

// Padrões de spam
const SPAM_PATTERNS = [
  // URLs repetidas
  /(https?:\/\/[^\s]+)\s+\1/gi,
  // Palavras repetidas excessivamente
  /(\b\w+\b)\s+\1\s+\1/gi,
  // Muitas menções @
  /(@\w+\s+){5,}/g,
  // Texto em caixa alta excessivo
  /^[A-Z\s]{20,}$/,
  // Caracteres especiais excessivos
  /[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]{10,}/g,
];

// Padrões de NSFW (básico)
const NSFW_KEYWORDS = [
  "porn", "xxx", "sexo", "nude", "naked", "adult", "erotic",
  "18+", "onlyfans", "camgirls", "webcam", "striptease",
  "escort", "massagem", "sensual", "erótico", "erótica",
];

interface ModerationResult {
  isFlagged: boolean;
  score: number;
  reasons: string[];
}

function checkProfanity(text: string): string[] {
  const reasons: string[] = [];
  const normalizedText = text.toLowerCase().replace(/[0-9@]/g, (c) => {
    const map: Record<string, string> = {
      "0": "o", "1": "i", "3": "e", "4": "a", "@": "a", "$": "s"
    };
    return map[c] || c;
  });

  for (const word of BAD_WORDS) {
    if (normalizedText.includes(word)) {
      reasons.push(`Contém linguagem ofensiva: "${word}"`);
    }
  }

  return reasons;
}

function checkSpam(text: string, email: string): string[] {
  const reasons: string[] = [];

  // Verificar padrões de spam no texto
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      reasons.push("Padrão de spam detectado no texto");
      break;
    }
  }

  // Verificar email suspeito
  const disposableEmailDomains = [
    "tempmail.com", "throwaway.com", "fakeemail.com", "10minutemail.com",
    "guerrillamail.com", "mailinator.com", "tempmail.de"
  ];
  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (disposableEmailDomains.includes(emailDomain)) {
    reasons.push("Email temporário/descartável detectado");
  }

  // Verificar se o mesmo email já enviou muitas submissões recentemente
  // (isso seria verificado no banco de dados, aqui é apenas um placeholder)

  return reasons;
}

function checkNSFW(text: string): string[] {
  const reasons: string[] = [];
  const normalizedText = text.toLowerCase();

  for (const keyword of NSFW_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      reasons.push(`Contém conteúdo NSFW: "${keyword}"`);
    }
  }

  return reasons;
}

function calculateScore(reasons: string[]): number {
  // Base score starts at 0
  let score = 0;

  // Profanity: +30 points
  if (reasons.some(r => r.includes("linguagem ofensiva"))) {
    score += 30;
  }

  // NSFW: +40 points
  if (reasons.some(r => r.includes("NSFW"))) {
    score += 40;
  }

  // Spam: +20 points
  if (reasons.some(r => r.includes("spam") || r.includes("temporário"))) {
    score += 20;
  }

  return Math.min(score, 100);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, contact_email } = body;

    if (!title || !contact_email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const reasons: string[] = [];
    const textToCheck = `${title} ${description || ""}`;

    // Verificar profanity
    const profanityReasons = checkProfanity(textToCheck);
    reasons.push(...profanityReasons);

    // Verificar NSFW
    const nsfwReasons = checkNSFW(textToCheck);
    reasons.push(...nsfwReasons);

    // Verificar spam
    const spamReasons = checkSpam(textToCheck, contact_email);
    reasons.push(...spamReasons);

    // Calcular score
    const score = calculateScore(reasons);
    const isFlagged = score > 50 || reasons.length > 0;

    const result: ModerationResult = {
      isFlagged,
      score,
      reasons: reasons.length > 0 ? reasons : [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Moderation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
