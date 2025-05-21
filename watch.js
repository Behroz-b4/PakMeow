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
        const userAvatar = document.getElementById('userAvatar');
        const signInButton = document.getElementById('signInButton');
        const photoGroup = document.getElementById('photoGroup');
        const photoUpload = document.getElementById('photoUpload');
        const photoUrlInput = document.getElementById('photoUrl');
        const displayNameGroup = document.getElementById('displayNameGroup');
        const displayNameInput = document.getElementById('displayName');
        const themeToggle = document.getElementById('themeToggle');
        const videoPlayer = document.querySelector('.video-player');
        const videoSource = document.getElementById('videoSource');
        const videoId = new URLSearchParams(window.location.search).get('id');

        let isSignUp = false;
        let artPlayer = null;

        // Theme Toggle
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '<i class="material-symbols-outlined">light_mode</i>' : '<i class="material-symbols-outlined">dark_mode</i>';
    if (artPlayer) {
        artPlayer.theme = newTheme === 'dark' ? '#f1f1f1' : '#004aad';
    }
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

        // Validate Video URL
        function isValidVideoUrl(url) {
            if (!url) return false;
            const supportedFormats = ['.mp4', '.webm', '.ogg'];
            try {
                const urlObj = new URL(url);
                return supportedFormats.some(ext => urlObj.pathname.toLowerCase().endsWith(ext));
            } catch {
                return false;
            }
        }

        // Load Video
        async function loadVideo() {
    if (!videoId) {
        document.querySelector('.video-player-container').innerHTML = '<p class="video-error">No video ID provided</p>';
        return;
    }
    try {
        const doc = await db.collection('videos').doc(videoId).get();
        if (doc.exists) {
            const video = doc.data();
            const videoUrl = video.url || '';
            if (!isValidVideoUrl(videoUrl)) {
                document.querySelector('.video-player-container').innerHTML = '<p class="video-error">Invalid or missing video URL</p>';
                return;
            }
            artPlayer = new Artplayer({
                container: '#artplayer',
                url: videoUrl,
                autoplay: true,
                theme: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f1f1' : '#004aad',
                      volume: 0.5,
      isLive: false,
      muted: false,
      fullscreen: true,
      setting: true,
      hotkey: true,
      pip: true,
      autoSize: true,
      screenshot: false,
      playbackRate: true,
      aspectRatio: true,
      subtitleOffset: false,
      miniProgressBar: true,
      mutex: true,
      plugins: [
        artplayerPluginAutoThumbnail({
            //
        }),
    ],
    icons: {
    loading: '<div class="loading-spinner-vid"></div>',
    state: '<svg xmlns="http://www.w3.org/2000/svg" height="90" width="90" viewBox="0 0 240 240" focusable="false" fill="#fff"><path d="M62.8,199.5c-1,0.8-2.4,0.6-3.3-0.4c-0.4-0.5-0.6-1.1-0.5-1.8V42.6c-0.2-1.3,0.7-2.4,1.9-2.6c0.7-0.1,1.3,0.1,1.9,0.4l154.7,77.7c2.1,1.1,2.1,2.8,0,3.8L62.8,199.5z"></path></svg>',
    play: '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 240 240" focusable="false" fill="#fff"><path d="M62.8,199.5c-1,0.8-2.4,0.6-3.3-0.4c-0.4-0.5-0.6-1.1-0.5-1.8V42.6c-0.2-1.3,0.7-2.4,1.9-2.6c0.7-0.1,1.3,0.1,1.9,0.4l154.7,77.7c2.1,1.1,2.1,2.8,0,3.8L62.8,199.5z"></path></svg>',
    pause: '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 240 240" focusable="false" fill="#fff"><path d="M100,194.9c0.2,2.6-1.8,4.8-4.4,5c-0.2,0-0.4,0-0.6,0H65c-2.6,0.2-4.8-1.8-5-4.4c0-0.2,0-0.4,0-0.6V45c-0.2-2.6,1.8-4.8,4.4-5c0.2,0,0.4,0,0.6,0h30c2.6-0.2,4.8,1.8,5,4.4c0,0.2,0,0.4,0,0.6V194.9z M180,45.1c0.2-2.6-1.8-4.8-4.4-5c-0.2,0-0.4,0-0.6,0h-30c-2.6-0.2-4.8,1.8-5,4.4c0,0.2,0,0.4,0,0.6V195c-0.2,2.6,1.8,4.8,4.4,5c0.2,0,0.4,0,0.6,0h30c2.6,0.2,4.8-1.8,5-4.4c0-0.2,0-0.4,0-0.6V45.1z"></path></svg>',
    volume: '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 240 240" focusable="false" fill="#fff"><path d="M116.5,42.8v154.4c0,2.8-1.7,3.6-3.8,1.7l-54.1-48H29c-2.8,0-5.2-2.3-5.2-5.2V94.3c0-2.8,2.3-5.2,5.2-5.2h29.6l54.1-48C114.8,39.2,116.5,39.9,116.5,42.8z"></path><path d="M136.2,160v-20c11.1,0,20-8.9,20-20s-8.9-20-20-20V80c22.1,0,40,17.9,40,40S158.3,160,136.2,160z"></path><path d="M216.2,120c0-44.2-35.8-80-80-80v20c33.1,0,60,26.9,60,60s-26.9,60-60,60v20C180.4,199.9,216.1,164.1,216.2,120z"></path></svg>',
    volumeClose: '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 240 240" focusable="false" fill="#fff"><path d="M116.4,42.8v154.5c0,2.8-1.7,3.6-3.8,1.7l-54.1-48.1H28.9c-2.8,0-5.2-2.3-5.2-5.2V94.2c0-2.8,2.3-5.2,5.2-5.2h29.6l54.1-48.1C114.6,39.1,116.4,39.9,116.4,42.8z M212.3,96.4l-14.6-14.6l-23.6,23.6l-23.6-23.6l-14.6,14.6l23.6,23.6l-23.6,23.6l14.6,14.6l23.6-23.6l23.6,23.6l14.6-14.6L188.7,120L212.3,96.4z"></path></svg>',
    fullscreenOn: '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" focusable="false" fill="#fff"><path d="M0 5C0 3.89543 0.895431 3 2 3H9V5H2V9H0V5ZM22 5H15V3H22C23.1046 3 24 3.89543 24 5V9H22V5ZM2 15V19H9V21H2C0.895431 21 0 20.1046 0 19V15H2ZM22 19V15H24V19C24 20.1046 23.1046 21 22 21H15V19H22Z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>',
    fullscreenOff: '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" focusable="false" fill="#fff"><path d="M24 8H19V3H17V9V10H18H24V8ZM0 16H5V21H7V15V14H6H0V16ZM7 10H6H0V8H5V3H7V9V10ZM19 21V16H24V14H18H17V15V21H19Z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>',
    setting: '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 240 240" focusable="false" fill="#fff"><path d="M204,145l-25-14c0.8-3.6,1.2-7.3,1-11c0.2-3.7-0.2-7.4-1-11l25-14c2.2-1.6,3.1-4.5,2-7l-16-26c-1.2-2.1-3.8-2.9-6-2l-25,14c-6-4.2-12.3-7.9-19-11V35c0.2-2.6-1.8-4.8-4.4-5c-0.2,0-0.4,0-0.6,0h-30c-2.6-0.2-4.8,1.8-5,4.4c0,0.2,0,0.4,0,0.6v28c-6.7,3.1-13,6.7-19,11L56,60c-2.2-0.9-4.8-0.1-6,2L35,88c-1.6,2.2-1.3,5.3,0.9,6.9c0,0,0.1,0,0.1,0.1l25,14c-0.8,3.6-1.2,7.3-1,11c-0.2,3.7,0.2,7.4,1,11l-25,14c-2.2,1.6-3.1,4.5-2,7l16,26c1.2,2.1,3.8,2.9,6,2l25-14c5.7,4.6,12.2,8.3,19,11v28c-0.2,2.6,1.8,4.8,4.4,5c0.2,0,0.4,0,0.6,0h30c2.6,0.2,4.8-1.8,5-4.4c0-0.2,0-0.4,0-0.6v-28c7-2.3,13.5-6,19-11l25,14c2.5,1.3,5.6,0.4,7-2l15-26C206.7,149.4,206,146.7,204,145z M120,149.9c-16.5,0-30-13.4-30-30s13.4-30,30-30s30,13.4,30,30c0.3,16.3-12.6,29.7-28.9,30C120.7,149.9,120.4,149.9,120,149.9z"></path></svg>',
    pip: '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 16 16" focusable="false" fill="#fff"><path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/><path d="M8 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-3z"/></svg>',
  },
            });
            const videoTitle = document.getElementById('videoTitle');
            const uploaderAvatar = document.getElementById('uploaderAvatar');
            const uploaderNameLink = document.getElementById('uploaderNameLink');
            const uploadDate = document.getElementById('uploadDate');
            const viewCount = document.getElementById('viewCount');
            const descriptionText = document.getElementById('descriptionText');
            const toggleDescription = document.getElementById('toggleDescription');

            if (videoTitle) videoTitle.textContent = video.title || 'Untitled';
            if (uploaderAvatar) uploaderAvatar.src = video.userPhotoURL || 'https://placehold.co/36x36?text=U';
            if (uploaderNameLink) {
                uploaderNameLink.textContent = video.userDisplayName || 'Unknown';
                uploaderNameLink.href = `channel.html?userId=${video.userId}`;
            }
            if (uploadDate) uploadDate.textContent = video.timestamp ? moment(video.timestamp.toDate()).fromNow() : 'Unknown';
            if (viewCount) viewCount.textContent = video.viewCount || 0;
            if (descriptionText) descriptionText.textContent = video.description || 'No description';

            if (descriptionText && toggleDescription) {
                if (descriptionText.scrollHeight > descriptionText.clientHeight) {
                    toggleDescription.style.display = 'block';
                }
            }

            const likesQuery = await db.collection('videos').doc(videoId).collection('interactions').where('type', '==', 'like').get();
            const dislikesQuery = await db.collection('videos').doc(videoId).collection('interactions').where('type', '==', 'dislike').get();
            const likeCount = document.getElementById('likeCount');
            const dislikeCount = document.getElementById('dislikeCount');
            if (likeCount) likeCount.textContent = likesQuery.size;
            if (dislikeCount) dislikeCount.textContent = dislikesQuery.size;

            if (auth.currentUser) {
                const interactionRef = db.collection('videos').doc(videoId).collection('interactions').doc(auth.currentUser.uid);
                const interactionDoc = await interactionRef.get();
                if (interactionDoc.exists) {
                    const data = interactionDoc.data();
                    if (data.type === 'like') {
                        const likeButton = document.getElementById('likeButton');
                        if (likeButton) likeButton.classList.add('active');
                    } else if (data.type === 'dislike') {
                        const dislikeButton = document.getElementById('dislikeButton');
                        if (dislikeButton) dislikeButton.classList.add('active');
                    }
                }
            }

            await db.collection('videos').doc(videoId).update({
                viewCount: firebase.firestore.FieldValue.increment(1)
            }).catch(error => {
                console.warn('Error incrementing view count:', error);
            });

            loadRelatedVideos(video.title);
        } else {
            console.error('Video not found for ID:', videoId);
            document.querySelector('.video-player-container').innerHTML = '<p class="video-error">Video not found</p>';
        }
    } catch (error) {
        console.error('Error loading video:', error);
        document.querySelector('.video-player-container').innerHTML = `<p class="video-error">Error loading video: ${error.message}</p>`;
    }
}

        // Create Related Video Card
        function createRelatedVideoCard(video, id) {
            const thumbnail = video.thumbnail || 'https://placehold.co/600x400?text=No+Thumbnail';
            const userName = video.userDisplayName || 'Unknown';
            const uploadDate = video.timestamp ? moment(video.timestamp.toDate()).fromNow() : 'Unknown';
            const views = video.viewCount ? video.viewCount.toLocaleString() + ' views' : '0 views';
            return `
                <div class="related-video-card" data-id="${id}">
                    <img src="${thumbnail}" class="related-thumbnail" alt="${video.title}"
                         onerror="this.src='https://placehold.co/600x400?text=Thumbnail+Error'" loading="lazy">
                    <div class="related-video-details">
                        <div class="related-video-title">${video.title}</div>
                        <div class="related-video-uploader">${userName}</div>
                        <div class="related-video-views">${views} • ${uploadDate}</div>
                    </div>
                </div>
            `;
        }

        // Load Related Videos
        async function loadRelatedVideos(title) {
            const relatedContainer = document.getElementById('relatedVideos');
            try {
                const snapshot = await db.collection('videos').orderBy('timestamp', 'desc').limit(999).get();
                relatedContainer.innerHTML = '';
                if (snapshot.empty) {
                    relatedContainer.innerHTML = '<p style="color: var(--secondary-text);">No related videos found</p>';
                    return;
                }
                snapshot.forEach(doc => {
                    if (doc.id !== videoId) {
                        relatedContainer.innerHTML += createRelatedVideoCard(doc.data(), doc.id);
                    }
                });
                if (relatedContainer.innerHTML === '') {
                    relatedContainer.innerHTML = '<p style="color: var(--secondary-text);">No related videos found</p>';
                }
            } catch (error) {
                console.error('Error loading related videos:', error);
                relatedContainer.innerHTML = '<p style="color: var(--secondary-text);">Error loading related videos</p>';
            }
        }
        async function handleLike(videoId, userId) {
            const interactionRef = db.collection('videos').doc(videoId).collection('interactions').doc(userId);
            try {
                const doc = await interactionRef.get();
                if (doc.exists) {
                    const data = doc.data();
                    if (data.type === 'like') {
                        await interactionRef.delete();
                        document.getElementById('likeButton').classList.remove('active');
                        document.getElementById('likeCount').textContent = parseInt(document.getElementById('likeCount').textContent) - 1;
                    } else if (data.type === 'dislike') {
                        await interactionRef.update({ type: 'like', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
                        document.getElementById('dislikeButton').classList.remove('active');
                        document.getElementById('likeButton').classList.add('active');
                        document.getElementById('dislikeCount').textContent = parseInt(document.getElementById('dislikeCount').textContent) - 1;
                        document.getElementById('likeCount').textContent = parseInt(document.getElementById('likeCount').textContent) + 1;
                    }
                } else {
                    await interactionRef.set({ userId, type: 'like', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
                    document.getElementById('likeButton').classList.add('active');
                    document.getElementById('likeCount').textContent = parseInt(document.getElementById('likeCount').textContent) + 1;
                }
            } catch (error) {
                console.error('Error liking video:', error);
                alert('Error liking video: ' + error.message);
            }
        }

        // Handle Dislike
        async function handleDislike(videoId, userId) {
            const interactionRef = db.collection('videos').doc(videoId).collection('interactions').doc(userId);
            try {
                const doc = await interactionRef.get();
                if (doc.exists) {
                    const data = doc.data();
                    if (data.type === 'dislike') {
                        await interactionRef.delete();
                        document.getElementById('dislikeButton').classList.remove('active');
                        document.getElementById('dislikeCount').textContent = parseInt(document.getElementById('dislikeCount').textContent) - 1;
                    } else if (data.type === 'like') {
                        await interactionRef.update({ type: 'dislike', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
                        document.getElementById('likeButton').classList.remove('active');
                        document.getElementById('dislikeButton').classList.add('active');
                        document.getElementById('likeCount').textContent = parseInt(document.getElementById('likeCount').textContent) - 1;
                        document.getElementById('dislikeCount').textContent = parseInt(document.getElementById('dislikeCount').textContent) + 1;
                    }
                } else {
                    await interactionRef.set({ userId, type: 'dislike', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
                    document.getElementById('dislikeButton').classList.add('active');
                    document.getElementById('dislikeCount').textContent = parseInt(document.getElementById('dislikeCount').textContent) + 1;
                }
            } catch (error) {
                console.error('Error disliking video:', error);
                alert('Error disliking video: ' + error.message);
            }
        }

        // Toggle Description
        document.getElementById('toggleDescription').addEventListener('click', () => {
            const descriptionText = document.getElementById('descriptionText');
            const toggleButton = document.getElementById('toggleDescription');
            if (descriptionText.classList.contains('expanded')) {
                descriptionText.classList.remove('expanded');
                toggleButton.textContent = 'Show More';
            } else {
                descriptionText.classList.add('expanded');
                toggleButton.textContent = 'Show Less';
            }
        });

        // Event Listeners
        userAvatar.addEventListener('click', () => {
            if (auth.currentUser) {
                auth.signOut().catch(error => alert('Error signing out: ' + error.message));
            }
        });

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

        // Like/Dislike/Share Handlers
        document.getElementById('likeButton').addEventListener('click', () => {
            if (auth.currentUser) {
                handleLike(videoId, auth.currentUser.uid);
            } else {
                alert('Please sign in to like the video');
            }
        });

        document.getElementById('dislikeButton').addEventListener('click', () => {
            if (auth.currentUser) {
                handleDislike(videoId, auth.currentUser.uid);
            } else {
                alert('Please sign in to dislike the video');
            }
        });

        document.getElementById('shareButton').addEventListener('click', () => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert('Video URL copied to clipboard');
            }).catch(err => {
                console.error('Error copying URL:', err);
                alert('Failed to copy URL');
            });
        });

        // Search Functionality
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `index.html?search=${encodeURIComponent(query)}`;
                }
            }
        });

        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `index.html?search=${encodeURIComponent(query)}`;
            }
        });

        // Related Videos Click
        document.getElementById('relatedVideos').addEventListener('click', (e) => {
            const card = e.target.closest('.related-video-card');
            if (card) {
                window.location.href = `watch.html?id=${card.dataset.id}`;
            }
        });

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            if (videoId) {
                loadVideo();
            } else {
                document.querySelector('.video-player-container').innerHTML = '<p class="video-error">No video ID provided</p>';
            }
        });