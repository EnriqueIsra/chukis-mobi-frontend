import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const initialDataForm = {
    id: 0,
    name: "",
    phone: "",
    notes: ""
};

export const ProviderForm = ({ handlerAdd, providerSelected, formId = "provider-form" }) => {

    const [form, setForm] = useState(initialDataForm)
    const { name, phone, notes } = form;

    useEffect(() => {
        setForm({
            ...initialDataForm,
            ...providerSelected
        })
    }, [providerSelected])


    return (
        <form
            id={formId}
            onSubmit={(event) => {
                event.preventDefault();
                if (!name) {
                    alert('El nombre es obligatorio')
                    return;
                }
                handlerAdd(form);
                // No limpiar el formulario aquí, lo hará el modal al cerrar
            }}
        >
            <div>
                <input
                    placeholder="Nombre del proveedor"
                    type="text"
                    className="form-control my-3 w-100"
                    name="name"
                    value={name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>

            <div>
                <input
                    placeholder="Teléfono"
                    type="text"
                    className="form-control my-3 w-100"
                    name="phone"
                    value={phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </div>

            <div>
                <textarea
                    placeholder="Notas (opcional)"
                    className="form-control my-3 w-100"
                    name="notes"
                    rows="3"
                    value={notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </div>
        </form>
    )
}

ProviderForm.propTypes = {
    handlerAdd: PropTypes.func.isRequired,
    providerSelected: PropTypes.object.isRequired,
    formId: PropTypes.string
}
