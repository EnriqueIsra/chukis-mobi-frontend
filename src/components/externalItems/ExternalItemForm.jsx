import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const initialDataForm = {
  id: 0,
  rentalId: "",
  providerId: "",
  description: "",
  quantity: "",
  unitCost: "",
  notes: "",
};

export const ExternalItemForm = ({
  handlerAdd,
  itemSelected,
  formId = "external-item-form",
  providers,
}) => {
  const [form, setForm] = useState(initialDataForm);
  const { rentalId, providerId, description, quantity, unitCost, notes } = form;

  // totalCost calculado en tiempo real
  const totalCost =
    quantity && unitCost ? Number(quantity) * Number(unitCost) : 0;

  useEffect(() => {
    setForm({
      ...initialDataForm,
      ...itemSelected,
    });
  }, [itemSelected]);

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        if (!rentalId || !providerId || !description || !quantity || !unitCost) {
          alert(
            "Renta, proveedor, descripción, cantidad y costo unitario son obligatorios",
          );
          return;
        }
        handlerAdd(form);
      }}
    >
      {/* ID de la renta */}
      <div>
        <input
          placeholder="# Renta"
          type="number"
          className="form-control my-3 w-100"
          name="rentalId"
          value={rentalId}
          onChange={(event) =>
            setForm({ ...form, rentalId: event.target.value })
          }
        />
      </div>

      {/* Select de proveedores */}
      <div>
        <select
          className="form-select my-3 w-100"
          name="providerId"
          value={providerId}
          onChange={(event) =>
            setForm({ ...form, providerId: event.target.value })
          }
        >
          <option value="">Seleccionar proveedor...</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <input
          placeholder="Descricpión del producto (ej: Mesas redondas)"
          type="text"
          className="form-control my-3 w-100"
          name="description"
          value={description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
        />
      </div>

      <div className="row">
        <div className="col">
          <input
            placeholder="Cantidad"
            type="number"
            className="form-control my-3"
            name="quantity"
            value={quantity}
            onChange={(event) =>
              setForm({ ...form, quantity: event.target.value })
            }
          />
        </div>
        <div className="col">
          <input
            placeholder="Costo unitario"
            type="number"
            className="form-control my-3"
            name="unitCost"
            value={unitCost}
            onChange={(event) =>
              setForm({ ...form, unitCost: event.target.value })
            }
          />
        </div>
      </div>

      {/* Total calculado en tiemnpo real */}
      {totalCost > 0 && (
        <div className="alert alert-info py-2 mb-3">
          <strong>Total: ${totalCost.toLocaleString()}</strong>
          <span className="text-muted ms-2">
            ({quantity} x ${Number(unitCost).toLocaleString()})
          </span>
        </div>
      )}

      <div>
        <textarea
          placeholder="Notas (opcional)"
          className="form-control my-3 w-100"
          name="notes"
          rows="2"
          value={notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
        />
      </div>
    </form>
  );
};

ExternalItemForm.propTypes = {
  handlerAdd: PropTypes.func.isRequired,
  itemSelected: PropTypes.object.isRequired,
  formId: PropTypes.string,
  providers: PropTypes.array.isRequired
};
