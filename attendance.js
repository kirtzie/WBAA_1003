let students = [];
let statusMap = {}; // student_id -> "present" | "absent"

const listEl = document.getElementById("attendanceList");
const classFilter = document.getElementById("classFilter");
const dateInput = document.getElementById("dateInput");
const saveAllBtn = document.getElementById("saveAllBtn");

dateInput.value = new Date().toISOString().slice(0, 10);

(async function init() {
  await requireAuth();

  const { data, error } = await supabase.from("students").select("*").order("class").order("roll_no");
  if (error) {
    listEl.innerHTML = `<div class="empty-state">Could not load students. ${error.message}</div>`;
    return;
  }
  students = data || [];

  const classes = [...new Set(students.map((s) => s.class).filter(Boolean))].sort();
  classFilter.innerHTML = `<option value="">All classes</option>` +
    classes.map((c) => `<option value="${c}">Class ${c}</option>`).join("");

  await loadAttendanceForDate();
})();

async function loadAttendanceForDate() {
  statusMap = {};
  const { data } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("date", dateInput.value);

  (data || []).forEach((a) => { statusMap[a.student_id] = a.status; });
  render();
}

function render() {
  const cls = classFilter.value;
  const filtered = students.filter((s) => !cls || s.class === cls);

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="empty-state">No students in this class yet.</div>`;
    return;
  }

  listEl.innerHTML = filtered.map((s) => {
    const status = statusMap[s.id] || "present";
    return `
      <div class="attendance-row">
        <div class="student-cell">
          <div class="avatar" style="background:${initialsColor(s.name)}">${getInitials(s.name)}</div>
          <div>
            <div>${s.name}</div>
            <div style="font-size:12px;color:var(--text-muted)">Class ${s.class || "–"}${s.section ? " " + s.section : ""} · Roll ${s.roll_no || "–"}</div>
          </div>
        </div>
        <div class="toggle-group" data-id="${s.id}">
          <button type="button" class="toggle-btn present ${status === "present" ? "active present" : ""}" data-status="present">Present</button>
          <button type="button" class="toggle-btn absent ${status === "absent" ? "active absent" : ""}" data-status="absent">Absent</button>
        </div>
      </div>
    `;
  }).join("");

  listEl.querySelectorAll(".toggle-group").forEach((group) => {
    const id = group.dataset.id;
    group.querySelectorAll(".toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        statusMap[id] = btn.dataset.status;
        group.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active", "present", "absent"));
        btn.classList.add("active", btn.dataset.status);
      });
    });
  });
}

classFilter.addEventListener("change", render);
dateInput.addEventListener("change", loadAttendanceForDate);

saveAllBtn.addEventListener("click", async () => {
  saveAllBtn.disabled = true;
  saveAllBtn.textContent = "Saving…";

  const date = dateInput.value;
  const rows = Object.entries(statusMap).map(([student_id, status]) => ({
    student_id,
    date,
    status,
  }));

  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,date" });

  saveAllBtn.disabled = false;
  saveAllBtn.textContent = "Save attendance";

  if (error) {
    alert(`Could not save attendance: ${error.message}`);
    return;
  }
  saveAllBtn.textContent = "Saved ✓";
  setTimeout(() => (saveAllBtn.textContent = "Save attendance"), 1500);
});
