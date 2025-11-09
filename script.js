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

    
    /* --- CÓDIGO PARA LA GALERÍA/MONITOREO (Página galeria.html) --- */
    const uploadForm = document.getElementById('upload-form');
    
    // Solo ejecuta este código si estamos en la página de la galería
    if (uploadForm) {
        
        const fileInput = document.getElementById('photo-file');
        const descriptionInput = document.getElementById('photo-description');
        const galleryGrid = document.getElementById('gallery-grid');
        const fileNameDisplay = document.getElementById('file-name');

        // 1. Muestra el nombre del archivo
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileNameDisplay.textContent = fileInput.files[0].name;
            } else {
                fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            }
        });

        // 2. Maneja el envío del formulario
        uploadForm.addEventListener('submit', (event) => {
            event.preventDefault(); 

            const file = fileInput.files[0];
            const description = descriptionInput.value.trim();

            if (!file || !description) {
                alert('Por favor, selecciona una foto y añade una descripción.');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('El archivo seleccionado no es una imagen.');
                return;
            }

            const reader = new FileReader();
            
            // 3. Cuando el archivo se ha leído
            reader.onload = (e) => {
                const imageUrl = e.target.result;

                // 4. Crea la nueva tarjeta
                const galleryItem = document.createElement('article');
                galleryItem.className = 'gallery-item';

                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = description;

                const desc = document.createElement('p');
                desc.textContent = description;

                // 5. Arma la tarjeta y la añade
                galleryItem.appendChild(img);
                galleryItem.appendChild(desc);
                galleryGrid.prepend(galleryItem); 

                // 6. Limpia el formulario
                uploadForm.reset();
                fileNameDisplay.textContent = 'Ningún archivo seleccionado';

                // IMPORTANTE: Después de añadir una nueva imagen, 
                // re-agrega los listeners para el lightbox
                addLightboxListeners();
            };

            // 7. Inicia la lectura del archivo
            reader.readAsDataURL(file);
        });


        /* --- CÓDIGO: LIGHTBOX/VISOR DE IMAGENES --- */
        const lightboxOverlay = document.getElementById('lightbox-overlay');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxDescription = document.getElementById('lightbox-description');
        const lightboxClose = document.getElementById('lightbox-close');

        // Función para abrir el lightbox
        function openLightbox(imageUrl, description) {
            lightboxImage.src = imageUrl;
            lightboxDescription.textContent = description;
            lightboxOverlay.classList.add('visible');
            body.style.overflow = 'hidden'; // Evita scroll en el fondo
        }

        // Función para cerrar el lightbox
        function closeLightbox() {
            lightboxOverlay.classList.remove('visible');
            body.style.overflow = ''; // Restaura el scroll
            lightboxImage.src = ''; // Limpia la imagen
            lightboxDescription.textContent = ''; // Limpia la descripción
        }

        // Añade event listeners a todas las imágenes existentes y nuevas
        function addLightboxListeners() {
            document.querySelectorAll('.gallery-item img').forEach(img => {
                img.removeEventListener('click', handleImageClick); // Evita duplicados
                img.addEventListener('click', handleImageClick);
            });
        }

        function handleImageClick(event) {
            const clickedImg = event.target;
            const imageUrl = clickedImg.src;
            // La descripción está en el párrafo siguiente al <img>, dentro del mismo .gallery-item
            const description = clickedImg.nextElementSibling ? clickedImg.nextElementSibling.textContent : '';
            openLightbox(imageUrl, description);
        }

        // Cerrar lightbox al hacer clic en el botón de cierre
        lightboxClose.addEventListener('click', closeLightbox);

        // Cerrar lightbox al hacer clic fuera de la imagen (en el overlay)
        lightboxOverlay.addEventListener('click', (event) => {
            // Solo cierra si el clic no fue directamente en la imagen
            if (event.target === lightboxOverlay) {
                closeLightbox();
            }
        });

        // Cerrar lightbox al presionar la tecla 'Escape'
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && lightboxOverlay.classList.contains('visible')) {
                closeLightbox();
            }
        });

        // Inicializa los listeners para las imágenes ya existentes al cargar la página
        addLightboxListeners();

    } // Fin del código de galería


    /* --- NUEVO CÓDIGO: BOTÓN DEL AVE Y MODAL DE HISTORIA --- */

    // Este código se ejecuta en todas las páginas (index, circuito, galeria)
    const birdButton = document.getElementById('bird-button');
    const storyModal = document.getElementById('story-modal');
    const closeStoryButton = document.querySelector('.close-story');

    // Función para abrir el modal de historia
    function openStoryModal() {
        if (storyModal) {
            storyModal.classList.remove('hidden');
        }
    }

    // Función para cerrar el modal de historia
    function closeStoryModal() {
        if (storyModal) {
            storyModal.classList.add('hidden');
        }
    }

    // Abrir al hacer clic en el ave
    if (birdButton) {
        birdButton.addEventListener('click', openStoryModal);
    }

    // Cerrar al hacer clic en la 'X'
    if (closeStoryButton) {
        closeStoryButton.addEventListener('click', closeStoryModal);
    }

    // Cerrar al hacer clic en el fondo (fuera del cuadro de texto)
    if (storyModal) {
        storyModal.addEventListener('click', (event) => {
            if (event.target === storyModal) {
                closeStoryModal();
            }
        });
    }

    // Cerrar al presionar la tecla 'Escape'
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !storyModal.classList.contains('hidden')) {
            // Cierra el modal de historia si el lightbox no está abierto
            if (document.getElementById('lightbox-overlay') && !document.getElementById('lightbox-overlay').classList.contains('visible')) {
                closeStoryModal();
            } else if (!document.getElementById('lightbox-overlay')) {
                // Si no existe el lightbox (ej. en index.html)
                closeStoryModal();
            }
        }
    });

});