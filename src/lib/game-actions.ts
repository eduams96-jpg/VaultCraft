"use client";

/**
 * Pede ao servidor local para iniciar um jogo ("launch") ou abrir a sua pasta ("open").
 * Mostra o motivo ao utilizador quando falha (ex.: executável movido ou apagado) —
 * antes a resposta era ignorada e o botão "Jogar" simplesmente não fazia nada.
 */
export async function requestGameLaunch(
  gameId: string,
  action: "launch" | "open" = "launch"
): Promise<boolean> {
  try {
    const res = await fetch(`/api/games/${gameId}/launch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) return true;

    const data = await res.json().catch(() => null);
    alert(
      data?.error ||
        (action === "open" ? "Não foi possível abrir a pasta do jogo." : "Não foi possível iniciar o jogo.")
    );
  } catch {
    alert("Não foi possível contactar o servidor local do VaultCraft.");
  }
  return false;
}
