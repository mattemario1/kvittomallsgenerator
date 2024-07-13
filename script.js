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
    const createPdfButton = document.getElementById("createPdfButton");

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

                // Add the loaded image source to originalImageSrcs
                originalImageSrcs[this.result] = imgElement.src; // Or true, if you just want to mark it as added


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

    createPdfButton.addEventListener("click", function() {
        createPdfFromImages();
    });

    // Function to create a PDF from images
    function createPdfFromImages() {
        const doc = new jspdf.jsPDF();
        let imagesProcessed = 0;
        const totalImages = Object.keys(originalImageSrcs).length;
    
        Object.keys(originalImageSrcs).forEach((key, index) => {
            const imgSrc = croppedImageSrcs[key] ? croppedImageSrcs[key] : originalImageSrcs[key];
            console.log("Adding image to PDF:", imgSrc); // Debugging log
    
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Use this if images are from a different origin
            img.src = imgSrc;
            img.onload = function() {
                // Create a canvas to convert image to data URL
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                
                // Convert canvas to PNG data URL
                const dataURL = canvas.toDataURL("image/png");
                
                // Calculate aspect ratio of the image
                const aspectRatio = img.width / img.height;
                
                // Define maximum dimensions considering page size and margins
                const pageWidth = 210 - 40; // A4 width - margins
                const pageHeight = 297 - 40; // A4 height - margins
                let newWidth, newHeight;
                
                // Scale image to fit within the maximum dimensions while maintaining aspect ratio
                if (aspectRatio > 1) { // Landscape orientation
                    newWidth = Math.min(img.width, pageWidth);
                    newHeight = newWidth / aspectRatio;
                } else { // Portrait orientation
                    newHeight = Math.min(img.height, pageHeight);
                    newWidth = newHeight * aspectRatio;
                }
                
                // Check if scaled dimensions are still too large for the page
                if (newHeight > pageHeight) {
                    newHeight = pageHeight;
                    newWidth = newHeight * aspectRatio;
                }
                
                // Calculate positions to center the image
                const xPos = (pageWidth - newWidth) / 2 + 20; // Add margin to x position
                const yPos = (pageHeight - newHeight) / 2 + 20; // Add margin to y position
                
                // Add a new page for every image after the first
                if (index > 0) {
                    doc.addPage();
                }
                
                // Use the data URL for the image, with adjusted dimensions to maintain aspect ratio
                doc.addImage(dataURL, 'PNG', xPos, yPos, newWidth, newHeight);
                
                imagesProcessed++;
                if (imagesProcessed === totalImages) {
                    doc.save('images.pdf');
                }
            };
        });
    
        if(totalImages === 0) { // If no images are present, just save an empty PDF
            doc.save('images.pdf');
        }
    }

});
