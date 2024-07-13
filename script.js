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
        }
    });
});
