import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const appId = searchParams.get("appId");
  const query = searchParams.get("query");

  try {
    if (appId) {
      const res = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=price_overview&cc=pt&l=portuguese`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: AbortSignal.timeout(3500),
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data[appId]?.success && data[appId]?.data?.price_overview) {
          const po = data[appId].data.price_overview;
          return NextResponse.json({
            found: true,
            appId: parseInt(appId, 10),
            currency: po.currency || "EUR",
            initialPrice: po.initial / 100,
            finalPrice: po.final / 100,
            discountPercent: po.discount_percent || 0,
            formatted: po.final_formatted,
            isFree: false,
          });
        } else if (data[appId]?.data?.is_free) {
          return NextResponse.json({
            found: true,
            appId: parseInt(appId, 10),
            currency: "EUR",
            initialPrice: 0,
            finalPrice: 0,
            discountPercent: 0,
            formatted: "Grátis",
            isFree: true,
          });
        }
      }
    }

    if (query) {
      const searchRes = await fetch(
        `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
          query
        )}&l=portuguese&cc=pt`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: AbortSignal.timeout(3500),
        }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.items && searchData.items.length > 0) {
          const item = searchData.items[0];
          if (item.price) {
            return NextResponse.json({
              found: true,
              appId: item.id,
              name: item.name,
              currency: item.price.currency || "EUR",
              initialPrice: item.price.initial / 100,
              finalPrice: item.price.final / 100,
              discountPercent: item.price.discount_percent || 0,
              formatted: `${(item.price.final / 100).toFixed(2)}€`,
              isFree: false,
            });
          } else {
            return NextResponse.json({
              found: true,
              appId: item.id,
              name: item.name,
              currency: "EUR",
              initialPrice: 0,
              finalPrice: 0,
              discountPercent: 0,
              formatted: "Grátis / Não Definido",
              isFree: true,
            });
          }
        }
      }
    }

    return NextResponse.json({ found: false, message: "Preço não encontrado." });
  } catch (error) {
    console.error("Steam price lookup error:", error);
    return NextResponse.json(
      { found: false, error: "Erro ao consultar a loja Steam." },
      { status: 500 }
    );
  }
}
