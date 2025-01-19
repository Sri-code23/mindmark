document.addEventListener('DOMContentLoaded', function() {
    let notes = [];
    let deletedNotes = [];
    let currentView = 'home';
    let currentNote = null;
    const noteGrid = document.getElementById('note-grid');
    const homeBtn = document.getElementById('home-btn');
    const recycleBinBtn = document.getElementById('recycle-bin');
    const createNoteBtn = document.getElementById('create-note');
    const editPage = document.getElementById('edit-page');
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    const pinNoteBtn = document.getElementById('pin-note');
    const colorPickerBtn = document.getElementById('color-picker');
    const saveNoteBtn = document.getElementById('save-note');
    const deleteNoteBtn = document.getElementById('delete-note');
    const closeEditBtn = document.getElementById('close-edit');
    const colorDropdown = document.getElementById('color-dropdown');

    const colors = [
        '#004b47', '#6e0b0b', '#5e0d1e', '#66066e',
        '#330075', '#00771a', '##007a74', '#517400',
        '#796d00', '#7a5400', '#751b00', '#792c00'
    ];

    function loadFromLocalStorage() {
        const savedNotes = localStorage.getItem('notes');
        const savedDeletedNotes = localStorage.getItem('deletedNotes');
        if (savedNotes) {
            notes = JSON.parse(savedNotes);
        }
        if (savedDeletedNotes) {
            deletedNotes = JSON.parse(savedDeletedNotes);
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('notes', JSON.stringify(notes));
        localStorage.setItem('deletedNotes', JSON.stringify(deletedNotes));
    }

    function toggleDarkMode() {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    }

    function createNote() {
        currentNote = {
            id: Date.now(),
            title: '',
            content: '',
            isPinned: false,
            color: colors[0]
        };
        openEditPage(currentNote);
    }

    function openEditPage(note) {
        currentNote = note;
        titleInput.value = note.title;
        contentInput.value = note.content;
        pinNoteBtn.className = note.isPinned ? 'ri-pushpin-fill' : 'ri-pushpin-line';
        editPage.style.display = 'block';
        colorPickerBtn.style.color = note.color;
    }

    function closeEditPage() {
        editPage.style.display = 'none';
        currentNote = null;
    }

    function saveNote() {
        if (currentNote) {
            currentNote.title = titleInput.value.trim();
            currentNote.content = contentInput.value.trim();

            if (currentNote.title || currentNote.content) {
                const index = notes.findIndex(n => n.id === currentNote.id);
                if (index === -1) {
                    notes.unshift(currentNote);
                } else {
                    notes[index] = currentNote;
                }
                saveToLocalStorage();
                renderNotes();
            }
        }
        closeEditPage();
    }

    function deleteNote() {
        if (currentNote) {
            notes = notes.filter(n => n.id !== currentNote.id);
            deletedNotes.push(currentNote);
            saveToLocalStorage();
            renderNotes();
        }
        closeEditPage();
    }

    function togglePin() {
        if (currentNote) {
            currentNote.isPinned = !currentNote.isPinned;
            pinNoteBtn.className = currentNote.isPinned ? 'ri-pushpin-fill' : 'ri-pushpin-line';
        }
    }

    function copyNoteToClipboard(note) {
        const noteContent = `${note.title}\n\n${note.content}`;
        navigator.clipboard.writeText(noteContent).then(() => {
            alert('Note copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy note: ', err);
        });
    }

    function renderNotes() {
        noteGrid.innerHTML = '';
        const notesToRender = currentView === 'home' ? notes : deletedNotes;

        notesToRender.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.style.backgroundColor = note.color;
            noteCard.innerHTML = `
                ${note.isPinned ? '<i class="ri-pushpin-fill pin-icon"></i>' : ''}
                <h3>${note.title}</h3>
                <div class="note-content">${note.content}</div>
                ${currentView === 'home' ? `
                    <button class="copy-icon" aria-label="Copy note">
                        <i class="ri-file-copy-line"></i>
                    </button>
                ` : `
                    <button class="btn-restore">Restore</button>
                `}
            `;

            if (currentView === 'home') {
                noteCard.addEventListener('click', (e) => {
                    if (!e.target.closest('.copy-icon')) {
                        openEditPage(note);
                    }
                });
                noteCard.querySelector('.copy-icon').addEventListener('click', (e) => {
                    e.stopPropagation();
                    copyNoteToClipboard(note);
                });
            } else {
                noteCard.querySelector('.btn-restore').addEventListener('click', () => {
                    restoreNote(note.id);
                });
            }

            noteGrid.appendChild(noteCard);
        });
    }

    function restoreNote(noteId) {
        const noteIndex = deletedNotes.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
            const restoredNote = deletedNotes.splice(noteIndex, 1)[0];
            notes.unshift(restoredNote);
            saveToLocalStorage();
            renderNotes();
        }
    }

    function setActiveView(view) {
        currentView = view;
        homeBtn.classList.toggle('active', view === 'home');
        recycleBinBtn.classList.toggle('active', view === 'recycle-bin');
        createNoteBtn.style.display = view === 'home' ? 'flex' : 'none';
        renderNotes();
    }

    function initColorDropdown() {
        colorDropdown.innerHTML = colors.map(color => 
            `<div class="color-option" style="background-color: ${color};" data-color="${color}"></div>`
        ).join('');

        colorDropdown.addEventListener('click', (e) => {
            const colorOption = e.target.closest('.color-option');
            if (colorOption) {
                const selectedColor = colorOption.dataset.color;
                if (currentNote) {
                    currentNote.color = selectedColor;
                    colorPickerBtn.style.color = selectedColor;
                }
                colorDropdown.style.display = 'none';
            }
        });

        colorPickerBtn.addEventListener('click', () => {
            colorDropdown.style.display = colorDropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#color-dropdown') && !e.target.closest('#color-picker')) {
                colorDropdown.style.display = 'none';
            }
        });
    }

    homeBtn.addEventListener('click', () => setActiveView('home'));
    recycleBinBtn.addEventListener('click', () => setActiveView('recycle-bin'));
    createNoteBtn.addEventListener('click', createNote);
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
    saveNoteBtn.addEventListener('click', saveNote);
    deleteNoteBtn.addEventListener('click', deleteNote);
    closeEditBtn.addEventListener('click', closeEditPage);
    pinNoteBtn.addEventListener('click', togglePin);

    // Initialize the app
    loadFromLocalStorage();
    renderNotes();
    initColorDropdown();

    // Set initial dark mode
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'light') {
        document.body.classList.add('light-mode');
    } 
});