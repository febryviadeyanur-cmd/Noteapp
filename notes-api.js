const BASE_URL = 'https://notes-api.dicoding.dev/v2';

// Semua response API berbentuk { status, message, data }
async function request(path, options) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch {
    // fetch hanya reject kalau jaringan bermasalah
    throw new Error('Tidak bisa terhubung ke server. Periksa koneksi internet kamu.');
  }

  const json = await response.json();
  if (!response.ok || json.status !== 'success') {
    throw new Error(json.message || 'Terjadi kesalahan pada server.');
  }
  return json.data;
}

export const getNotes = () => request('/notes');

export const getArchivedNotes = () => request('/notes/archived');

export const createNote = ({ title, body }) =>
  request('/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body }),
  });

export const deleteNote = (id) => request(`/notes/${id}`, { method: 'DELETE' });

export const archiveNote = (id) => request(`/notes/${id}/archive`, { method: 'POST' });

export const unarchiveNote = (id) => request(`/notes/${id}/unarchive`, { method: 'POST' });
