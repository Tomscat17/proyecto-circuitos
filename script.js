// Espera a que todo el contenido del HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {

    /* --- CÓDIGO PARA EL MENÚ LATERAL --- */
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const sideMenu = document.getElementById('side-menu');
    const pageOverlay = document.getElementById('page-overlay');
    const body = document.body;

    const openMenu = () => body.classList.add('menu-open');
    const closeMenu = () => body.classList.remove('menu-open');

    if (menuToggle) menuToggle.addEventListener('click', openMenu);
    if (menuClose) menuClose.addEventListener('click', closeMenu);
    if (pageOverlay) pageOverlay.addEventListener('click', closeMenu);

    
    /* --- CÓDIGO PARA LAS RESEÑAS (Página circuito.html) --- */
    const reviewForm = document.getElementById('review-form');
    const reviewsList = document.getElementById('reviews-list');

    // Solo ejecuta este código si estamos en la página del circuito
    if (reviewForm && reviewsList) {
        
        const reviewerNameInput = document.getElementById('reviewer-name');
        const reviewTextInput = document.getElementById('review-text');

        reviewForm.addEventListener('submit', (event) => {
            event.preventDefault(); 
            const name = reviewerNameInput.value.trim();
            const reviewText = reviewTextInput.value.trim();
            const ratingInput = document.querySelector('input[name="rating"]:checked');
            
            if (!name || !reviewText || !ratingInput) {
                alert('Por favor, completa todos los campos (nombre, reseña y valoración).');
                return;
            }

            const ratingValue = parseInt(ratingInput.value);
            const reviewCard = document.createElement('article');
            reviewCard.className = 'review-card'; 
            const reviewHeader = document.createElement('strong');
            const stars = '★'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);
            reviewHeader.textContent = `${name} (${stars})`;
            const reviewParagraph = document.createElement('p');
            reviewParagraph.textContent = reviewText;
            reviewCard.appendChild(reviewHeader);
            reviewCard.appendChild(reviewParagraph);
            reviewsList.insertAdjacentElement('afterbegin', reviewCard);
            reviewForm.reset();
        });
    } // Fin del código de reseñas


    /* --- NUEVO CÓDIGO PARA LA GALERÍA (Página galeria.html) --- */
    const uploadForm = document.getElementById('upload-form');
    
    // Solo ejecuta este código si estamos en la página de la galería
    if (uploadForm) {
        
        const fileInput = document.getElementById('photo-file');
        const descriptionInput = document.getElementById('photo-description');
        const galleryGrid = document.getElementById('gallery-grid');
        const fileNameDisplay = document.getElementById('file-name');

        // 1. Muestra el nombre del archivo cuando el usuario selecciona uno
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileNameDisplay.textContent = fileInput.files[0].name;
            } else {
                fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            }
        });

        // 2. Maneja el envío del formulario
        uploadForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita que la página se recargue

            const file = fileInput.files[0];
            const description = descriptionInput.value.trim();

            // Validaciones
            if (!file || !description) {
                alert('Por favor, selecciona una foto y añade una descripción.');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('El archivo seleccionado no es una imagen.');
                return;
            }

            // FileReader: Lee el archivo local para mostrarlo
            const reader = new FileReader();
            
            // 3. Cuando el archivo se ha leído...
            reader.onload = (e) => {
                // e.target.result contiene la imagen como datos (Base64)
                const imageUrl = e.target.result;

                // 4. Crea la nueva tarjeta para la galería
                const galleryItem = document.createElement('article');
                galleryItem.className = 'gallery-item';

                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = description;

                const desc = document.createElement('p');
                desc.textContent = description;

                // 5. Arma la tarjeta y la añade a la cuadrícula
                galleryItem.appendChild(img);
                galleryItem.appendChild(desc);
                galleryGrid.prepend(galleryItem); // 'prepend' la añade al principio

                // 6. Limpia el formulario
                uploadForm.reset();
                fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            };

            // 7. Inicia la lectura del archivo
            reader.readAsDataURL(file);
        });

    } // Fin del código de galería

});