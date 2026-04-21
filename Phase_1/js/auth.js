

// ===================================
// Authentication

document.addEventListener('DOMContentLoaded', function () {
  // ----- LOGIN (index.html) -----
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const username = document.getElementById('loginUser').value.trim();
      const password = document.getElementById('loginPass').value;

      if (!username || !password) {
        alert('Please enter username and password');
        return;
      }

      const users = getData('users') || [];
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        saveData('currentUser', user.id);
        window.location.href = 'feed.html';
      } else {
        alert('Invalid username or password');
      }
    });
  }

  // ----- SIGNUP (signup.html) -----
  const signupBtn = document.getElementById('signupBtn');
  if (signupBtn) {
    signupBtn.addEventListener('click', function (e) {
      e.preventDefault();

      const name = document.getElementById('suName').value.trim();
      const username = document.getElementById('suUser').value.trim();
      const password = document.getElementById('suPass').value;
      const confirm = document.getElementById('suConfirm').value;
      const email = document.getElementById('suEmail').value.trim();
      const avatar = document.getElementById('suProfilePic').value.trim();

      if (!name || !username || !password || !confirm || !email) {
        alert('Please fill all fields');
        return;
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
      if (password !== confirm) {
        alert('Passwords do not match');
        return;
      }
      if (!email.includes('@')) {
        alert('Enter a valid email');
        return;
      }

      const users = getData('users') || [];
      if (users.find(u => u.username === username)) {
        alert('Username already taken');
        return;
      }

      const newUser = {
        id: generateId('u'),
        name: name,
        username: username,
        password: password,
        email: email,
        bio: '',
        avatar: avatar || '',
        following: [],
        createdAt: Date.now()
      };
      users.push(newUser);
      saveData('users', users);

      alert('Registration successful! Please log in.');
      window.location.href = 'index.html';
    });
  }

  // ----- LOGOUT (any page with logout button) -----
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      saveData('currentUser', null);
      window.location.href = 'index.html';
    });
  }

  // ----- PROTECT PAGES (feed, profile, users) -----
  const currentPath = window.location.pathname.split('/').pop();
  const protectedPages = ['feed.html', 'profile.html', 'users.html'];

  if (protectedPages.includes(currentPath)) {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    const topAvatar = document.getElementById('topAvatar');
    const topUser = document.getElementById('topUser');
    if (topAvatar && topUser) {
      topAvatar.textContent = user.name.charAt(0).toUpperCase();
      topUser.textContent = '@' + user.username;
    }
  }
});