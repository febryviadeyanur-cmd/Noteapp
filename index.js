import './styles/styles.css';
import Swal from 'sweetalert2';
import { animate, stagger } from 'animejs';
import './components/app-bar.js';
import './components/note-form.js';
import './components/note-list.js';
import './components/note-item.js';
import './components/loading-indicator.js';
import {
  getNotes,
  getArchivedNotes,
  createNote,
  deleteNote,
  archiveNote,
  unarchiveNote,
} from './api/notes-api.js';

const appBar = document.querySelector('app-bar');
const noteList = document.querySelector('note-list');
const loading = document.querySelector('loading-indicator');
const tabs = document.querySelectorAll('.tab');

let currentView = 'active'; // 'active' | 'archived'

// Ambil data sesuai tab, lalu tampilkan
async function refreshNotes() {
  const notes = currentView === 'active' ? await getNotes() : await getArchivedNotes();

  noteList.setAttribute(
    'empty-message',
    currentView === 'active'
      ? 'Belum ada catatan. Tulis yang pertama lewat formulir.'
      : 'Belum ada catatan yang diarsipkan.',
  );
  noteList.notes = notes;
  appBar.setAttribute('count', notes.length);

  // Animasi muncul bergantian (anime.js)
  animate(noteList.querySelectorAll('note-item'), {
    opacity: [0, 1],
    translateY: [20, 0],
    delay: stagger(70),
    duration: 450,
    ease: 'outQuad',
  });
}

// Pembungkus: loading muncul selama request, error ditampilkan lewat SweetAlert2
async function run(action, successMessage) {
  loading.show();
  try {
    await action();
    if (successMessage) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: successMessage,
        showConfirmButton: false,
        timer: 1800,
      });
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Terjadi kesalahan', text: error.message });
  } finally {
    loading.hide();
  }
}

// note-form mengirim event 'note-submit' berisi judul dan isi catatan
document.addEventListener('note-submit', (event) => {
  const { title, body } = event.detail;
  run(async () => {
    await createNote({ title, body });
    // Catatan baru berstatus aktif, jadi pindah ke tab Aktif
    setView('active', false);
    await refreshNotes();
  }, 'Catatan berhasil ditambahkan');
});

// note-item mengirim event 'note-delete' berisi id catatan
document.addEventListener('note-delete', async (event) => {
  const { id } = event.detail;
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus catatan ini?',
    text: 'Catatan yang dihapus tidak bisa dikembalikan.',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
  });
  if (!result.isConfirmed) return;

  run(async () => {
    await deleteNote(id);
    await refreshNotes();
  }, 'Catatan dihapus');
});

// note-item mengirim event 'note-archive' berisi id dan status arsip saat ini
document.addEventListener('note-archive', (event) => {
  const { id, archived } = event.detail;
  run(
    async () => {
      await (archived ? unarchiveNote(id) : archiveNote(id));
      await refreshNotes();
    },
    archived ? 'Catatan dikembalikan' : 'Catatan diarsipkan',
  );
});

function setView(view, shouldRefresh = true) {
  currentView = view;
  tabs.forEach((tab) => {
    const isActive = tab.dataset.view === view;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-pressed', String(isActive));
  });
  if (shouldRefresh) run(refreshNotes);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    if (tab.dataset.view !== currentView) setView(tab.dataset.view);
  });
});

run(refreshNotes);
