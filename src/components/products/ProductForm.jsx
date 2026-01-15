import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { uploadFile } from "../../services/fileService";

const initialDataForm = {
  id: 0,
  name: '',
  description: '',
  price: '',
  color: '',
  stock: '',
  imageUrl: ''
};

export const ProductForm = ({ handlerAdd, productSelected, formId = "product-form" }) => {

  const [form, setForm] = useState(initialDataForm)
  const { id, name, description, price, color, stock, imageUrl } = form;
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm({
      ...initialDataForm,
      ...productSelected,
      imageUrl: productSelected.imageUrl || ''
    })
    setImagePreview(productSelected.imageUrl || null)
  }, [productSelected])

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload al servidor
    setIsUploading(true);
    try {
      const response = await uploadFile(file);
      setForm({ ...form, imageUrl: response.url });
    } catch (error) {
      alert('Error al subir la imagen');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url) => {
    const updatedForm = { ...form, imageUrl: url };
    setForm(updatedForm);
    setImagePreview(url || null);
  };

  return <form
    id={formId}
    onSubmit={(event) => {
      event.preventDefault();
      if (!name || !description || !price || !color || !stock) {
        alert('Debe completear los datos del formulario')
        return;
      }
      console.log('Form data being submitted:', form);
      handlerAdd(form);
      // No limpiar el formulario aquí, lo hará el modal al cerrar
    }}
  >
    <div>
      <input
        placeholder="Nombre"
        className="form-control my-3 w-100"
        name="name"
        value={name}
        onChange={(event) => setForm({ ...form, name: event.target.value })} />
    </div>

    <div>
      <input
        placeholder="Descripción"
        className="form-control my-3 w-100"
        name="description"
        value={description}
        onChange={(event) => setForm({ ...form, description: event.target.value })} />
    </div>

    <div>
      <input
        placeholder="Color"
        className="form-control my-3 w-100"
        name="color"
        value={color}
        onChange={(event) => setForm({ ...form, color: event.target.value })} />
    </div>

    <div>
      <input
        placeholder="Stock"
        type="number"
        className="form-control my-3 w-100"
        name="stock"
        value={stock}
        onChange={(event) => setForm({ ...form, stock: event.target.value })} />
    </div>

    <div>
      <input
        placeholder="Precio"
        type="number"
        className="form-control my-3 w-100"
        name="price"
        value={price}
        onChange={(event) => setForm({ ...form, price: event.target.value })} />
    </div>

    {/* Image Section */}
    <div className="my-3">
      <label className="form-label fw-bold">Imagen del producto</label>

      {/* Preview de la imagen */}
      {imagePreview && (
        <div className="mb-3 text-center">
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '2px solid #dee2e6'
            }}
          />
        </div>
      )}

      {/* Opción 1: Subir archivo */}
      <div className="mb-3">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="btn btn-outline-primary w-100"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Subiendo...
            </>
          ) : (
            <>
              <i className="bi bi-upload me-2"></i>
              Subir imagen desde dispositivo
            </>
          )}
        </button>
      </div>

      {/* Separador */}
      <div className="text-center text-muted mb-3">
        <small>o</small>
      </div>

      {/* Opción 2: URL */}
      <div>
        <input
          type="text"
          placeholder="URL de la imagen"
          className="form-control w-100"
          name="imageUrl"
          value={imageUrl}
          onChange={(event) => handleUrlChange(event.target.value)}
        />
      </div>
    </div>
  </form>
}

ProductForm.propTypes = {
  handlerAdd: PropTypes.func.isRequired,
  productSelected: PropTypes.object.isRequired,
  formId: PropTypes.string
}
