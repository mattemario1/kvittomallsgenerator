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
    const myForm = document.getElementById("myForm");

    let croppers = {}; // Object to store cropper instances for each image
    let originalImageSrcs = {}; // Object to store original image sources for each image
    let croppedImageSrcs = {}; // Object to store cropped image sources for each image
    let croppedImagesStatus = {}; // Object to store the status of cropped images for each image
    let fileTypes = {}; // Object to store file types for each file
    let pdfFiles = {}; // Object to store PDF files separately

    console.log("HEJ");

    imageUpload.addEventListener("change", function() {
        const files = this.files;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            console.log(file.type);

            reader.addEventListener("load", function() {

                // Store the file type
                fileTypes[this.result] = file.type;

                if (file.type === "application/pdf") {
                    const listItem = document.createElement("li"); // Create a list item or div
                    listItem.classList.add("image-list__item", "pdf-item");

                    const pdfText = document.createElement("span"); // Create a span for the PDF text
                    pdfText.textContent = `PDF: ${file.name}`;
                    listItem.appendChild(pdfText); // Append the PDF text to the list item

                    originalImageSrcs[this.result] = this.result;

                    const removeButton = document.createElement("button");
                    removeButton.innerText = "x";
                    removeButton.classList.add("remove-button");
                    removeButton.addEventListener("click", function(event) {
                        event.stopPropagation(); // Prevent the click from triggering the PDF item click event
                        imageList.removeChild(listItem);
                        delete originalImageSrcs[pdfText.textContent]; // Adjust this line based on how you're tracking PDF files
                        // Additional cleanup if necessary
                    });
                    listItem.appendChild(removeButton); // Append the remove button to the list item

                    imageList.appendChild(listItem); // Append the list item to the image list

                } else {

                const imgElement = document.createElement("img");
                imgElement.src = this.result;
                imgElement.classList.add("image-list__item");

                // Add the loaded image source to originalImageSrcs
                originalImageSrcs[this.result] = imgElement.src; // Or true, if you just want to mark it as added
                
                console.log(imgElement.src); // Debugging log

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
                }
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
        modifyAndCreatePdf();
    });

    async function modifyAndCreatePdf() {
        // Load an existing PDF document
        const existingPdfBytes = await fetch('Kvittomall_LiTHeBlås.pdf').then(res => res.arrayBuffer());
        let pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    
        // Insert text into the first page
        pdfDoc = await insertTextIntoFirstPagePdf(pdfDoc);
    
        // Add images or perform other operations
        pdfDoc = await createPdfWithFirstPageAndImages(pdfDoc);
    
        // Serialize the PDFDocument to bytes
        const pdfBytes = await pdfDoc.save();

        // Create a blob from the PDF bytes
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Create a URL for the blob
        const blobUrl = URL.createObjectURL(blob);

        // Create an anchor element and trigger the download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'modified-pdf.pdf'; // Specify the download file name
        document.body.appendChild(link);
        link.click();

        // Cleanup: remove the link after triggering download
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    }


    // Assuming getTextBoxes() returns an array of text items to insert
    async function insertTextIntoFirstPagePdf(pdfDoc) {
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const form = pdfDoc.getForm();

        // Get all form fields in the PDF
        const fields = form.getFields();

        // Log the names of all form fields
        fields.forEach(field => {
            console.log(field.getName());
        });

        const nameField = form.getTextField('Textf#C3#A4lt 1');
        const informationField = form.getTextField('Textf#C3#A4lt 2');
        const krField = form.getTextField('Valutaf#C3#A4lt 1');
        const dateField = form.getTextField('Datumf#C3#A4lt 1');
        const bankNrField = form.getTextField('Textf#C3#A4lt 4');
        const clearingNrField = form.getTextField('Textf#C3#A4lt 4_2');
        const bankNameField = form.getTextField('Textf#C3#A4lt 4_3');


        nameField.setText(document.getElementById("firstName").value + ' ' + document.getElementById("surName").value);
        informationField.setText(document.getElementById("expenseInfo").value);
        krField.setText(document.getElementById("amount").value);
        dateField.setText(document.getElementById("date").value);
        bankNrField.setText(document.getElementById("accountNumber").value);
        clearingNrField.setText(document.getElementById("clearingNumber").value);
        bankNameField.setText(document.getElementById("bank").value);
        // date2Field.setText('8');


        return pdfDoc;

    }

    async function createPdfWithFirstPageAndImages(pdfDoc) {
        const totalImages = Object.keys(originalImageSrcs).length;

        if(totalImages === 0) { // If no images are present
            const proceedWithoutImages = confirm("Inga bilder på kvitton hittades. Vill du skapa PDF:en utan kvitton?");
            if (!proceedWithoutImages) {
                console.log("PDF creation cancelled.");
                return null; // Return null or handle as needed to indicate cancellation
            }
            console.log("Creating PDF without images.");
            return pdfDoc;
        }
    
        for (const key of Object.keys(originalImageSrcs)) {
            // Get the image source to add to the PDF (use cropped version if available)
            const imgSrc = croppedImageSrcs[key] ? croppedImageSrcs[key] : originalImageSrcs[key];

            console.log("Adding image to PDF:", imgSrc); // Debugging log
    
            console.log(fileTypes[key]); // Debugging log

            if (fileTypes[key] === 'image/jpg' || fileTypes[key] === 'image/jpeg') {
                const imageBytes = await fetch(imgSrc).then(res => res.arrayBuffer());
                const image = await pdfDoc.embedJpg(imageBytes);
                const page = pdfDoc.addPage();
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: page.getWidth(),
                    height: page.getHeight(),
                });
            } else if (fileTypes[key] === 'image/png') {
                const imageBytes = await fetch(imgSrc).then(res => res.arrayBuffer());
                const image = await pdfDoc.embedPng(imageBytes);
                const page = pdfDoc.addPage();
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: page.getWidth(),
                    height: page.getHeight(),
                });
            } else if (fileTypes[key] === 'application/pdf') {
                const pdfBytes = await fetch(imgSrc).then(res => res.arrayBuffer());
                const embeddedPdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
                const pageCount = embeddedPdfDoc.getPageCount();
                for (let i = 0; i < pageCount; i++) {
                    const [embeddedPage] = await pdfDoc.copyPages(embeddedPdfDoc, [i]);
                    pdfDoc.addPage(embeddedPage);
                }
            } else {
                console.error("Unsupported file type:", fileType);
            }
        }

        return pdfDoc;
    }

});
