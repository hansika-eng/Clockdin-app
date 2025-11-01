import React, { useState } from 'react';
import EventCard from './EventCard';
import '../Events.css';

const Bookmarks = () => {
  // Load bookmarked events from localStorage
  const [bookmarks, setBookmarks] = useState(() => {
    const data = localStorage.getItem('bookmarkedEventsData');
    return data ? JSON.parse(data) : [];
  });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');

  // Filtered bookmarks (search/category)
  const filteredBookmarks = bookmarks.filter(ev => {
    const matchesSearch =
      (ev.title && ev.title.toLowerCase().includes(search.toLowerCase())) ||
      (ev.description && ev.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat =
      category === 'All Categories' ||
      ev.eventType === category ||
      ev.category === category;
    return matchesSearch && matchesCat;
  });

  // Unbookmark handler (client-side). Also removes from localStorage.
  const handleUnbookmark = (eventId) => {
    if (!eventId) return;
    const updated = bookmarks.filter(ev => (ev._id || ev.id || ev.title) !== eventId);
    setBookmarks(updated);
    localStorage.setItem('bookmarkedEventsData', JSON.stringify(updated));
    // keep bookmarkedEvents key in sync
    const ids = JSON.parse(localStorage.getItem('bookmarkedEvents') || '[]').filter(id => id !== eventId);
    localStorage.setItem('bookmarkedEvents', JSON.stringify(ids));
  };

  // If your Event objects don't have _id, accept entire event object
  const handleUnbookmarkFromObj = (eventObj) => {
    const id = eventObj._id || eventObj.id || eventObj.title;
    const updated = bookmarks.filter(ev => (ev._id || ev.id || ev.title) !== id);
    setBookmarks(updated);
    localStorage.setItem('bookmarkedEventsData', JSON.stringify(updated));
    const ids = JSON.parse(localStorage.getItem('bookmarkedEvents') || '[]').filter(i => i !== id);
    localStorage.setItem('bookmarkedEvents', JSON.stringify(ids));
  };

  // Clear all bookmarks (client-side)
  const handleClearAll = () => {
    if (!bookmarks.length) return;
    if (!window.confirm('Clear all bookmarks? This cannot be undone.')) return;
    // Clear state + localStorage keys used by app
    setBookmarks([]);
    localStorage.removeItem('bookmarkedEventsData');
    localStorage.removeItem('bookmarkedEvents');
    // Optional: if logged-in user and backend supports clearing bookmarks, add API call here
    // Example:
    // const token = localStorage.getItem('clockdin_token');
    // await fetch('/api/users/bookmarks/clear', { method: 'POST', headers: { 'x-auth-token': token }});
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h1 style={{fontWeight:800, fontSize:'2.3rem', color:'#22223b'}}>Bookmarked Events</h1>
          <div style={{color:'#64748b', fontSize:'1.1rem'}}>All your saved events in one place</div>
        </div>
        <div>
          <button
            className="btn btn-danger d-flex align-items-center gap-2"
            style={{borderRadius:'1.2rem', fontWeight:700, padding:'0.55rem 0.9rem'}}
            onClick={handleClearAll}
            disabled={bookmarks.length === 0}
            title="Clear all bookmarks"
          >
            <i className="bi bi-trash"></i> Clear All
          </button>
        </div>
      </div>

      <div className="d-flex gap-3 mb-4">
        <input
          className="form-control"
          style={{maxWidth: '400px'}}
          placeholder="Search bookmarks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{maxWidth: '200px'}}
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option>All Categories</option>
          <option>Hackathon</option>
          <option>Internship</option>
          <option>Workshop</option>
          <option>Competition</option>
          <option>Seminar</option>
        </select>
      </div>

      {filteredBookmarks.length === 0 ? (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{background:'#fff', borderRadius:'1.2rem', minHeight:'340px', border:'1.5px solid #e5e7eb'}}>
          <i className="bi bi-bookmark" style={{fontSize:'3.5rem', color:'#cbd5e1', marginBottom:'1rem'}}></i>
          <div style={{fontWeight:700, fontSize:'1.3rem', color:'#22223b'}}>No bookmarks yet</div>
          <div style={{color:'#64748b', fontSize:'1.08rem', marginBottom:'1.5rem'}}>Bookmark events to see them here.</div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredBookmarks.map((ev, idx) => {
            const key = ev._id || ev.id || idx;
            return (
              <div className="col-md-6 col-lg-4" key={key}>
                <div style={{position:'relative'}}>
                  <EventCard event={ev} showBookmark={false} />
                  <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:8}}>
                    <button
                      className="btn btn-outline-danger"
                      style={{fontWeight:700, borderRadius:8}}
                      onClick={() => {
                        // confirm before unbookmarking
                        if (window.confirm('Remove this event from bookmarks?')) {
                          handleUnbookmarkFromObj(ev);
                          // optional: if user is logged in, call backend to remove bookmark
                          // fetch('/api/users/bookmarks', { method: 'DELETE', body: JSON.stringify({ eventId: ev._id }), headers:{ 'Content-Type':'application/json' }})
                        }
                      }}
                    >
                      Unbookmark
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
