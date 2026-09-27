const SUPABASE_URL = "https://bwdoiltmkrqfxqknedih.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZG9pbHRta3JxZnhxa25lZGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTkzNjcsImV4cCI6MjEwNjAzNTM2N30.mx1O66LItD6Q6ED1Z75YzGXW7ijSDUVAl9R2df4Km8o";

async function testConnection() {
  try {
    const response = await fetch(SUPABASE_URL + "/rest/v1/profiles?select=*", {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      }
    });
    if (!response.ok) throw new Error("Baglanti hatasi: " + response.status);
    const data = await response.json();
    console.log("Baglanti basarili! Kullanicilar:", data);
    return data;
  } catch (error) {
    console.error("Hata:", error);
    return null;
  }
}

testConnection();
