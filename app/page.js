'use client';

import { useEffect, useState } from 'react';

function NoteItem({ note, onDelete }) {
  return (
    <li className="flex items-start justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex-1">
        <p className="text-slate-900 leading-snug">{note.text}</p>
        <p className="mt-2 text-xs text-slate-400">ID: {note._id}</p>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        <button
          onClick={() => onDelete(note._id)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition"
          aria-label={`Delete note ${note._id}`}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default function Page() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      setError('Could not load notes');
    } finally {
      setLoading(false);
    }
  }

  async function addNote() {
    if (!text.trim()) return;
    setAdding(true);
    try {
      const optimistic = { _id: crypto.randomUUID(), text };
      setNotes(prev => [optimistic, ...prev]);
      setText('');

      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const saved = await res.json();
      // replace optimistic id with real id
      setNotes(prev => prev.map(n => (n._id === optimistic._id ? saved : n)));
    } catch (err) {
      setError('Failed to add note');
      fetchNotes();
    } finally {
      setAdding(false);
    }
  }

  async function deleteNote(id) {
    const confirmed = confirm('Delete this note?');
    if (!confirmed) return;
    // optimistic remove
    const old = notes;
    setNotes(prev => prev.filter(n => n._id !== id));

    try {
      await fetch('/api/notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      setError('Failed to delete');
      setNotes(old);
    }
  }

  return (
    <main className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Notes</h1>
            <p className="text-sm opacity-90 mt-1">Quick notes — stored with Next.js App Router API routes.</p>
          </div>
          <div className="text-sm opacity-90">Local / Server</div>
        </div>

        <div className="mt-4 flex gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }}
            placeholder="Write a quick note..."
            className="flex-1 px-4 py-3 rounded-2xl border border-transparent shadow-inner placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/20"
          />

          <button
            onClick={addNote}
            disabled={adding}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-white text-indigo-600 font-semibold shadow hover:scale-[1.02] transition disabled:opacity-60"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-center mb-4">
          <h2 className="text-lg font-medium text-center">All notes</h2>
          <div className="text-sm text-slate-500 mx-4">{loading ? 'Loading...' : `${notes.length} note(s)`}</div>
        </div>

        {error && <div className="mb-4 text-sm text-rose-600">{error}</div>}

        <ul className="flex flex-col gap-3">
          {notes.length === 0 && !loading ? (
            <li className="text-sm text-slate-500">No notes yet — add one above ✨</li>
          ) : (
            notes.map(note => (
              <NoteItem key={note._id} note={note} onDelete={deleteNote} />
            ))
          )}
        </ul>
      </section>

      <footer className="mt-6 text-xs text-slate-400 mx-auto text-center">Built with ❤️ — Next.js App Router + Tailwind by Mizan</footer>
    </main>
  );
}