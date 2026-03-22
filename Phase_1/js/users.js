// ===================================
// Discover Users Page

document.addEventListener('DOMContentLoaded', function () {
  // ----- USERS PAGE (users.html) -----
  const currentPath = window.location.pathname.split('/').pop();
  if (currentPath !== 'users.html') return;

  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  const searchInput = document.getElementById('search');
  const list = document.getElementById('list');

  // ----- LOAD USERS -----
  function loadUsers() {
    const users = getData('users') || [];
    const posts = getData('posts') || [];
    const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';

    // get all users except current user
    let otherUsers = users.filter(u => u.id !== currentUser.id);

    // search by name or username
    if (searchText) {
      otherUsers = otherUsers.filter(u =>
        u.name.toLowerCase().includes(searchText) ||
        u.username.toLowerCase().includes(searchText)
      );
    }

    // sort alphabetically by name
    otherUsers.sort((a, b) => a.name.localeCompare(b.name));

    // if no users found
    if (otherUsers.length === 0) {
      list.innerHTML = `
        <article class="card" style="padding:20px;">
          <p class="small muted">No users found.</p>
        </article>
      `;
      return;
    }

    // build cards
    list.innerHTML = otherUsers.map(profileUser => {
      const postsCount = posts.filter(p => p.authorId === profileUser.id).length;
      const followersCount = users.filter(u => (u.following || []).includes(profileUser.id)).length;
      const followingCount = (profileUser.following || []).length;
      const isFollowing = (currentUser.following || []).includes(profileUser.id);

      return `
        <article class="user-card card">
          <div class="user-card-top">
            <div class="user-info">
              <span class="avatar large">${profileUser.name.charAt(0).toUpperCase()}</span>
              <div>
                <h2 class="user-name">${profileUser.name}</h2>
                <p class="user-handle">@${profileUser.username}</p>
              </div>
            </div>
          </div>

          <p class="user-bio">${profileUser.bio ? profileUser.bio : 'No bio yet.'}</p>

          <div class="user-meta">
            <span>${postsCount} posts</span>
            <span>${followersCount} followers</span>
            <span>${followingCount} following</span>
          </div>

          <div class="user-actions">
            <button
              class="btn btn-follow ${isFollowing ? 'btn-ghost' : ''}"
              type="button"
              data-id="${profileUser.id}"
            >
              ${isFollowing ? 'Unfollow' : 'Follow'}
            </button>
            <a class="btn btn-ghost" href="profile.html?id=${profileUser.id}">View Profile</a>
          </div>
        </article>
      `;
    }).join('');

    attachFollowEvents();
  }

  // ----- FOLLOW / UNFOLLOW -----
  function attachFollowEvents() {
    const followButtons = document.querySelectorAll('.btn-follow');

    followButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        const targetUserId = this.getAttribute('data-id');
        const users = getData('users') || [];
        const currentUserIndex = users.findIndex(u => u.id === currentUser.id);

        if (currentUserIndex === -1) return;

        const following = users[currentUserIndex].following || [];
        const alreadyFollowing = following.includes(targetUserId);

        if (alreadyFollowing) {
          users[currentUserIndex].following = following.filter(id => id !== targetUserId);
        } else {
          following.push(targetUserId);
          users[currentUserIndex].following = following;
        }

        saveData('users', users);

        // update current user in memory
        currentUser.following = users[currentUserIndex].following;

        loadUsers();
      });
    });
  }

  // ----- SEARCH -----
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      loadUsers();
    });
  }

  // ----- START -----
  loadUsers();
});