document.addEventListener("DOMContentLoaded", function() {
    const imageUpload = document.getElementById("imageUpload");
    const imageList = document.getElementById("imageList");
    const imagePreview = document.getElementById("imagePreview");
    const imagePreviewImage = imagePreview.querySelector(".image-preview__image");
    const imagePreviewDefaultText = imagePreview.querySelector(".image-preview__default-text");
    const clearAllButton = document.getElementById("clearAllButton");
    const activateCropperButton = document.getElementById("activateCropperButton");
    const cropButton = document.getElementById("cropButton");
    const resetImageButton = document.getElementById("resetImageButton");

    let cropper;
    let originalImageSrc; // To store the original image source
    let croppedImageSrc; // To store the cropped image source

    imageUpload.addEventListener("change", function() {
        const files = this.files;

        Array.from(files).forEach(file => {
            const reader = new FileReader();

            reader.addEventListener("load", function() {
                const imgElement = document.createElement("img");
                imgElement.src = this.result;
                imgElement.classList.add("image-list__item");
                imgElement.addEventListener("click", function() {
                    Array.from(imageList.getElementsByClassName("image-list__item")).forEach(item => {
                        item.classList.remove("selected");
                    });
                    this.classList.add("selected");
                    previewImage(this.src);
                });

                const removeButton = document.createElement("button");
                removeButton.innerText = "x";
                removeButton.classList.add("remove-button");
                removeButton.addEventListener("click", function(event) {
                    event.stopPropagation(); // Prevent the click from triggering the image click event
                    imageList.removeChild(listItem);
                    if (imgElement.classList.contains("selected")) {
                        resetPreview();
                    }
                });

                const listItem = document.createElement("div");
                listItem.classList.add("image-list__item");
                listItem.appendChild(imgElement);
                listItem.appendChild(removeButton);
                imageList.appendChild(listItem);
            });

            reader.readAsDataURL(file);
        });
    });

    clearAllButton.addEventListener("click", function() {
        imageList.innerHTML = "";
        resetPreview();
    });

    activateCropperButton.addEventListener("click", function() {
        if (cropper) {
            cropper.destroy();
        }
        cropper = new Cropper(imagePreviewImage, {
            viewMode: 1, // No aspect ratio constraint
            ready: function() {
                // Store the original image source only once when cropper is ready
                if (!originalImageSrc) {
                    originalImageSrc = imagePreviewImage.src;
                }
            }
        });
        cropButton.style.display = "inline-block";
        resetImageButton.style.display = "none"; // Reset button hidden initially
        activateCropperButton.style.display = "none";
    });

    cropButton.addEventListener("click", function() {
        if (cropper) {
            const croppedCanvas = cropper.getCroppedCanvas();
            croppedImageSrc = croppedCanvas.toDataURL();
            previewImage(croppedImageSrc);
            cropper.destroy();
            cropper = null; // Destroy cropper instance after cropping
            cropButton.style.display = "none";
            resetImageButton.style.display = "inline-block"; // Display reset button after cropping
        }
    });

    resetImageButton.addEventListener("click", function() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        imagePreviewImage.src = originalImageSrc;
        imagePreviewImage.style.width = "auto"; // Reset width to auto
        imagePreviewImage.style.height = "auto"; // Reset height to auto
        activateCropperButton.style.display = "inline-block";
        resetImageButton.style.display = "none";
        croppedImageSrc = null;
    });

    function previewImage(src) {
        imagePreviewImage.setAttribute("src", src);
        imagePreviewDefaultText.style.display = "none";
        imagePreviewImage.style.display = "block";

        const img = new Image();
        img.src = src;
        img.onload = function() {
            const maxWidth = 500; // Maximum width
            const maxHeight = 500; // Maximum height
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = height * (maxWidth / width);
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = width * (maxHeight / height);
                height = maxHeight;
            }

            imagePreviewImage.style.width = width + 'px';
            imagePreviewImage.style.height = height + 'px';
            activateCropperButton.style.display = "inline-block";
        }
    }

    function resetPreview() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        originalImageSrc = null;
        croppedImageSrc = null;
        imagePreviewImage.setAttribute("src", "");
        imagePreviewDefaultText.style.display = "block";
        imagePreviewImage.style.display = "none";
        imagePreviewImage.style.width = "auto"; // Reset width to auto
        imagePreviewImage.style.height = "auto"; // Reset height to auto
        cropButton.style.display = "none";
        resetImageButton.style.display = "none";
        activateCropperButton.style.display = "none";
    }
});
