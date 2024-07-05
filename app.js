// script.js

(function() {
    const { jsPDF } = window.jspdf;
    const uploadInput = document.getElementById('upload');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const photo = document.getElementById('photo');
    const captureButton = document.getElementById('capture');
    const cropButton = document.getElementById('cropButton');
    const generatePdfButton = document.getElementById('generatePdf');
    const imgContainer = document.querySelector('.img-container');
    const constraints = {
        video: {
            width: 320,
            height: 240
        }
    };
    let capturedImage = null;
    let cropper = null;

    // Access the device camera and stream to video element
    function startCamera() {
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                video.srcObject = stream;
            })
            .catch((err) => {
                console.error('Error accessing media devices.', err);
            });
    }

    // Capture a photo by drawing the video frame on a canvas
    function capturePhoto() {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        capturedImage = canvas.toDataURL('image/png');
        displayImage(capturedImage);
    }

    // Display the image and initialize the cropper
    function displayImage(imageSrc) {
        photo.setAttribute('src', imageSrc);
        imgContainer.style.display = 'block';
        if (cropper) {
            cropper.destroy();
        }
        cropper = new Cropper(photo, {
            aspectRatio: 1,
            viewMode: 1
        });
    }

    // Handle image upload
    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            capturedImage = e.target.result;
            displayImage(capturedImage);
        };

        reader.readAsDataURL(file);
    });

    // Crop the image
    cropButton.addEventListener('click', () => {
        if (cropper) {
            const croppedCanvas = cropper.getCroppedCanvas();
            capturedImage = croppedCanvas.toDataURL('image/png');
            photo.setAttribute('src', capturedImage);
        }
    });

    // Generate PDF with the cropped image
    function generatePdf() {
        if (!capturedImage) {
            alert('Please upload or capture and crop an image first.');
            return;
        }

        const pdf = new jsPDF();
        pdf.addImage(capturedImage, 'PNG', 15, 40, 180, 160);
        pdf.save('receipt.pdf');
    }

    captureButton.addEventListener('click', capturePhoto);
    generatePdfButton.addEventListener('click', generatePdf);
    window.addEventListener('load', startCamera);
})();