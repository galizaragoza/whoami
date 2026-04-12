document.addEventListener('DOMContentLoaded', () => {
  const blogContainer = document.getElementById('blog-container');
  const uploadBtn = document.getElementById('upload-btn');
  const uploadForm = document.getElementById('upload-form');
  const submitBtn = document.getElementById('submit-post');
  const cancelBtn = document.getElementById('cancel-upload');
  const authModal = document.getElementById('auth-modal');
  const loginBtn = document.getElementById('login-btn');
  const adminPasswordInput = document.getElementById('admin-password');
  const lockIcon = document.getElementById('lock-icon');
  const closeAuthBtn = document.getElementById('close-auth');

  let adminPassword = localStorage.getItem('adminPassword');

  // Load posts
  const loadPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      const posts = await response.json();
      
      blogContainer.innerHTML = '';
      if (posts.length === 0) {
        blogContainer.innerHTML = '<div class="output">No posts found.</div>';
      } else {
        posts.forEach(post => {
          const card = document.createElement('div');
          card.className = 'blog-card';
          card.innerHTML = `
            <img src="${post.thumbnail}" alt="${post.title}">
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <div class="output">
              <a href="${post.url}" target="_blank">Read on ${post.platform}</a>
            </div>
          `;
          blogContainer.appendChild(card);
        });
      }
    } catch (err) {
      console.error('Error loading posts:', err);
      blogContainer.innerHTML = '<div class="output">Error loading posts.</div>';
    }
  };

  // Auth
  const checkAuth = () => {
    if (adminPassword) {
      uploadBtn.style.display = 'block';
      lockIcon.innerHTML = '🔓';
    } else {
      uploadBtn.style.display = 'none';
      lockIcon.innerHTML = '🔒';
    }
  };

  lockIcon.addEventListener('click', (e) => {
    e.preventDefault();
    if (adminPassword) {
        // Logout if already logged in
        adminPassword = null;
        localStorage.removeItem('adminPassword');
        checkAuth();
        uploadForm.style.display = 'none';
    } else {
        authModal.style.display = 'block';
        adminPasswordInput.focus();
    }
  });

  closeAuthBtn.addEventListener('click', () => {
    authModal.style.display = 'none';
  });

  uploadBtn.addEventListener('click', () => {
    uploadForm.style.display = 'block';
    uploadBtn.style.display = 'none';
  });

  cancelBtn.addEventListener('click', () => {
    uploadForm.style.display = 'none';
    uploadBtn.style.display = 'block';
  });

  loginBtn.addEventListener('click', async () => {
    const password = adminPasswordInput.value;
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        adminPassword = password;
        localStorage.setItem('adminPassword', adminPassword);
        authModal.style.display = 'none';
        adminPasswordInput.value = '';
        checkAuth();
      } else {
        alert('Invalid password');
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  });

  adminPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
  });

  submitBtn.addEventListener('click', async () => {
    const title = document.getElementById('post-title').value;
    const description = document.getElementById('post-description').value;
    const thumbnail = document.getElementById('post-thumbnail').value;
    const url = document.getElementById('post-url').value;
    const platform = document.getElementById('post-platform').value;

    const post = { title, description, thumbnail, url, platform };

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword
        },
        body: JSON.stringify(post)
      });

      if (response.ok) {
        uploadForm.style.display = 'none';
        uploadBtn.style.display = 'block';
        loadPosts();
        document.getElementById('post-title').value = '';
        document.getElementById('post-description').value = '';
        document.getElementById('post-thumbnail').value = '';
        document.getElementById('post-url').value = '';
        document.getElementById('post-platform').value = '';
      } else {
        alert('Error uploading post');
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  });

  loadPosts();
  checkAuth();
});
