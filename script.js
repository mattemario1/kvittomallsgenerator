document.addEventListener("DOMContentLoaded", function() {
    const imageUpload = document.getElementById("imageUpload");
    const imagePreview = document.getElementById("imagePreview");
    const imagePreviewImage = imagePreview.querySelector(".image-preview__image");
    const imagePreviewDefaultText = imagePreview.querySelector(".image-preview__default-text");

    imageUpload.addEventListener("change", function() {
        const file = this.files[0];

        if (file) {
            const reader = new FileReader();

            reader.addEventListener("load", function() {
                imagePreviewImage.setAttribute("src", this.result);
                imagePreviewDefaultText.style.display = "none";
                imagePreviewImage.style.display = "block";

                // Create an off-screen image to get the dimensions
                const img = new Image();
                img.src = this.result;
                img.onload = function() {
                    const maxWidth = 500; // Maximum width
                    const maxHeight = 500; // Maximum height
                    let width = img.width;
                    let height = img.height;

                    // Calculate the new dimensions while maintaining the aspect ratio
                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }
                    if (height > maxHeight) {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }

                    // Set the dimensions of the preview box
                    imagePreview.style.width = width + 'px';
                    imagePreview.style.height = height + 'px';
                }
            });

            reader.addEventListener("error", function() {
                console.error("Error reading file:", reader.error);
                imagePreviewDefaultText.textContent = "Failed to load image.";
            });

            reader.readAsDataURL(file);
        } else {
            imagePreviewDefaultText.style.display = null;
            imagePreviewImage.style.display = "none";
            imagePreviewImage.setAttribute("src", "");
            imagePreview.style.width = 'auto';
            imagePreview.style.height = 'auto';
        }
    });
});
