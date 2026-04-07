import Swal from "sweetalert2"
import { uploadFile } from "../../services/fileService"
import { addImage, getImages } from "../../services/productService"


export const ProductDetailModal = ({ product, isOpen, onClose }) => {
    // Imagen que se muestra en grande en la galería
    const [selectedImage, setSelectedImage] = useState(null)
    // Lista de imágenes adicionales del producto (de la tabla product_images)
    const [galleryImages, setGalleryImages] = useState([])
    // Estado de carga mientras se sube la imagen
    const [uploading, setUploading] = useState(false)
    // Referencia al input de archivo oculto (se activa al dar clic en "Agregar imagen")
    const fileInputRef = useRef(null)

    // Cada vez que se abre el modal o cambia el producto, cargamos las imágenes
    useEffect(() => {
      if (isOpen && product?.id) {
        loadImages();
        // La imagen principal del producto es la seleccionada por defecto
        setSelectedImage(product.imageUrl)
      }
    }, [isOpen, product?.id])

    // Carga las imágenes adicionales desde el backend
    const loadImages = async () => {
        const res = await getImages(product.id)
        if (res) {
            setGalleryImages(res.data)
        }
    }

    // Construye el array completo de imagenes: la principal + las de la galería
    // Esto nos permite navegar entre todas con las miniaturas
    const allImages = [
        // La imagen principal del producto (si tiene)
        ...(product?.imageUrl ? [{ id: "main", imageUrl: product.imageUrl }] : []),
        // Las imagenes adicionales de la galería
        ...galleryImages
    ]

    // Maneja la subida de una nueva imagen:
    // 1.- Sube el archivo al servidor con uploadFile (retorna la URL)
    // 2.- Registra esa URL en la galería del producto con addImage
    // 3.- Recarga la galería
    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        try {
            // Paso 1: subir archivo al servidor
            const imageUrl = await uploadFile(file)
            // Paso 2: registrar en la galería del producto
            await addImage(product.id, imageUrl)
            // Paso 3: recargar la galería y seleccionar la nueva imagen
            await loadImages()
            setSelectedImage(imageUrl)
        } catch (error) {
            Swal.fire("Error", "No se pudo subir la imagen", "error")
        } finally {
            setUploading(false)
            // Limpiar el input para poder subir el mismo archivo otra vez si quiere
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    // Eliminar una imagen de la galería (NO la principal, esa se edita desde el form)
    const handleDelete = async (imageUrl) => {
        const result = await Swal.fire({
            title: "¿Eliminar imagen?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33"
        })
        if (result.isConfirmed) {
            await deleteImage(imageId)
            await loadImages()
            // Si la imagen eliminada era la que se estaba viendo, volver a la principal
            setSelectedImage(product.imageUrl)
        }
    }

    // continuar aqui
    
}