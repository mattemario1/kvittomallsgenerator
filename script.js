document.addEventListener("DOMContentLoaded", function() {
    const imageUpload = document.getElementById("imageUpload");
    const receiptList = document.getElementById("receiptList");
    const imagePreview = document.getElementById("imagePreview");
    const imagePreviewImage = imagePreview.querySelector(".image-preview__image");
    const imagePreviewDefaultText = imagePreview.querySelector(".image-preview__default-text");
    const clearAllButton = document.getElementById("clearAllButton");
    const activateCropperButton = document.getElementById("activateCropperButton");
    const cropButton = document.getElementById("cropButton");
    const resetImageButton = document.getElementById("resetImageButton");
    const createPdfButton = document.getElementById("createPdfButton");
    const tourCheckbox = document.getElementById("tourCheckbox");
    const templetTypeOptions = document.getElementById("templetTypeOptions");
    const myForm = document.getElementById("myForm");

    let croppers = {}; // Object to store cropper instances for each image
    let originalImageSrcs = {}; // Object to store original image sources for each image
    let croppedImageSrcs = {}; // Object to store cropped image sources for each image
    let croppedImagesStatus = {}; // Object to store the status of cropped images for each image
    let fileTypes = {}; // Object to store file types for each file
    
    imageUpload.addEventListener("change", function() {
        const files = this.files;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            console.log("File type of uploaded file:", file.type);
            
            if(file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "application/pdf") {
                alert("Endast bilder (JPEG, PNG) och PDF-filer stöds. Denna fil kommer inte att läggas till: ", file.name);
                return; // Skip to the next file if it's not an image or PDF
            }
            
            reader.addEventListener("load", function() {
                
                // Create a container div for each file
                const boxContainer = document.createElement("div");
                boxContainer.classList.add("media-box");

                // Toggle selection on click
                boxContainer.addEventListener("click", function() {
                    // Remove 'selected-box' class from all boxes
                    document.querySelectorAll('.media-box').forEach(box => {
                        box.classList.remove('selected-box');
                    });
                    
                    // Add 'selected' class to the clicked box
                    this.classList.add("selected-box");
                    
                    // Attempt to find an image within the clicked box
                    const imgElement = this.querySelector('img');
                    
                    if (imgElement) {
                        const imgSrc = imgElement.src;
                        checkAndToggleResetButton(imgSrc)
                        // If it contains an image, call the previewImage function with the image's src
                        if (croppedImageSrcs[imgSrc]) {
                            previewImage(croppedImageSrcs[imgSrc]); // Display cropped image
                        } else {
                            previewImage(imgSrc); // Display original image
                        }
                    } else {
                        resetPreview(); // Reset the preview if the selected box does not contain an image
                    }
                    console.log(receiptList);
                });
                
                if (file.type === "image/jpeg" || file.type === "image/png") {
                    // It's an image
                    const image = document.createElement("img");
                    image.src = this.result;
                    // Add the loaded image source to originalImageSrcs
                    image.classList.add("media-image");
                    boxContainer.appendChild(image);
                } else if (file.type === "application/pdf") {
                    // It's a PDF
                    const pdfText = document.createElement("span");
                    pdfText.textContent = `PDF: ${file.name}`;
                    pdfText.src = this.result;
                    pdfText.classList.add("media-pdf");
                    boxContainer.appendChild(pdfText);
                }

                originalImageSrcs[this.result] = this.result; 
                fileTypes[this.result] = file.type;
                
                // Append the container to the list
                receiptList.appendChild(boxContainer);
                console.log(receiptList);
                
                // Optional: Add a remove button to each box
                const removeButton = document.createElement("button");
                removeButton.innerText = "x";
                removeButton.classList.add("remove-button");
                removeButton.addEventListener("click", function() {
                    event.stopPropagation(); // Prevent the box from being selected when the remove button is clicked
                    resetPreview();
                    receiptList.removeChild(boxContainer);
                });
                boxContainer.appendChild(removeButton);

                const handle = document.createElement("div");
                handle.classList.add("handle");
                handle.textContent = "≡"; // Using the triple bar icon as the handle to drag
                boxContainer.appendChild(handle);

                new Sortable(receiptList, {
                    animation: 150, // ms, animation speed moving items when sorting, `0` — without animation
                    ghostClass: 'sortable-ghost', // Class name for the drop placeholder
                    dragClass: "sortable-drag", // Class name for the dragging item
                    handle: ".handle", // Restricts sort start click/touch to the specified element
                    onEnd: function (/**Event*/evt) {
                        // Event when sorting has stopped
                        // You can add additional logic here if needed
                    },
                });
            });
            reader.readAsDataURL(file);
        });
        this.value = ''; // Reset the input so the same file can be selected again
    });


    clearAllButton.addEventListener("click", function() {
        // Select all elements with the class 'media-box' and remove them
        document.querySelectorAll('.media-box').forEach(box => {
            box.remove();
        });

        // Reset any additional UI elements as necessary
        resetPreview();

        // Reset data structures
        Object.keys(croppers).forEach(function(imgSrc) {
            croppers[imgSrc].destroy(); // Properly dispose of Cropper instances
            delete croppers[imgSrc]; // Remove from the croppers object
        });
        originalImageSrcs = {}; // Reset original image sources
        croppedImageSrcs = {}; // Reset original image sources
        croppedImagesStatus = {}; // Reset cropped images status
        fileTypes = {}; // Reset file types
    });

    activateCropperButton.addEventListener("click", function() {
        const selectedImage = receiptList.querySelector(".selected-box img");
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
        const selectedImage = receiptList.querySelector(".selected-box img");
        if (selectedImage) {
            const imgSrc = selectedImage.src;
            if (croppers[imgSrc]) {
                const croppedCanvas = croppers[imgSrc].getCroppedCanvas();
                if (fileTypes[imgSrc] === 'image/jpg' || fileTypes[imgSrc] === 'image/jpeg') {
                    croppedImageSrcs[imgSrc] = croppedCanvas.toDataURL('image/jpeg');
                } else if (fileTypes[imgSrc] === 'image/png') {
                    croppedImageSrcs[imgSrc] = croppedCanvas.toDataURL('image/png');
                }
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
        const selectedImage = receiptList.querySelector(".selected-box img");
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
        let existingPdfBytes;
        // Load an existing PDF document
        var templetType = templetTypeOptions.value;
        if (templetType === 'Normal') {
            existingPdfBytes = await fetch('Kvittomallar/Kvittomall_Kronharpa.pdf').then(res => res.arrayBuffer());
        } else if (templetType === 'Tour') {
            existingPdfBytes = await fetch('Kvittomallar/Kvittomall_Tour.pdf').then(res => res.arrayBuffer());
        } else if (templetType === 'Lucia') {
            existingPdfBytes = await fetch('Kvittomallar/Kvittomall_Lucia.pdf').then(res => res.arrayBuffer());
        }
        console.log(templetType);
        
        let pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    
        // Insert text into the first page
        pdfDoc = insertTextIntoFirstPagePdf(pdfDoc);
    
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
        link.download = 'Kvittomall.pdf'; // Specify the download file name
        document.body.appendChild(link);
        link.click();

        // Cleanup: remove the link after triggering download
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    }


    // Assuming getTextBoxes() returns an array of text items to insert
    function insertTextIntoFirstPagePdf(pdfDoc) {

        const form = pdfDoc.getForm();
        
        // Get all form fields in the PDF
        const fields = form.getFields();
        
        // Log the names of all form fields
        fields.forEach(field => {
            console.log(field.getName());
        });
        
        let nameField;
        let informationField;
        let krField;
        let dateField;
        let bankNrField;
        let clearingNrField;
        let bankNameField;

        var templetType = templetTypeOptions.value;
        if (templetType === 'Tour') {
            nameField = form.getTextField('Text-zMjRHnxoar');
            informationField = form.getTextField('Paragraph-z_dFCtt9FN');
            krField = form.getTextField('Text-RMOtSe2Y51');
            dateField = form.getTextField('Date-PNMTD3qd9s');
            bankNrField = form.getTextField('Text-BggVTJak9r');
            clearingNrField = form.getTextField('Text-DoHnK7gsQx');
            bankNameField = form.getTextField('Text-_ijuoNCZ19');
        } else {
            nameField = form.getTextField('Text-C_2PedO18j');
            informationField = form.getTextField('Paragraph-i8tgL7KiTn');
            krField = form.getTextField('Text-6GJwepE8E4');
            dateField = form.getTextField('Date-bH-N30TgnM');
            bankNrField = form.getTextField('Text-RC50gjD5on');
            clearingNrField = form.getTextField('Text-b_Ra7NjZUq');
            bankNameField = form.getTextField('Text-w66Rc6XRfY');
        }

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
    
        const margin = 20; // This value can be adjusted as needed

        // console.log("getOrderFromReceiptList():", getOrderFromReceiptList()); // Debugging log
        for (const key of getOrderFromReceiptList()) {
            // Get the image source to add to the PDF (use cropped version if available)
            const imgSrc = croppedImageSrcs[key] ? croppedImageSrcs[key] : originalImageSrcs[key];

            console.log("Adding image to PDF:", imgSrc); // Debugging log
    
            console.log(fileTypes[key]); // Debugging log

            if (fileTypes[key] === 'image/jpg' || fileTypes[key] === 'image/jpeg') {
                const imageBytes = await fetch(imgSrc).then(res => res.arrayBuffer());
                const image = await pdfDoc.embedJpg(imageBytes);
                const page = pdfDoc.addPage();
                const { width, height } = page.getSize();
                const imgDims = image.scale(1); // Get original dimensions
                const aspectRatio = imgDims.width / imgDims.height;
                let imgWidth = width - (margin * 2);
                let imgHeight = imgWidth / aspectRatio;
                if (imgHeight > (height - (margin * 2))) {
                    imgHeight = height - (margin * 2);
                    imgWidth = imgHeight * aspectRatio;
                }
                page.drawImage(image, {
                    x: (width - imgWidth) / 2, // Center the image
                    y: (height - imgHeight) / 2,
                    width: imgWidth,
                    height: imgHeight,
                });
            } else if (fileTypes[key] === 'image/png') {
                const imageBytes = await fetch(imgSrc).then(res => res.arrayBuffer());
                const image = await pdfDoc.embedPng(imageBytes);
                const page = pdfDoc.addPage();
                const { width, height } = page.getSize();
                const imgDims = image.scale(1); // Get original dimensions
                const aspectRatio = imgDims.width / imgDims.height;
                let imgWidth = width - (margin * 2);
                let imgHeight = imgWidth / aspectRatio;
                if (imgHeight > (height - (margin * 2))) {
                    imgHeight = height - (margin * 2);
                    imgWidth = imgHeight * aspectRatio;
                }
                page.drawImage(image, {
                    x: (width - imgWidth) / 2, // Center the image
                    y: (height - imgHeight) / 2,
                    width: imgWidth,
                    height: imgHeight,
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
                console.error("Unsupported file type:", fileTypes[key]);
            }
        }

        return pdfDoc;
    }

});


// Function to get the order of items in receiptList
function getOrderFromReceiptList() {
    const receiptList = document.getElementById('receiptList'); // Assuming the ID of your list is 'receiptList'
    const order = [];

    // Iterate over each child of receiptList
    receiptList.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) { // Ensure it's an element node
            if (child.querySelector('.media-image')) {
                // If it's an image, get the src attribute
                const imgSrc = child.querySelector('img').src;
                order.push(imgSrc);
            } else if (child.querySelector('.media-pdf')) {
                // If it's a PDF, get the text content
                const pdfSrc = child.querySelector('.media-pdf').src;
                order.push(pdfSrc);
            }
        }
    });

    return order;
}
