const SUPABASE_URL = "https://bwdoiltmkrqfxqknedih.supabase.co";
const SUPABASE_KEY = "const SUPABASE_KEY = "sb_publishable_CLFNE...";

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
