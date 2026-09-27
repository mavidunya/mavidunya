const SUPABASE_URL = "BURAYA_SUPABASE_URL";
const SUPABASE_KEY = "BURAYA_SUPABASE_KEY";

async function testConnection() {
  try {
    const response = await fetch(SUPABASE_URL + "/rest/v1/profiles?select=*", {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      }
    });
    if (!response.ok) throw new Error("Bağlantı hatası: " + response.status);
    const data = await response.json();
    console.log("Bağlantı başarılı! Kullanıcılar:", data);
    return data;
  } catch (error) {
    console.error("Hata:", error);
    return null;
  }
}

testConnection();
