/** Delai (ms) apres lequel News Bot est considere hors ligne cote blog. */
export const BOT_ONLINE_THRESHOLD_MS = 3 * 60 * 1000;

export type BotConnectionStatus =
  | "no_token"
  | "never"
  | "online"
  | "offline"
  | "disconnected";

export function getBotConnectionStatus(
  tokenPresent: boolean,
  lastBotSeenAt?: string,
  botConnectionActive: boolean = true,
): BotConnectionStatus {
  if (!tokenPresent) return "no_token";
  if (botConnectionActive === false) return "disconnected";
  if (!lastBotSeenAt) return "never";
  const diff = Date.now() - new Date(lastBotSeenAt).getTime();
  if (Number.isNaN(diff)) return "never";
  return diff <= BOT_ONLINE_THRESHOLD_MS ? "online" : "offline";
}

export function formatLastSeen(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("fr-FR");
}
