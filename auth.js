const SUPABASE_URL = "https://supabase.com/dashboard/project/bwdoiltmkrqfxqknedih";
const SUPABASE_KEY = "sb_publishable_CLFNEIDYCLTMiHOQ1onzmg_EEwz5_UF";

let supabaseClient = null;

async function supabaseBaslat() {
  if (!supabaseClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseClient;
}

async function girisYap() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("errorMsg");

  errorMsg.style.display = "none";

  if (!email || !password) {
    errorMsg.textContent = "Lütfen email ve şifre girin.";
    errorMsg.style.display = "block";
    return;
  }

  try {
    const client = await supabaseBaslat();
    const { data, error } = await client.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      errorMsg.textContent = "Hatalı giriş: " + error.message;
      errorMsg.style.display = "block";
      return;
    }

    window.location.href = "index.html";
  } catch (err) {
    errorMsg.textContent = "Bir hata oluştu: " + err.message;
    errorMsg.style.display = "block";
  }
}
