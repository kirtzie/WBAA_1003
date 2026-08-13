/* ============================================================
   SUPABASE CONFIG
   Paste your project's URL and anon (public) key below.
   Find them in: Supabase Dashboard → Settings → API
   ============================================================ */
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Redirects to login if no active session. Call at the top of every protected page.
async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return null;
  }
  return session;
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

// Deterministic colour for an avatar chip, based on the student's name
function initialsColor(name) {
  const palette = ["#1B2A4A", "#B8562E", "#3F8F5D", "#8A5FB0", "#2F6690", "#C4472C"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
