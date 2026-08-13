(async function init() {
  await requireAuth();

  document.getElementById("todayLabel").textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const today = new Date().toISOString().slice(0, 10);

  const [{ count: totalCount }, { data: allStudents }, { data: todayAttendance }] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("students").select("class").order("id"),
    supabase.from("attendance").select("status").eq("date", today),
  ]);

  document.getElementById("statTotal").textContent = totalCount ?? 0;

  const present = (todayAttendance || []).filter((a) => a.status === "present").length;
  const absent = (todayAttendance || []).filter((a) => a.status === "absent").length;
  document.getElementById("statPresent").textContent = present;
  document.getElementById("statAbsent").textContent = absent;

  const classes = new Set((allStudents || []).map((s) => s.class).filter(Boolean));
  document.getElementById("statClasses").textContent = classes.size;

  const { data: recent, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  const body = document.getElementById("recentBody");

  if (error) {
    body.innerHTML = `<tr><td colspan="4" class="empty-state">Could not load students. ${error.message}</td></tr>`;
    return;
  }

  if (!recent || recent.length === 0) {
    body.innerHTML = `<tr><td colspan="4" class="empty-state">No students added yet. Go to Students to add your first record.</td></tr>`;
    return;
  }

  body.innerHTML = recent.map((s) => `
    <tr>
      <td>
        <div class="student-cell">
          <div class="avatar" style="background:${initialsColor(s.name)}">${getInitials(s.name)}</div>
          <span>${s.name}</span>
        </div>
      </td>
      <td><span class="roll-chip">${s.roll_no || "–"}</span></td>
      <td>${s.class || "–"}${s.section ? " " + s.section : ""}</td>
      <td>${s.parent_phone || "–"}</td>
    </tr>
  `).join("");
})();
