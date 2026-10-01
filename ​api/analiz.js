export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { mod, macSayisi, tarihStr } = req.body || {};
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const GROQ_KEY = process.env.GROQ_API_KEY;
  const FOOTBALL_KEY = process.env.FOOTBALL_DATA_KEY;

  let macListesi = [];

  // Fikstür API Modu seçildiyse Football-data'dan veri çek
  if (mod === 'football') {
    if (!FOOTBALL_KEY) {
      return res.status(500).json({ error: "Vercel ortamında FOOTBALL_DATA_KEY tanımlı değil." });
    }
    try {
      const fbUrl = `https://api.football-data.org/v4/matches?dateFrom=${tarihStr}&dateTo=${tarihStr}`;
      const fbRes = await fetch(fbUrl, {
        headers: { 'X-Auth-Token': FOOTBALL_KEY }
      });
      if (!fbRes.ok) {
        throw new Error(`Football API yanıt kodu: ${fbRes.status}`);
      }
      const fbData = await fbRes.json();
      if (fbData.matches && fbData.matches.length > 0) {
        macListesi = fbData.matches.slice(0, macSayisi).map(m => ({
          ev_sahibi: m.homeTeam?.name || "?",
          deplasman: m.awayTeam?.name || "?",
          lig: m.competition?.name || "Lig",
          saat: m.utcDate ? new Date(m.utcDate).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'}) : "20:00"
        }));
      }
    } catch (e) {
      return res.status(500).json({ error: "Fikstür Çekme Hatası: " + e.message });
    }

    if (macListesi.length === 0) {
      return res.status(404).json({ error: `Seçilen tarihte (${tarihStr}) oynanacak maç bulunamadı.` });
    }
  }

  // Market Listesi ve Prompt
  const MARKET_LISTESI = [
    "Maç Sonucu (1X2)", "Çifte Şans", "Çifte Şans ve Toplam Alt/Üst", "Handikap", 
    "Herhangi Bir Yarıyı Kazanır", "Geriye Düşüp Berabere Biter", "Geriden Gelip Kazanır", 
    "Toplam Gol Üst/Alt", "KG Var/Yok", "Toplam Gol Aralığı", "Ev Gol Aralığı", 
    "Dep Gol Aralığı", "Ev Gol Yer", "Dep Gol Yer", "Gol Yemeden Kazanır", 
    "İlk Yarı Sonucu", "İkinci Yarı Sonucu", "İlk Yarı Gol", "İkinci Yarı Gol"
  ];

  let prompt = "Sen profesyonel bir futbol bahis ve istatistik analistisin.\n";
  if (mod === "ai") {
    prompt += `Tarih: ${tarihStr}\nGörev: Bu tarihteki en popüler en az ${macSayisi} futbol maçını belirle ve analiz et.\n`;
  } else {
    prompt += `Aşağıdaki maç listesini analiz et:\n${JSON.stringify(macListesi)}\n`;
  }
  prompt += `\nHer maç için Poisson, Elo, Form ve Taktik ajanları ile analiz üret.\nKullanılabilecek bahis marketleri: ${MARKET_LISTESI.join(", ")}\n\n`;
  prompt += `ÇIKTIYI SADECE AŞAĞIDAKİ GEÇERLİ JSON FORMATINDA VER (Ekstra metin veya markdown ekleme):\n`;
  prompt += `{"maclar":[{"ev_sahibi":"...","deplasman":"...","lig":"...","saat":"21:00","ajanlar":{"poisson":{"market":"...","guven":80,"gerekce":"..."},"elo":{"market":"...","guven":75,"gerekce":"..."},"form":{"market":"...","guven":85,"gerekce":"..."},"taktik":{"market":"...","guven":80,"gerekce":"..."}},"ortak_karar":"...","guven":82,"durum":"one_cikan"}]}`;

  // YÖNTEM 1: Önce Gemini API Dene
  if (GEMINI_KEY) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      };
      if (mod === 'ai') {
        body.tools = [{ google_search: {} }];
      }

      const gRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (gRes.ok) {
        const gData = await gRes.json();
        const rawText = gData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const json = parseJSON(rawText);
        if (json) return res.status(200).json(json);
      }
    } catch (e) {
      console.warn("Gemini başarısız oldu, Groq deneniyor:", e.message);
    }
  }

  // YÖNTEM 2: Gemini Başarısız Olursa veya Yoksa Groq API (Llama 3) Dene
  if (GROQ_KEY) {
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const rawText = groqData.choices?.[0]?.message?.content || "";
        const json = parseJSON(rawText);
        if (json) return res.status(200).json(json);
      } else {
        const errTxt = await groqRes.text();
        return res.status(500).json({ error: "Groq API Hatası: " + errTxt.substring(0, 150) });
      }
    } catch (e) {
      return res.status(500).json({ error: "Groq Bağlantı Hatası: " + e.message });
    }
  }

  return res.status(500).json({ error: "Yapay zeka servislerine bağlanılamadı. Lütfen Vercel API anahtarlarını kontrol edin." });
}

function parseJSON(text) {
  try {
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}
