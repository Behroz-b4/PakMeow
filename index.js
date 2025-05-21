// Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBGwYGrZx-Oulq118fSuOiGLFs5DzbhLLU",
            authDomain: "daily-b4.firebaseapp.com",
            projectId: "daily-b4",
            storageBucket: "daily-b4.firebasestorage.app",
            messagingSenderId: "1006402214032",
            appId: "1:1006402214032:web:15e90e4a4f2eeb7010e015"
        };
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();

        // DOM Elements
        const authModal = document.getElementById('authModal');
        const uploadModal = document.getElementById('uploadModal');
        const authForm = document.getElementById('authForm');
        const uploadForm = document.getElementById('uploadForm');
        const authToggle = document.getElementById('authToggle');
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.querySelector('.search-button');
        const videoContainer = document.getElementById('videoContainer');
        const userAvatar = document.getElementById('userAvatar');
        const signInButton = document.getElementById('signInButton');
        const photoGroup = document.getElementById('photoGroup');
        const photoUpload = document.getElementById('photoUpload');
        const photoUrlInput = document.getElementById('photoUrl');
        const displayNameGroup = document.getElementById('displayNameGroup');
        const displayNameInput = document.getElementById('displayName');
        const themeToggle = document.getElementById('themeToggle');

        let isSignUp = false;

        // Theme Toggle
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '<i class="material-symbols-outlined">light_mode</i>' : '<i class="material-symbols-outlined">dark_mode</i>';
        }
        themeToggle.addEventListener('click', toggleTheme);
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="material-symbols-outlined">light_mode</i>' : '<i class="material-symbols-outlined">dark_mode</i>';

        // Modal Functions
        function showModal(modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function hideModal(modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }

        // Cloudinary Upload Widget
        const cloudinaryWidget = cloudinary.createUploadWidget({
            cloudName: 'dy1fqwyap',
            uploadPreset: 'HiOChat-B4',
            folder: 'profile_photos',
            cropping: true,
            croppingAspectRatio: 1,
            resourceType: 'image',
            sources: ['local', 'url', 'camera'],
            clientAllowedFormats: ['jpg', 'png'],
            maxFileSize: 5000000,
            singleUpload: true
        }, (error, result) => {
            if (!error && result && result.event === 'success') {
                photoUrlInput.value = result.info.secure_url;
                photoUrlInput.dispatchEvent(new Event('input'));
            } else if (error) {
                alert('Error uploading photo: ' + error.message);
            }
        });

        photoUpload.addEventListener('click', () => {
            cloudinaryWidget.open();
        });

        // Auth State Listener
        auth.onAuthStateChanged(async user => {
            if (user) {
                try {
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    const photoURL = userDoc.exists ? userDoc.data().photoURL : 'https://placehold.co/32x32?text=U';
                    const displayName = userDoc.exists ? userDoc.data().displayName : user.email.split('@')[0];
                    userAvatar.src = photoURL;
                    userAvatar.style.display = 'block';
                    signInButton.style.display = 'none';
                    userAvatar.title = `${displayName} (Click to Sign Out)`;
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    userAvatar.src = 'https://placehold.co/32x32?text=U';
                    userAvatar.style.display = 'block';
                    signInButton.style.display = 'none';
                }
            } else {
                userAvatar.style.display = 'none';
                signInButton.style.display = 'block';
            }
        });

        // Create Video Card
        function createVideoCard(video, id) {
            const thumbnail = video.thumbnail || 'https://placehold.co/600x400?text=No+Thumbnail';
            const userName = video.userDisplayName || 'Unknown';
            const uploadDate = video.timestamp ? moment(video.timestamp.toDate()).fromNow() : 'Unknown';
            return `
                <div class="video-card" data-id="${id}">
                    <div class="thumbnail-container">
                        <img src="${thumbnail}" class="thumbnail" alt="${video.title}"
                             onerror="this.src='https://placehold.co/600x400?text=Thumbnail+Error'" loading="lazy">
                    </div>
                    <div class="video-details">
                        <div class="video-title">${video.title}</div>
                        <div class="video-uploader-name">${userName}</div>
                        <div class="video-upload-date">${uploadDate}</div>
                    </div>
                </div>
            `;
        }

        // Fetch Videos
        function fetchVideos(searchQuery = '') {
            videoContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
            let query = db.collection('videos').orderBy('timestamp', 'desc');
            if (searchQuery) {
                query.get().then(snapshot => {
                    videoContainer.innerHTML = '';
                    let results = [];
                    snapshot.forEach(doc => {
                        const video = doc.data();
                        if (video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            video.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                            results.push({ id: doc.id, ...video });
                        }
                    });
                    if (results.length === 0) {
                        videoContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--secondary-text);">No videos found</p>';
                        return;
                    }
                    results.forEach(video => {
                        videoContainer.innerHTML += createVideoCard(video, video.id);
                    });
                    window.history.replaceState({}, '', searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : 'index.html');
                }).catch(error => {
                    console.error('Error fetching videos:', error);
                    videoContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--secondary-text);">Error loading videos</p>';
                });
            } else {
                query.onSnapshot(snapshot => {
                    videoContainer.innerHTML = '';
                    if (snapshot.empty) {
                        videoContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--secondary-text);">No videos found</p>';
                        return;
                    }
                    snapshot.forEach(doc => {
                        videoContainer.innerHTML += createVideoCard(doc.data(), doc.id);
                    });
                }, error => {
                    console.error('Error fetching videos:', error);
                    videoContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--secondary-text);">Error loading videos</p>';
                });
            }
        }

        // Event Listeners
        userAvatar.addEventListener('click', () => {
            if (auth.currentUser) {
                auth.signOut().catch(error => alert('Error signing out: ' + error.message));
            }
        });

        signInButton.addEventListener('click', () => {
            showModal(authModal);
            isSignUp = false;
            document.getElementById('authTitle').textContent = 'Sign In';
            photoGroup.style.display = 'none';
            displayNameGroup.style.display = 'none';
            photoUrlInput.removeAttribute('required');
            displayNameInput.removeAttribute('required');
            authToggle.innerHTML = 'Don\'t have an account? <a href="#" id="toggleLink">Sign Up</a>';
        });

        document.getElementById('uploadButton').addEventListener('click', () => {
            if (auth.currentUser) {
                showModal(uploadModal);
            } else {
                showModal(authModal);
                alert('Please sign in to upload videos');
            }
        });

        document.getElementById('authClose').addEventListener('click', () => {
            hideModal(authModal);
        });

        document.getElementById('uploadClose').addEventListener('click', () => {
            hideModal(uploadModal);
        });

        authToggle.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUp = !isSignUp;
            document.getElementById('authTitle').textContent = isSignUp ? 'Sign Up' : 'Sign In';
            document.getElementById('authSubmit').textContent = isSignUp ? 'Sign Up' : 'Sign In';
            photoGroup.style.display = isSignUp ? 'block' : 'none';
            displayNameGroup.style.display = isSignUp ? 'block' : 'none';
            if (isSignUp) {
                photoUrlInput.setAttribute('required', '');
                displayNameInput.setAttribute('required', '');
            } else {
                photoUrlInput.removeAttribute('required');
                displayNameInput.removeAttribute('required');
            }
            authToggle.innerHTML = isSignUp ? 
                'Already have an account? <a href="#" id="toggleLink">Sign In</a>' : 
                'Don\'t have an account? <a href="#" id="toggleLink">Sign Up</a>';
        });

        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const photoUrl = isSignUp ? document.getElementById('photoUrl').value : '';
            const displayName = isSignUp ? document.getElementById('displayName').value : '';
            try {
                if (isSignUp) {
                    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                    const user = userCredential.user;
                    await db.collection('users').doc(user.uid).set({
                        email,
                        displayName: displayName || email.split('@')[0],
                        photoURL: photoUrl || 'https://placehold.co/32x32?text=U',
                        uid: user.uid
                    });
                } else {
                    await auth.signInWithEmailAndPassword(email, password);
                }
                hideModal(authModal);
                authForm.reset();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });

        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('videoTitle').value;
            const description = document.getElementById('videoDescription').value;
            const url = document.getElementById('videoUrl').value;
            const thumbnail = document.getElementById('thumbnailUrl').value;
            if (!auth.currentUser) {
                alert('Please sign in to upload videos');
                return;
            }
            try {
                const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
                const userPhotoURL = userDoc.exists ? userDoc.data().photoURL : 'https://placehold.co/32x32?text=U';
                const userDisplayName = userDoc.exists ? userDoc.data().displayName : auth.currentUser.email.split('@')[0];
                await db.collection('videos').add({
                    title,
                    description,
                    url,
                    thumbnail,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    userId: auth.currentUser.uid,
                    userPhotoURL,
                    userDisplayName,
                    viewCount: 0
                });
                hideModal(uploadModal);
                uploadForm.reset();
                alert('Video uploaded successfully!');
            } catch (error) {
                alert('Error uploading video: ' + error.message);
            }
        });

        searchInput.addEventListener('input', (e) => {
            fetchVideos(e.target.value.trim());
        });

        videoContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.video-card');
            if (card) {
                window.location.href = `watch.html?id=${card.dataset.id}`;
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search');
            if (searchQuery) {
                searchInput.value = decodeURIComponent(searchQuery);
                fetchVideos(searchQuery);
            } else {
                fetchVideos();
            }
        });