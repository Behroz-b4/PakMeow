<h3>PakMeow is a video platform that allows users to watch and upload videos, similar to platforms like YouTube, Dailymotion, and Bilibili. It provides a user-friendly interface for content creators to share their videos and for viewers to discover, stream, and engage with a wide variety of content.</h3>
<h2>Step 1: Create Firebase Account</h2>
<h4>1. Create Authentication with email and password.</h4>
<h4>2. Create Firestore Database and rules below: </h4>
<pre><code>rules_version = '2';
service cloud.firestore {
    match /databases/{database}/documents {
        match /users/{userId} {
            allow read, write: if request.auth != null && request.auth.uid == userId;
            allow create: if request.auth != null && request.auth.uid == userId
                          && request.resource.data.uid == userId;
        }
        match /videos/{videoId} {
            allow read: if true;
            allow write: if request.auth != null;
            match /interactions/{userId} {
                allow read: if true;
                allow write: if request.auth != null && request.auth.uid == userId;
            }
        }
    }
}</code></pre>
<h2>Demo Screenshort</h2>
<p>Live Demo link: <a href="https://behroz-b4.github.io/PakMeow/">PakMeow</a></p><br>
<br>

![PakMeow SS1](https://github.com/user-attachments/assets/aeb72a2d-5570-48d1-9d10-8a8ca0b8b27e)
![PakMeow SS2](https://github.com/user-attachments/assets/80e04a06-a8d0-4667-9a7d-4b437fde0cf6)
![PakMeow SS3](https://github.com/user-attachments/assets/c110ee0c-60f5-4f87-978e-ed219b38ff85)

