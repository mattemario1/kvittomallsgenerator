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

    let croppers = {}; // Object to store cropper instances for each image
    let originalImageSrcs = {}; // Object to store original image sources for each image
    let croppedImageSrcs = {}; // Object to store cropped image sources for each image
    let croppedImagesStatus = {}; // Object to store the status of cropped images for each image

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
                    // Check if a cropped version exists, and display it
                    const imgSrc = this.src;
                    if (croppedImageSrcs[imgSrc]) {
                        previewImage(croppedImageSrcs[imgSrc]); // Display cropped image
                    } else {
                        previewImage(imgSrc); // Display original image
                    }
                    checkAndToggleResetButton(this.src); // Check and toggle reset button based on the selected image
                });

                const removeButton = document.createElement("button");
                removeButton.innerText = "x";
                removeButton.classList.add("remove-button");
                removeButton.addEventListener("click", function(event) {
                    event.stopPropagation(); // Prevent the click from triggering the image click event
                    imageList.removeChild(listItem);
                    const imgSrc = imgElement.src;
                    delete croppers[imgSrc]; // Remove cropper instance
                    delete originalImageSrcs[imgSrc]; // Remove original image source
                    delete croppedImageSrcs[imgSrc]; // Remove cropped image source
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
        const selectedImage = imageList.querySelector("img.selected");
        console.log(selectedImage);
        if (selectedImage) {
            const imgSrc = selectedImage.src;

            if (!croppers[imgSrc]) {
                croppers[imgSrc] = new Cropper(imagePreviewImage, {
                    viewMode: 1, // No aspect ratio constraint
                    ready: function() {
                        // Store the original image source only once when cropper is ready
                        if (!originalImageSrcs[imgSrc]) {
                            originalImageSrcs[imgSrc] = imgSrc;
                        }
                    }
                });
            } else {
                croppers[imgSrc].replace(imgSrc);
            }

            cropButton.style.display = "inline-block";
            resetImageButton.style.display = "none"; // Reset button hidden initially
            activateCropperButton.style.display = "none";
        }
    });

    cropButton.addEventListener("click", function() {
        const selectedImage = imageList.querySelector("img.selected");
        if (selectedImage) {
            const imgSrc = selectedImage.src;
            if (croppers[imgSrc]) {
                const croppedCanvas = croppers[imgSrc].getCroppedCanvas();
                croppedImageSrcs[imgSrc] = croppedCanvas.toDataURL();
                previewImage(croppedImageSrcs[imgSrc]);
                croppers[imgSrc].destroy();
                delete croppers[imgSrc];
                cropButton.style.display = "none";
                croppedImagesStatus[imgSrc] = true; // Show button if image is cropped
                checkAndToggleResetButton(imgSrc); // Hide button if image is not cropped
            }
        }
    });

    function checkAndToggleResetButton(imageSrc) {
        if (croppedImagesStatus[imageSrc]) {
            resetImageButton.style.display = 'block'; // Show button if image is cropped
        } else {
            resetImageButton.style.display = 'none'; // Hide button if image is not cropped
        }
    }

    resetImageButton.addEventListener("click", function() {
        const selectedImage = imageList.querySelector("img.selected");
        if (selectedImage) {
            const imgSrc = selectedImage.src;

            if (croppers[imgSrc]) {
                croppers[imgSrc].destroy();
                delete croppers[imgSrc];
            }

            imagePreviewImage.src = originalImageSrcs[imgSrc];
            imagePreviewImage.style.width = "auto"; // Reset width to auto
            imagePreviewImage.style.height = "auto"; // Reset height to auto
            activateCropperButton.style.display = "inline-block";
            resetImageButton.style.display = "none";
            croppedImageSrcs[imgSrc] = null;
            croppedImagesStatus[imgSrc] = false; // Mark the image as not cropped
            checkAndToggleResetButton(imgSrc); // Update the reset button visibility
        }
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
        if (croppers) {
            Object.values(croppers).forEach(cropper => cropper.destroy());
            croppers = {};
        }
        originalImageSrcs = {};
        croppedImageSrcs = {};
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
