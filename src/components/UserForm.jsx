import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const initialDataForm = {
    id: 0,
    username: '',
    role: '',
    password: '',
    imageUrl: ''
};

export const UserForm = ({ handlerAdd, userSelected }) => {

    const [form, setForm] = useState(initialDataForm)

    const { id, username, role, password, imageUrl } = form;

    useEffect(() => {
        setForm(userSelected)
    }, [userSelected])

    return <form
        onSubmit={(event) => {
            event.preventDefault();
            if (!username || !role || !password || !imageUrl) {
                alert('Debe completear los datos del formulario')
                return;
            }
            console.log(form);
            handlerAdd(form);
            setForm(initialDataForm);
        }}
    >
        <div>
            <input placeholder="Username"
                className="form-control my-3 w-75"
                name="username"
                value={username}
                onChange={(event) => setForm({ ...form, username: event.target.value })} />
        </div>

        <div>
            <select
                className="form-control my-3 w-75"
                name="role"
                value={role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
            >
                <option value="">-- Selecciona el rol --</option>
                <option value="ADMIN">ADMIN</option>
                <option value="CHAMBEADOR">CHAMBEADOR</option>
            </select>
        </div>

        <div>
            <input placeholder="Password"
                type="password"
                className="form-control my-3 w-75"
                name="password"
                value={password}
                onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </div>

        <div>
            <input placeholder="URL imagen"
                className="form-control my-3 w-75"
                name="imageUrl"
                value={imageUrl}
                onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
        </div>

        <div>
            <button className="btn btn-primary" type="submit">
                {id > 0 ? 'Update' : 'Create'}
            </button>
        </div>
    </form>
}

UserForm.propTypes = {
    handlerAdd: PropTypes.func.isRequired,
    userSelected: PropTypes.object.isRequired
}
