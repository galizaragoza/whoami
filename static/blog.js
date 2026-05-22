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

  const showModal = () => {
    authModal.classList.add('visible');
    adminPasswordInput.focus();
  };

  const hideModal = () => {
    authModal.classList.remove('visible');
    adminPasswordInput.value = '';
  };

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      const posts = await response.json();

      blogContainer.innerHTML = '';
      if (posts.length === 0) {
        blogContainer.innerHTML = '<div class="output">No posts found.</div>';
        return;
      }

      posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'blog-card';

        const img = document.createElement('img');
        img.src = post.thumbnail;
        img.alt = post.title;

        const h3 = document.createElement('h3');
        h3.textContent = post.title;

        const p = document.createElement('p');
        p.textContent = post.description;

        const output = document.createElement('div');
        output.className = 'output';

        const a = document.createElement('a');
        a.href = post.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = `Read on ${post.platform}`;

        output.appendChild(a);
        card.append(img, h3, p, output);
        blogContainer.appendChild(card);
      });
    } catch (err) {
      console.error('Error loading posts:', err);
      blogContainer.innerHTML = '<div class="output">Error loading posts.</div>';
    }
  };

  const checkAuth = () => {
    if (adminPassword) {
      uploadBtn.style.display = 'block';
      lockIcon.textContent = '🔓';
    } else {
      uploadBtn.style.display = 'none';
      lockIcon.textContent = '🔒';
    }
  };

  lockIcon.addEventListener('click', (e) => {
    e.preventDefault();
    if (adminPassword) {
      adminPassword = null;
      localStorage.removeItem('adminPassword');
      checkAuth();
      uploadForm.style.display = 'none';
    } else {
      showModal();
    }
  });

  closeAuthBtn.addEventListener('click', hideModal);

  uploadBtn.addEventListener('click', () => {
    uploadForm.style.display = 'block';
    uploadBtn.style.display = 'none';
  });

  cancelBtn.addEventListener('click', () => {
    uploadForm.style.display = 'none';
    uploadBtn.style.display = 'block';
  });

  const doLogin = async () => {
    const password = adminPasswordInput.value;
    if (!password) return;
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        adminPassword = password;
        localStorage.setItem('adminPassword', adminPassword);
        hideModal();
        checkAuth();
      } else {
        alert('Invalid password');
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  loginBtn.addEventListener('click', doLogin);
  adminPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doLogin();
  });

  const clearForm = () => {
    ['post-title', 'post-description', 'post-thumbnail', 'post-url', 'post-platform']
      .forEach(id => { document.getElementById(id).value = ''; });
  };

  submitBtn.addEventListener('click', async () => {
    const title = document.getElementById('post-title').value.trim();
    const description = document.getElementById('post-description').value.trim();
    const thumbnail = document.getElementById('post-thumbnail').value.trim();
    const url = document.getElementById('post-url').value.trim();
    const platform = document.getElementById('post-platform').value.trim();

    if (!title || !description || !url || !platform) {
      alert('Title, description, URL and platform are required.');
      return;
    }

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword
        },
        body: JSON.stringify({ title, description, thumbnail, url, platform })
      });

      if (response.ok) {
        uploadForm.style.display = 'none';
        uploadBtn.style.display = 'block';
        clearForm();
        loadPosts();
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
