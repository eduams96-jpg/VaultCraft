/**
 * Intelligent game genre extractor and normalizer.
 * Prevents generic placeholders like "video game" or "jogo" and extracts
 * authentic genres from Wikipedia descriptions, page summaries, and titles.
 */

export function extractCleanGenres(
  description?: string | null,
  extract?: string | null,
  fallbackTitle: string = ""
): string | null {
  const genres = new Set<string>();
  const lowerDesc = (description || "").toLowerCase();
  const lowerExt = (extract || "").toLowerCase();
  const combined = `${lowerDesc} ${lowerExt} ${fallbackTitle.toLowerCase()}`;

  // Heuristic rule matching
  if (/party/i.test(combined)) genres.add("Party Games");
  if (/quiz|trivia|question/i.test(combined)) genres.add("Quiz / Trivia");
  if (/music|musical|pop music|dan[çc]a|karaoke/i.test(combined)) genres.add("Música");
  if (/rac(ing|er)|corrida|automobilismo/i.test(combined)) genres.add("Corridas");
  if (/minigame|mini-game|minijogo/i.test(combined)) genres.add("Minijogos");
  if (/junior|infantil|crian[çc]as|children|kids/i.test(combined)) genres.add("Infantil / Família");
  if (/role-playing|\brpg\b|action rpg|jrpg/i.test(combined)) genres.add("RPG");
  if (/first-person shooter|\bfps\b/i.test(combined)) genres.add("FPS / Tiro");
  if (/third-person shooter/i.test(combined)) genres.add("Tiro 3ª Pessoa");
  if (/action-adventure/i.test(combined)) genres.add("Ação-Aventura");
  else if (/action game|\baction\b|ação/i.test(combined) && !genres.has("RPG")) genres.add("Ação");
  if (/platform(er| game)?|plataforma/i.test(combined)) genres.add("Plataformas");
  if (/fighting|luta|brawler|beat 'em up/i.test(combined)) genres.add("Luta");
  if (/survival horror|\bhorror\b|terror/i.test(combined)) genres.add("Terror / Sobrevivência");
  if (/stealth|furtividade/i.test(combined)) genres.add("Furtividade");
  if (/sports|desporto|futebol|soccer|basketball/i.test(combined)) genres.add("Desporto");
  if (/simulat(ion|or)|simula[çc][ãa]o/i.test(combined)) genres.add("Simulação");
  if (/strategy|estrat[ée]gia|\brts\b|turn-based/i.test(combined)) genres.add("Estratégia");
  if (/puzzle|quebra-cabe[çc]as|enigma/i.test(combined)) genres.add("Puzzle");
  if (/hack and slash/i.test(combined)) genres.add("Hack and Slash");
  if (/metroidvania/i.test(combined)) genres.add("Metroidvania");
  if (/roguelike|roguelite/i.test(combined)) genres.add("Roguelike");
  if (/visual novel/i.test(combined)) genres.add("Visual Novel");

  if (genres.size > 0) {
    return Array.from(genres).join(", ");
  }

  // Fallback: check if description had non-generic words
  if (description) {
    const cleaned = description
      .replace(/\b(19\d\d|20\d\d)\b/g, "")
      .replace(/\b(video game|video games|jogo eletrônico|jogo de vídeo|video jogo|game|jogo)\b/gi, "")
      .trim();
    if (cleaned.length > 2) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }

  return null;
}
