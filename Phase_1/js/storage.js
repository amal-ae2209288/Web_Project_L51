
// ----- Helper: get/save localStorage -----
// Get data from localStorage (returns null if not found)
function getData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Save data to localStorage
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ----- Generate a simple unique ID (like uid("u")) -----
function generateId(prefix = '') {
  return prefix + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}
// ----- Seed demo data (runs once) -----
(function seedOnce() {
  // Only seed if no users exist
  const existingUsers = getData('users');
  if (existingUsers && existingUsers.length > 0) return;

  // Create users with your exact seed data
  const u1 = {
    id: generateId('u'),
    name: 'Khadija',
    username: 'khadija01',
    password: '123456Kh',
    bio: 'Digital Artist.',
    avatar: '',
    following: []
  };
  const u2 = {
    id: generateId('u'),
    name: 'Max',
    username: 'maxdev',
    password: '123456@',
    bio: 'Backend developer. Love to solve complex problems!',
    avatar: '',
    following: []
  };
  const u3 = {
    id: generateId('u'),
    name: 'Sara',
    username: 'sarablog',
    password: '123456$',
    bio: 'Blogging about tech and travel ✈️',
    avatar: '',
    following: []
  };
  const u4 = {
    id: generateId('u'),
    name: 'Arwa',
    username: 'arwa',
    password: '123456#',
    bio: 'Computer Science student. Love coding and coffee.',
    avatar: '',
    following: []
  };

  // Set following relationships (Khadija follows Max and Sara)
  u1.following = [u2.id, u3.id];

  const users = [u1, u2, u3, u4];
  saveData('users', users);

  // Create posts (add empty likes/comments for future features)
  const posts = [
    {
      id: generateId('p'),
      authorId: u2.id,
      content: 'Working on a clean UI today ✨',
      createdAt: Date.now() - 1000 * 60 * 40, // 40 minutes ago
      likes: [],
      comments: []
    },
    {
      id: generateId('p'),
      authorId: u4.id,
      content: 'Excited to have built this social media platform! #coding #webdev',
      createdAt: Date.now() - 1000 * 60 * 15, // 15 minutes ago
      likes: [],
      comments: []
    },
    {
      id: generateId('p'),
      authorId: u3.id,
      content: 'New blog post soon 👀',
      createdAt: Date.now() - 1000 * 60 * 8, // 8 minutes ago
      likes: [],
      comments: []
    },
    {
      id: generateId('p'),
      authorId: u1.id,
      content: 'digital artwork is always my comfort zone',
      createdAt: Date.now() - 1000 * 60 * 8, // 8 minutes ago
      likes: [],
      comments: []
    }
  ];
  saveData('posts', posts);

  // No one is logged in initially
  saveData('currentUser', null);
})();