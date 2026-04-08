import { useState, useEffect, useRef } from "react"
import Swal from "sweetalert2"
import { uploadFile } from "../../services/fileService"
import { addImage, getImages, deleteImage } from "../../services/productService"
import PropTypes from "prop-types"
import "./productDetailModal.css"


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
            // uploadFile retorna un objeto { url: "http://...", filename: "..."}
            // Necesitamos solo la propiedad url
            const result = await uploadFile(file)
            const imageUrl = result.url
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
    const handleDelete = async (imageId) => {
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

    if (!isOpen || !product) return null

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop fade show" onClick={onClose}
                style={{ zIndex: 1040 }}></div>

            {/* Modal */}
            <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">

                        {/* Header con gradiente */}
                        <div className="modal-header product-detail-header">
                            <h5 className="modal-title text-white">
                                <i className="bi bi-box-seam me-2"></i>
                                {product.name}
                            </h5>
                            <button type="button" className="btn-close btn-close-white"
                                onClick={onClose}></button>
                        </div>

                        <div className="modal-body">
                            <div className="row">
                                {/* Columna izquierda: Galeria de imagenes */}
                                <div className="col-12 col-md-6">
                                    {/* Imagen principal grande */}
                                    <div className="product-detail-main-image">
                                        <img
                                            src={selectedImage || "https://via.placeholder.com/400"}
                                            alt={product.name}
                                        />
                                    </div>

                                    {/* Miniaturas: al dar clic cambia la imagen grande */}
                                    <div className="product-detail-thumbnails">
                                        {allImages.map((img) => (
                                            <img
                                                key={img.id}
                                                src={img.imageUrl}
                                                alt="miniatura"
                                                className={`product-detail-thumb ${selectedImage === img.imageUrl ? "active" : ""}`}
                                                onClick={() => setSelectedImage(img.imageUrl)}
                                            />
                                        ))}

                                        {/* Boton para agregar imagenes */}
                                        <div
                                            className="product-detail-thumb product-detail-add-btn"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {uploading
                                                ? <div className="spinner-border spinner-border-sm"></div>
                                                : <i className="bi bi-plus-lg"></i>
                                            }
                                        </div>
                                    </div>

                                    {/* Input de archivo oculto - se activa con el boton de agregar */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="d-none"
                                        accept="image/*"
                                        onChange={handleUpload}
                                    />
                                </div>

                                {/* Columna derecha: Info del producto */}
                                <div className="col-12 col-md-6">
                                    <table className=" table table-sm mt-2">
                                        <tbody>
                                            <tr>
                                                <td className="text-muted fw-bold">Precio</td>
                                                <td className="text-success fw-bold fs-5">
                                                    ${product.price?.toLocaleString()}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted fw-bold">Stock</td>
                                                <td className="fw-bold">{product.stock} unidades</td>
                                            </tr>
                                            {product.color && (
                                                <tr>
                                                    <td className="text-muted fw-bold">Color</td>
                                                    <td >{product.color}</td>
                                                </tr>
                                            )}
                                            {product.description && (
                                                <tr>
                                                    <td className="text-muted fw-bold">Descripción</td>
                                                    <td >{product.description}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Boton de eliminar imagen seleccionada (solo si no es la principal) */}
                                    {selectedImage && selectedImage !== product.imageUrl && (
                                        <button
                                            className="btn btn-sm btn-outline-danger mt-2"
                                            onClick={() => {
                                                const img = galleryImages.find(i => i.imageUrl === selectedImage)
                                                if (img) handleDelete(img.id)
                                            }}
                                        >
                                            <i className="bi bi-trash me-1"></i>
                                            Eliminar esta imagen
                                        </button>
                                    )}

                                    <div className="text-muted small mt-3">
                                        <i className="bi bi-images me-1"></i>
                                        {allImages.length} {allImages.length === 1 ? "imagen" : "imagenes"} en total
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={onClose}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}

ProductDetailModal.propTypes = {
    product: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
}