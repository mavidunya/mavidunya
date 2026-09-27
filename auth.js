const SUPABASE_URL = "https://bwdoiltmkrqfxqknedih.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZG9pbHRta3JxZnhxa25lZGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTkzNjcsImV4cCI6MjEwNjAzNTM2N30.mx1O66LItD6Q6ED1Z75YzGXW7ijSDUVAl9R2df4Km8o";

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
