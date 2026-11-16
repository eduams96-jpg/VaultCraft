import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Guarda de segurança para as rotas locais (/api/*).
 *
 * Esta app corre no PC do utilizador e as suas rotas conseguem lançar executáveis,
 * ler/copiar pastas e restaurar a base de dados. Sem esta guarda, qualquer site aberto
 * no browser (CSRF / DNS rebinding) ou outro dispositivo da rede local conseguiria
 * chamá-las. Aqui só passam pedidos:
 *   1. dirigidos a um hostname local conhecido (bloqueia DNS rebinding e acesso por IP da LAN);
 *   2. originados pela própria app (bloqueia pedidos cross-site feitos por outros sites).
 *
 * Para aceder de propósito a partir de outro dispositivo, define a variável de ambiente
 * VAULTCRAFT_ALLOWED_HOSTS com os hostnames extra (separados por vírgulas), por exemplo
 * VAULTCRAFT_ALLOWED_HOSTS=winnas,192.168.1.50
 */
const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1", "[::1]"];

function hostnameOf(hostHeader: string): string {
  const host = hostHeader.trim().toLowerCase();
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    return end === -1 ? host : host.slice(0, end + 1);
  }
  const colon = host.lastIndexOf(":");
  return colon === -1 ? host : host.slice(0, colon);
}

function getAllowedHostnames(): Set<string> {
  const extra = (process.env.VAULTCRAFT_ALLOWED_HOSTS || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...LOCAL_HOSTNAMES, ...extra]);
}

function forbidden(reason: string) {
  return NextResponse.json({ error: `Pedido bloqueado: ${reason}` }, { status: 403 });
}

export function proxy(request: NextRequest) {
  const hostHeader = request.headers.get("host") || "";
  const hostname = hostnameOf(hostHeader);

  if (!getAllowedHostnames().has(hostname)) {
    return forbidden("anfitrião não autorizado.");
  }

  // Browsers modernos enviam Sec-Fetch-Site em todos os pedidos. "same-origin" é a própria
  // app; "none" é navegação direta do utilizador (ex.: download do backup pela barra de endereço).
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return forbidden("origem externa.");
  }

  // Rede de segurança para clientes sem Sec-Fetch-Site: o Origin, quando existe, tem de ser o nosso.
  const origin = request.headers.get("origin");
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host.toLowerCase();
    } catch {
      return forbidden("origem inválida.");
    }
    if (originHost !== hostHeader.trim().toLowerCase()) {
      return forbidden("origem externa.");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
