const API_URL = 'http://localhost:3000/records';

let currentPage = 1;
let currentSearch = '';
const limit = 5;

// ===============================
// ELEMENTS
// ===============================
const form = document.getElementById('auditForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const cancelBtn = document.getElementById('cancelEdit');
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchBox');
const pageInfo = document.getElementById('pageInfo');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loadingEl = document.getElementById('loading');
const emptyStateEl = document.getElementById('emptyState');

let editId = null;

// ===============================
// FORMAT RUPIAH
// ===============================
function formatRupiah(number) {
  return 'Rp ' + number.toLocaleString('id-ID');
}

// ===============================
// FETCH RECORDS (SEARCH + PAGINATION + UX)
// ===============================
function fetchRecords(page = 1) {
  currentPage = page;

  // UX states
  loadingEl.style.display = 'block';
  emptyStateEl.style.display = 'none';
  searchInput.disabled = true;
  tableBody.innerHTML = '';

  const params = new URLSearchParams({
    page: currentPage,
    limit
  });

  if (currentSearch) {
    params.append('search', currentSearch);
  }

  fetch(`${API_URL}?${params.toString()}`)
    .then(res => res.json())
    .then(result => {
      loadingEl.style.display = 'none';
      searchInput.disabled = false;

      if (result.data.length === 0) {
        emptyStateEl.style.display = 'block';
      }

      renderTable(result.data);
      updatePagination(result.page, result.totalPages);
    })
    .catch(err => {
      loadingEl.style.display = 'none';
      searchInput.disabled = false;
      console.error(err);
    });
}

// ===============================
// RENDER TABLE
// ===============================
function renderTable(records) {
  tableBody.innerHTML = '';

  if (records.length === 0) return;

  records.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.description}</td>
      <td>${formatRupiah(r.amount)}</td>
      <td>${r.created_at}</td>
      <td class="actions">
        <button onclick="editRecord(${r.id}, '${r.description}', ${r.amount})">Edit</button>
        <button onclick="deleteRecord(${r.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// ===============================
// PAGINATION
// ===============================
function updatePagination(page, totalPages) {
  pageInfo.textContent = `Page ${page} of ${totalPages}`;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;
}

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) fetchRecords(currentPage - 1);
});

nextBtn.addEventListener('click', () => {
  fetchRecords(currentPage + 1);
});

// ===============================
// FORM SUBMIT
// ===============================
form.addEventListener('submit', e => {
  e.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseInt(amountInput.value.replace(/\D/g, ''), 10);

  if (description.length < 3 || isNaN(amount) || amount <= 0) {
    alert('Input tidak valid');
    return;
  }

  const payload = { description, amount };

  if (editId) {
    fetch(`${API_URL}/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      resetForm();
      fetchRecords(currentPage);
    });
  } else {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      resetForm();
      fetchRecords(1);
    });
  }
});

// ===============================
// EDIT
// ===============================
function editRecord(id, description, amount) {
  editId = id;
  descriptionInput.value = description;
  amountInput.value = amount;
  cancelBtn.style.display = 'inline';
}

// ===============================
// DELETE
// ===============================
function deleteRecord(id) {
  if (!confirm('Yakin hapus data ini?')) return;
  fetch(`${API_URL}/${id}`, { method: 'DELETE' })
    .then(() => fetchRecords(currentPage));
}

// ===============================
// RESET FORM
// ===============================
function resetForm() {
  editId = null;
  form.reset();
  cancelBtn.style.display = 'none';
}

cancelBtn.addEventListener('click', resetForm);

// ===============================
// SEARCH
// ===============================
searchInput.disabled = false;
searchInput.addEventListener('input', () => {
  currentSearch = searchInput.value.trim();
  fetchRecords(1);
});

// ===============================
// INIT
// ===============================
fetchRecords();