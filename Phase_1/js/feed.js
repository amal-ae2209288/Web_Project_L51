// feed.js
//ensure that html is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only run on feed page
  if (!window.location.pathname.includes('feed.html')) return;

  // get current user
  const user = getCurrentUser();
  // if there is no user that logged in stop
  if (!user) return; 

  // get html elements id 
  const feedContainer = document.getElementById('feed');
  const postBtn = document.getElementById('postBtn');
  const postText = document.getElementById('postText'); 
  // ========== 1. LOAD AND DISPLAY POSTS ==========
  // Load and display feed
  function loadFeed() {
    const posts = getData('posts') || [];
    const users = getData('users') || [];

    // Get IDs of users that current user follows (including themselves)
    const followingIds = [user.id, ...(user.following || [])];

    // Filter posts from followed users
    let feedPosts = posts.filter(post => followingIds.includes(post.authorId));

    // Sort by newest first
    feedPosts.sort((a, b) => b.createdAt - a.createdAt);

    feedContainer.innerHTML = ''; 

    if (feedPosts.length === 0) {
      feedContainer.innerHTML = '<p class="muted">No posts to show. Follow some users in Explore!</p>';
      return;
    }

    // Loop through posts and build HTML
    feedPosts.forEach(post => {
      const author = users.find(u => u.id === post.authorId);
      const authorName = author ? author.name : 'Unknown';
      const authorInitial = authorName.charAt(0).toUpperCase();

      // Build comments HTML
      let commentsHtml = '';
      if (post.comments && post.comments.length > 0) {
        post.comments.forEach(c => {
          const commentAuthor = users.find(u => u.id === c.authorId);
          const commentAuthorName = commentAuthor ? commentAuthor.name : 'Unknown';
          commentsHtml += `
            <div class="comment">
              <span class="comment-author">${commentAuthorName}:</span>
              <span class="comment-text">${c.text}</span>
              <span class="comment-time">${formatTime(c.createdAt)}</span>
            </div>
          `;
        });
      }

      // Like button state
      const liked = post.likes && post.likes.includes(user.id);
      const likeClass = liked ? 'liked' : '';

      const postElement = document.createElement('div');
      postElement.className = 'post';
      postElement.dataset.postId = post.id;

      postElement.innerHTML = `
        <div class="post-header">
          <span class="avatar">${authorInitial}</span>
          <span class="post-author">${authorName}</span>
          <span class="post-time">${formatTime(post.createdAt)}</span>
          ${post.authorId === user.id ? '<button class="btn-delete" data-post-id="' + post.id + '">Delete</button>' : ''}
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-likes">
          <button class="btn-like ${likeClass}" data-post-id="${post.id}">
            ${post.likes ? post.likes.length : 0}
          </button>
        </div>
        <div class="post-comments">
          <div class="comment-list">${commentsHtml}</div>
          <div class="add-comment">
            <input type="text" placeholder="Write a comment..." class="comment-input" data-post-id="${post.id}">
            <button class="btn-comment" data-post-id="${post.id}">Comment</button>
          </div>
        </div>
      `;

      feedContainer.appendChild(postElement);
    });

    // Attach event listeners to the new buttons
    attachPostEvents();
  }
// ========== 2. ATTACH EVENT LISTENERS TO POST BUTTONS ==========
  // Attach like, comment, delete events
  function attachPostEvents() {
    // Like buttons
    document.querySelectorAll('.btn-like').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const postId = this.dataset.postId;
        toggleLike(postId);
      });
    });

    // Comment buttons
    document.querySelectorAll('.btn-comment').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const postId = this.dataset.postId;
        const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
        const text = input.value.trim();
        if (text) {
          addComment(postId, text);
          input.value = '';
        }
      });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const postId = this.dataset.postId;
        deletePost(postId);
      });
    });
  }

   // ========== 3. LIKE / UNLIKE A POST ==========
  function toggleLike(postId) {
    const posts = getData('posts') || [];
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.likes) post.likes = [];
    const index = post.likes.indexOf(user.id);
    if (index === -1) {
      post.likes.push(user.id);
    } else {
      post.likes.splice(index, 1);
    }
    saveData('posts', posts);
    loadFeed(); 
  }

 // ========== 4. ADD A COMMENT TO A POST ==========
  function addComment(postId, text) {
    const posts = getData('posts') || [];
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.comments) post.comments = [];

    const newComment = {
      id: generateId('c'),
      authorId: user.id,
      text: text,
      createdAt: Date.now()
    };
    post.comments.push(newComment);
    saveData('posts', posts);
    loadFeed(); 
  }

  // ========== 5. DELETE A POST (only author) ==========
  function deletePost(postId) {
    let posts = getData('posts') || [];
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (post.authorId !== user.id) {
      alert('You can only delete your own posts');
      return;
    }
    posts = posts.filter(p => p.id !== postId);
    saveData('posts', posts);
    loadFeed();
  }
  // ========== 6. CREATE A NEW POST ==========
  // check buttons exist 
  if (postBtn) {
    postBtn.addEventListener('click', function() {
      const content = postText.value.trim();
      if (!content) {
        alert('Post cannot be empty');
        return;
      }

      const posts = getData('posts') || [];
      const newPost = {
        id: generateId('p'),
        authorId: user.id,
        content: content,
        createdAt: Date.now(),
        likes: [],
        comments: []
      };
      posts.push(newPost);
      saveData('posts', posts);
      postText.value = ''; 
      loadFeed(); 
    });
  }
// ========== START THE WHOLE PROCESS -- load the feeds ==========
  // Initial load
  loadFeed();
});