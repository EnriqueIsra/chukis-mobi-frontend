import { useRef, useState, useEffect } from "react";
import { uploadFile } from "../../services/fileService"
import PropTypes from "prop-types"

const initalDataForm = {
    id: 0,
    amount: "",
    expenseDate: "",
    category: "",
    description: "",
    imageUrl: ""
}

// Mapeo de categorías del enum del backend a etiquetas legibles en español
const CATEGORY_OPTIONS = [
    { value: "GASOLINA", label: "Gasolina" },
    { value: "MANTENIMIENTO_VEHICULAR", label: "Mantenimiento Vehicular" },
    { value: "LIMPIEZA_MANTENIMIENTO_MOBILIARIO", label: "Limpieza y Mantenimiento de Mobiliario" },
    { value: "INVERSION_INVENTARIO", label: "Inversión en Inventario" },
    { value: "OTROS", label: "Otros" },
]

export const ExpenseForm = ({ handlerAdd, expenseSelected, formId = "expense-form" }) => {

    const [form, setForm] = useState(initalDataForm);
    const { id, amount, expenseDate, category, description, imageUrl } = form;
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);


    useEffect(() => {
        setForm({
            ...initalDataForm,
            ...expenseSelected,
            imageUrl: expenseSelected.imageUrl || ""
        })
        setImagePreview(expenseSelected.imageUrl || null)
    }, [expenseSelected])


    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Por favor selecciona un archivo de imagen valido");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)

        setIsUploading(true);
        try {
            const response = await uploadFile(file);
            setForm({ ...form, imageUrl: response.url })
        } catch (error) {
            alert("Error al subir la imagen")
            console.error(error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <form
            id={formId}
            onSubmit={(event) => {
                event.preventDefault();
                if (!amount || !category) {
                    alert("El monto y la categoría son obligatorios")
                    return
                }
                handlerAdd(form);
            }}
        >
            <div>
                <input
                    placeholder="Monto"
                    type="number"
                    className="form-control my-3 w-100"
                    name="amount"
                    value={amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
            </div>

            <div>
                <input
                    type="datetime-local"
                    className="form-control my-3 w-100"
                    name="expenseDate"
                    value={expenseDate}
                    onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                />
            </div>

            {/* Select para categorías - renderiza las opciones del array CATEGORY_OPTIONS */}
            <div>
                <select
                    className="form-select mt-3 w-100"
                    name="category"
                    value={category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                    <option value="">Seleccionar categoría...</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <textarea
                    placeholder="Descripción (opcional)"
                    className="form-control my-3 w-100"
                    name="description"
                    rows="3"
                    value={description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
            </div>

            {/* Sección de la imagen - mismo patrón que ProductForm */}
            <div className="my-3">
                <label className="form-label fw-bold">Comprobante (opcional)</label>

                {imagePreview && (
                    <div className="mb-3 text-center">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                                maxWidth: "200px",
                                maxHeight: "200px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "2px solid #dee2e6"
                            }}
                        />
                    </div>
                )}

                <div className="mb-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                    />
                    <button
                        type="button"
                        className="btn btn-outline-primary w-100"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-upload me-2"></i>
                                Subir foto del comprobante
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}

ExpenseForm.propTypes = {
    handlerAdd: PropTypes.func.isRequired,
    expenseSelected: PropTypes.object.isRequired,
    formId: PropTypes.string,
}