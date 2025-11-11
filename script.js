// Espera a que todo el contenido del HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {

    /* --- INICIO: CONFIGURACIÓN DE SUPABASE --- */
    
    // 1. PEGA AQUÍ TUS "LLAVES" de Supabase
    // (Ve a Settings > API en tu proyecto de Supabase)
    const SUPABASE_URL = 'https://oipynyyqkvavbhlisbxz.supabase.co'; // Pega tu URL aquí
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pcHlueXlxa3ZhdmJobGlzYnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTMwOTAsImV4cCI6MjA3ODM4OTA5MH0.2OqUIB22ijFvehVXvHDd25FoQ23YvRw4tjz3mIZqqMY'; // Pega tu llave 'anon' 'public' aquí

    // 2. Inicializar el cliente de Supabase
    let supabase;
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (error) {
        console.error("Error al inicializar Supabase: ", error);
        alert("Error de conexión con el backend. Revisa la consola (F12) para más detalles.");
    }

    /* --- FIN: CONFIGURACIÓN DE SUPABASE --- */


    /* --- CÓDIGO PARA EL MENÚ LATERAL (Sin cambios) --- */
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

    
    /* --- CÓDIGO PARA LA GALERÍA/MONITOREO (RE-ESCRITO PARA SUPABASE) --- */
    const uploadForm = document.getElementById('upload-form');
    
    // Solo ejecuta este código si estamos en la página de la galería Y si Supabase se conectó
    if (uploadForm && supabase) {
        
        const fileInput = document.getElementById('photo-file');
        const descriptionInput = document.getElementById('photo-description');
        const galleryGrid = document.getElementById('gallery-grid');
        const fileNameDisplay = document.getElementById('file-name');
        const submitButton = document.getElementById('submit-button');
        const uploadStatus = document.getElementById('upload-status');

        // 1. Muestra el nombre del archivo (Sin cambios)
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileNameDisplay.textContent = fileInput.files[0].name;
            } else {
                fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            }
        });

        // 2. Maneja el envío del formulario (Ahora sube a Supabase)
        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            const file = fileInput.files[0];
            const description = descriptionInput.value.trim();

            if (!file || !description) {
                alert('Por favor, selecciona una foto y añade una descripción.');
                return;
            }

            // Deshabilitar botón y mostrar estado
            submitButton.disabled = true;
            submitButton.textContent = 'Subiendo...';
            uploadStatus.textContent = 'Cargando imagen...';

            // Crear un nombre único para el archivo
            const fileName = `${Date.now()}-${file.name}`;
            
            try {
                // 1. Subir la imagen a Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('monitoreos') // Nombre de tu bucket
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    throw uploadError; // Lanza el error para ser atrapado por el catch
                }

                // 2. Obtener la URL pública de la imagen subida
                uploadStatus.textContent = '¡Imagen subida! Obteniendo URL...';
                const { data: urlData } = supabase.storage
                    .from('monitoreos')
                    .getPublicUrl(fileName);
                
                const publicURL = urlData.publicUrl;

                // 3. Guardar la URL y la descripción en la Base de Datos
                uploadStatus.textContent = 'Guardando descripción...';
                const { error: insertError } = await supabase
                    .from('monitoreos') // Nombre de tu tabla
                    .insert({ 
                        description: description, 
                        image_url: publicURL 
                    });

                if (insertError) {
                    throw insertError;
                }

                // ¡Todo listo!
                uploadStatus.textContent = "¡Monitoreo subido con éxito!";
                uploadForm.reset();
                fileNameDisplay.textContent = 'Ningún archivo seleccionado';
                
                setTimeout(() => { uploadStatus.textContent = ''; }, 3000);

            } catch (error) {
                console.error("Error al subir el monitoreo:", error);
                uploadStatus.textContent = `Error: ${error.message}`;
            } finally {
                // Vuelve a habilitar el botón pase lo que pase
                submitButton.disabled = false;
                submitButton.textContent = 'Subir a Monitoreo';
            }
        });


        // 3. LEER DATOS DE SUPABASE (Función para mostrar)
        const displayMonitoreos = async () => {
            const { data, error } = await supabase
                .from('monitoreos')
                .select('*')
                .order('created_at', { ascending: false }); // Más nuevos primero

            if (error) {
                console.error("Error al cargar monitoreos:", error);
                galleryGrid.innerHTML = '<p style="color: red;">Error al cargar monitoreos.</p>';
                return;
            }

            galleryGrid.innerHTML = ''; // Limpia la galería

            if (data.length === 0) {
                galleryGrid.innerHTML = '<p style="color: #555; grid-column: 1 / -1;">Aún no hay monitoreos. ¡Sé el primero en subir uno!</p>';
                return;
            }
            
            // Crea las tarjetas por cada foto en la base de datos
            data.forEach((monitoreo) => {
                const galleryItem = document.createElement('article');
                galleryItem.className = 'gallery-item';

                const img = document.createElement('img');
                img.src = monitoreo.image_url;
                img.alt = monitoreo.description;

                const desc = document.createElement('p');
                desc.textContent = monitoreo.description;

                galleryItem.appendChild(img);
                galleryItem.appendChild(desc);
                galleryGrid.appendChild(galleryItem);
            });
            
            // Re-activa los listeners para el lightbox
            addLightboxListeners();
        };

        // 4. ACTIVAR "REALTIME" (La magia)
        // Escucha por CUALQUIER inserción nueva en la tabla 'monitoreos'
        supabase
            .channel('public:monitoreos')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'monitoreos' }, 
                () => {
                    // Cuando llega un nuevo monitoreo, simplemente volvemos a cargar toda la galería
                    displayMonitoreos(); 
                }
            )
            .subscribe();

        // 5. Cargar los monitoreos iniciales al abrir la página
        displayMonitoreos();


        /* --- CÓDIGO: LIGHTBOX/VISOR DE IMAGENES (Casi sin cambios) --- */
        const lightboxOverlay = document.getElementById('lightbox-overlay');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxDescription = document.getElementById('lightbox-description');
        const lightboxClose = document.getElementById('lightbox-close');

        function openLightbox(imageUrl, description) {
            lightboxImage.src = imageUrl;
            lightboxDescription.textContent = description;
            lightboxOverlay.classList.add('visible');
            body.style.overflow = 'hidden'; 
        }

        function closeLightbox() {
            lightboxOverlay.classList.remove('visible');
            body.style.overflow = ''; 
            lightboxImage.src = ''; 
            lightboxDescription.textContent = ''; 
        }

        // Esta función ahora la llamamos después de que Supabase carga las fotos
        function addLightboxListeners() {
            document.querySelectorAll('.gallery-item img').forEach(img => {
                // Limpiamos listeners viejos por si acaso
                img.replaceWith(img.cloneNode(true));
            });
            
            // Añadimos los nuevos listeners
            document.querySelectorAll('.gallery-item img').forEach(img => {
                img.addEventListener('click', (event) => {
                    const clickedImg = event.target;
                    const imageUrl = clickedImg.src;
                    const description = clickedImg.nextElementSibling ? clickedImg.nextElementSibling.textContent : '';
                    openLightbox(imageUrl, description);
                });
            });
        }

        // Cerrar lightbox
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxOverlay) lightboxOverlay.addEventListener('click', (event) => {
            if (event.target === lightboxOverlay) closeLightbox();
        });

    } // Fin del código de galería


    /* --- CÓDIGO: BOTÓN DEL AVE Y MODAL DE HISTORIA (Sin cambios) --- */
    const birdButton = document.getElementById('bird-button');
    const storyModal = document.getElementById('story-modal');
    const closeStoryButton = document.querySelector('.close-story');

    function openStoryModal() {
        if (storyModal) storyModal.classList.remove('hidden');
    }

    function closeStoryModal() {
        if (storyModal) storyModal.classList.add('hidden');
    }

    if (birdButton) birdButton.addEventListener('click', openStoryModal);
    if (closeStoryButton) closeStoryButton.addEventListener('click', closeStoryModal);
    if (storyModal) storyModal.addEventListener('click', (event) => {
        if (event.target === storyModal) closeStoryModal();
    });


    /* --- CÓDIGO: FORMULARIO DE CONTACTO (Sin cambios) --- */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            alert('Formulario enviado (simulación). Reemplaza el "action" para un servicio real.');
            
            // Para ver los datos en la consola:
            const formData = new FormData(contactForm);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
        });
    }

    /* --- CÓDIGO: MANEJO TECLA ESCAPE (Combinado) --- */
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            // Cierra el Lightbox si está visible
            if (document.getElementById('lightbox-overlay') && document.getElementById('lightbox-overlay').classList.contains('visible')) {
                closeLightbox(); 
            } 
            // Cierra el Modal de Historia si está visible
            else if (storyModal && !storyModal.classList.contains('hidden')) {
                closeStoryModal();
            }
        }
    });

});