// ============================================================
//   PROFILE JS
// ============================================================

// ---- 1. Theme Sync ----
const htmlElement = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);

// ---- 2. Avatar Upload Logic ----
const editBtn = document.getElementById('edit-avatar-btn');
const avatarMenu = document.getElementById('avatar-menu');
const cameraInput = document.getElementById('camera-input');
const galleryInput = document.getElementById('gallery-input');
const removePicBtn = document.getElementById('remove-pic-btn');
const profileInitial = document.getElementById('profile-initial');
const profileImg = document.getElementById('profile-img');

// Open/Close the popup menu
editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    avatarMenu.classList.toggle('show');
});

// Close menu if user clicks anywhere else on the screen
document.addEventListener('click', (e) => {
    if (!avatarMenu.contains(e.target) && !editBtn.contains(e.target)) {
        avatarMenu.classList.remove('show');
    }
});

// Function to check memory and load the image if it exists
function loadAvatar() {
    const savedAvatar = localStorage.getItem('userAvatar'); // Look for saved image
    
    if (savedAvatar) {
        profileImg.src = savedAvatar;         // Put image data into the <img> tag
        profileImg.style.display = 'flex';    // Show the image
        profileInitial.style.display = 'none';// Hide the 'P'
        removePicBtn.style.display = 'block'; // Show the "Remove" option in menu
    } else {
        profileImg.src = '';                  // Clear the image tag
        profileImg.style.display = 'none';    // Hide the image
        profileInitial.style.display = 'flex';// Show the 'P'
        removePicBtn.style.display = 'none';  // Hide the "Remove" option in menu
    }
}

// Run this immediately when the page loads!
loadAvatar();

// ---- 3. Cropper Cleanup on Page Unload ----
window.addEventListener('beforeunload', () => {
    if (cropper) { cropper.destroy(); cropper = null; }
});

// ---- 4. Cropper.js Logic ----
let cropper = null; // Holds the cropper instance
const cropModal = document.getElementById('crop-modal');
const imageToCrop = document.getElementById('image-to-crop');
const cancelCropBtn = document.getElementById('cancel-crop');
const saveCropBtn = document.getElementById('save-crop');

// Function to handle the selected file and open the cropper
function handleFileSelection(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // 1. Load the raw image into the modal
            imageToCrop.src = e.target.result;
            
            // 2. Show the modal
            cropModal.style.display = 'flex';
            avatarMenu.classList.remove('show'); // Close the dropdown menu
            
            // 3. Initialize Cropper.js (Destroy any old instance first)
            if (cropper) { cropper.destroy(); }
            
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 1, // Forces a perfect square crop
                viewMode: 1,    // Restricts the crop box to stay inside the image
                dragMode: 'move', // Lets the user drag the image around
                autoCropArea: 0.9,
                guides: true,
                center: true,
                background: false,
            });
        };
        
        reader.readAsDataURL(file);
    }
    
    // Clear the inputs so the user can select the same file again if they want
    cameraInput.value = '';
    galleryInput.value = '';
}

// Listeners for file selection
cameraInput.addEventListener('change', handleFileSelection);
galleryInput.addEventListener('change', handleFileSelection);

// ---- 5. Modal Buttons ----

// Cancel Button Logic
cancelCropBtn.addEventListener('click', () => {
    cropModal.style.display = 'none';
    if (cropper) { cropper.destroy(); cropper = null; }
});

// Save Button Logic
saveCropBtn.addEventListener('click', () => {
    if (!cropper) return;
    
    // Extract the cropped area as a tiny canvas (perfectly sized for avatars)
    const croppedCanvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });
    
    // Convert the cropped canvas to a Base64 string
    const finalImageData = croppedCanvas.toDataURL('image/jpeg', 0.9);
    
    // Save to memory and update UI
    localStorage.setItem('userAvatar', finalImageData);
    loadAvatar(); 
    
    // Clean up and close modal
    cropModal.style.display = 'none';
    cropper.destroy();
    cropper = null;
});

// Logic to delete the picture
removePicBtn.addEventListener('click', () => {
    localStorage.removeItem('userAvatar'); // Delete from memory
    loadAvatar(); // Instantly update the UI back to 'P'
    avatarMenu.classList.remove('show'); // Close the menu
});