import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const initialDataForm = {
    id: 0,
    workerId: "",
    amount: "",
    paymentDate: "",
    notes: "",
    registeredById: ""
}

export const WorkerPaymentForm = ({ handlerAdd, paymentSelected, formId = "worker-payment-form", users }) => {

    const [form, setForm] = useState(initialDataForm);
    const { workerId, amount, paymentDate, notes } = form;

    useEffect(() => {
        setForm({
            ...initialDataForm,
            ...paymentSelected,
            workerId: paymentSelected.workerId || "",
            paymentDate: paymentSelected.paymentDate || ""
        });
    }, [paymentSelected]);

    return (
        <form
            id={formId}
            onSubmit={(e) => {
                e.preventDefault();
                if (!workerId || !amount) {
                    alert("El trabajador y el monto son obligatorios");
                    return;
                }
                handlerAdd(form);
            }}
        >
            <div>
                <select
                    className="form-select my-3 w-100"
                    name="workerId"
                    value={workerId}
                    onChange={(e) => setForm({ ...form, workerId: e.target.value })}
                >
                    <option value="">Seleccionar trabajador...</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.username}
                        </option>
                    ))}
                </select>
            </div>

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
                    type="date"
                    className="form-control my-3 w-100"
                    placeholder="Fecha"
                    name="paymentDate"
                    value={paymentDate ? paymentDate.substring(0, 10) : ""}
                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                />
            </div>

            <div>
                <textarea
                    placeholder="Notas (opcional)"
                    className="form-control my-3 w-100"
                    name="notes"
                    rows="3"
                    value={notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
            </div>
        </form>
    );
}

WorkerPaymentForm.propTypes = {
    handlerAdd: PropTypes.func.isRequired,
    paymentSelected: PropTypes.object.isRequired,
    formId: PropTypes.string,
    users: PropTypes.array.isRequired
}
