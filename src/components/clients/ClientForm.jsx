import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const initialDataForm = {
  id: 0,
  nombre: '',
  telefono: '',
  direccion: '',
  email: ''
};

export const ClientForm = ({ handlerAdd, clientSelected, formId = "client-form" }) => {

  const [form, setForm] = useState(initialDataForm)
  const { id, nombre, telefono, direccion, email } = form;
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      ...initialDataForm,
      ...clientSelected,
      telefono: clientSelected.telefono || '',
      email: clientSelected.email || '',
      direccion: clientSelected.direccion || ''
    })
  }, [clientSelected])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateTelefono = (telefono) => {
    const telefonoRegex = /^\d{10}$/;
    return telefonoRegex.test(telefono);
  };

  const handleTelefonoChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 10) {
      setForm({ ...form, telefono: value });
      if (value.length === 10) {
        setErrors({ ...errors, telefono: null });
      } else if (value.length > 0) {
        setErrors({ ...errors, telefono: 'El teléfono debe tener exactamente 10 dígitos' });
      }
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, email: value });
    if (value && !validateEmail(value)) {
      setErrors({ ...errors, email: 'Email inválido' });
    } else {
      setErrors({ ...errors, email: null });
    }
  };

  return <form
    id={formId}
    onSubmit={(event) => {
      event.preventDefault();

      // Validaciones
      const newErrors = {};

      if (!nombre) newErrors.nombre = 'El nombre es requerido';
      if (!telefono) {
        newErrors.telefono = 'El teléfono es requerido';
      } else if (!validateTelefono(telefono)) {
        newErrors.telefono = 'El teléfono debe tener exactamente 10 dígitos';
      }
      if (!direccion) newErrors.direccion = 'La dirección es requerida';
      if (!email) {
        newErrors.email = 'El email es requerido';
      } else if (!validateEmail(email)) {
        newErrors.email = 'Email inválido';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      console.log('Form data being submitted:', form);
      handlerAdd(form);
      setErrors({});
    }}
  >
    <div>
      <input
        placeholder="Nombre completo"
        className={`form-control my-3 w-100 ${errors.nombre ? 'is-invalid' : ''}`}
        name="nombre"
        value={nombre}
        onChange={(event) => {
          setForm({ ...form, nombre: event.target.value });
          if (errors.nombre) setErrors({ ...errors, nombre: null });
        }}
      />
      {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre}</div>}
    </div>

    <div>
      <input
        placeholder="Teléfono (10 dígitos)"
        type="tel"
        className={`form-control my-3 w-100 ${errors.telefono ? 'is-invalid' : ''}`}
        name="telefono"
        value={telefono}
        onChange={handleTelefonoChange}
        maxLength="10"
      />
      {errors.telefono && <div className="invalid-feedback d-block">{errors.telefono}</div>}
      {telefono && <small className="text-muted">{telefono.length}/10 dígitos</small>}
    </div>

    <div>
      <input
        placeholder="Dirección"
        className={`form-control my-3 w-100 ${errors.direccion ? 'is-invalid' : ''}`}
        name="direccion"
        value={direccion}
        onChange={(event) => {
          setForm({ ...form, direccion: event.target.value });
          if (errors.direccion) setErrors({ ...errors, direccion: null });
        }}
      />
      {errors.direccion && <div className="invalid-feedback d-block">{errors.direccion}</div>}
    </div>

    <div>
      <input
        placeholder="Email"
        type="email"
        className={`form-control my-3 w-100 ${errors.email ? 'is-invalid' : ''}`}
        name="email"
        value={email}
        onChange={handleEmailChange}
      />
      {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
    </div>
  </form>
}

ClientForm.propTypes = {
  handlerAdd: PropTypes.func.isRequired,
  clientSelected: PropTypes.object.isRequired,
  formId: PropTypes.string
}
