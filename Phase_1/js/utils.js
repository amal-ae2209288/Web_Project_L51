// Helper Functions

// turns ISO timestamps into readable string (e.g., "Mar 17, 2:30 PM")
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}


// returns the full user object of the logged‑in user, or null
function getCurrentUser() {
  const userId = getData('currentUser');
  if (!userId) return null;
  const users = getData('users') || [];
  return users.find(u => u.id === userId) || null;  // was u.userId, fixed!
}