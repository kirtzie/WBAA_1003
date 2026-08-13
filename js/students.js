let allStudents = [];

const body = document.getElementById("studentsBody");
const countLabel = document.getElementById("countLabel");
const searchInput = document.getElementById("searchInput");
const classFilter = document.getElementById("classFilter");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalMsg = document.getElementById("modalMsg");
const form = document.getElementById("studentForm");

(async function init() {
  await requireAuth();
  await loadStudents();
})();

async function loadStudents() {
  const { data, error } = await supabase.from("students").select("*").order("name");

  if (error) {
    body.innerHTML = `<tr><td colspan="6" class="empty-state">Could not load students. ${error.message}</td></tr>`;
    countLabel.textContent = "Error loading students";
    return;
  }

  allStudents = data || [];
  populateClassFilter();
  render();
}

function populateClassFilter() {
  const classes = [...new Set(allStudents.map((s) => s.class).filter(Boolean))].sort();
  classFilter.innerHTML = `<option value="">All classes</option>` +
    classes.map((c) => `<option value="${c}">Class ${c}</option>`).join("");
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const cls = classFilter.value;

  const filtered = allStudents.filter((s) => {
    const matchesQ = !q || s.name.toLowerCase().includes(q) || (s.roll_no || "").toLowerCase().includes(q);
    const matchesClass = !cls || s.class === cls;
    return matchesQ && matchesClass;
  });

  countLabel.textContent = `${filtered.length} of ${allStudents.length} students`;

  if (filtered.length === 0) {
    body.innerHTML = `<tr><td colspan="6" class="empty-state">No students match. Try a different search, or add a new student.</td></tr>`;
    return;
  }

  body.innerHTML = filtered.map((s) => `
    <tr>
      <td>
        <div class="student-cell">
          <div class="avatar" style="background:${initialsColor(s.name)}">${getInitials(s.name)}</div>
          <span>${s.name}</span>
        </div>
      </td>
      <td><span class="roll-chip">${s.roll_no || "–"}</span></td>
      <td>${s.class || "–"}${s.section ? " " + s.section : ""}</td>
      <td>${s.gender || "–"}</td>
      <td>${s.parent_phone || "–"}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" onclick="openEdit('${s.id}')">Edit</button>
          <button class="icon-btn danger" onclick="deleteStudent('${s.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

searchInput.addEventListener("input", render);
classFilter.addEventListener("change", render);

// ---------- Modal ----------
document.getElementById("addBtn").addEventListener("click", () => openAdd());
document.getElementById("cancelBtn").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

function openAdd() {
  form.reset();
  document.getElementById("studentId").value = "";
  modalTitle.textContent = "Add student";
  modalMsg.className = "form-msg";
  modalOverlay.classList.add("open");
}

window.openEdit = function (id) {
  const s = allStudents.find((x) => x.id === id);
  if (!s) return;
  document.getElementById("studentId").value = s.id;
  document.getElementById("name").value = s.name || "";
  document.getElementById("rollNo").value = s.roll_no || "";
  document.getElementById("gender").value = s.gender || "";
  document.getElementById("studentClass").value = s.class || "";
  document.getElementById("section").value = s.section || "";
  document.getElementById("dob").value = s.dob || "";
  document.getElementById("admissionDate").value = s.admission_date || "";
  document.getElementById("parentName").value = s.parent_name || "";
  document.getElementById("parentPhone").value = s.parent_phone || "";
  document.getElementById("address").value = s.address || "";
  modalTitle.textContent = "Edit student";
  modalMsg.className = "form-msg";
  modalOverlay.classList.add("open");
};

function closeModal() {
  modalOverlay.classList.remove("open");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  const id = document.getElementById("studentId").value;
  const payload = {
    name: document.getElementById("name").value.trim(),
    roll_no: document.getElementById("rollNo").value.trim() || null,
    gender: document.getElementById("gender").value || null,
    class: document.getElementById("studentClass").value.trim() || null,
    section: document.getElementById("section").value.trim() || null,
    dob: document.getElementById("dob").value || null,
    admission_date: document.getElementById("admissionDate").value || null,
    parent_name: document.getElementById("parentName").value.trim() || null,
    parent_phone: document.getElementById("parentPhone").value.trim() || null,
    address: document.getElementById("address").value.trim() || null,
  };

  const { error } = id
    ? await supabase.from("students").update(payload).eq("id", id)
    : await supabase.from("students").insert(payload);

  saveBtn.disabled = false;
  saveBtn.textContent = "Save student";

  if (error) {
    modalMsg.textContent = error.message;
    modalMsg.className = "form-msg error";
    return;
  }

  closeModal();
  await loadStudents();
});

window.deleteStudent = async function (id) {
  const s = allStudents.find((x) => x.id === id);
  if (!s) return;
  if (!confirm(`Remove ${s.name} from student records? This cannot be undone.`)) return;

  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) {
    alert(`Could not delete: ${error.message}`);
    return;
  }
  await loadStudents();
};
