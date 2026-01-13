import { useState, useEffect } from "react";
import { UserForm } from "../components/users/UserForm";
import { UserTable } from "../components/users/UserTable";
import { createUser, findAllUsers, removeUser, updateUser } from "../services/userService";

export const UsersPage = () => {

    const [users, setUsers] = useState([])
    const [userSelected, setUserSelected] = useState({
        id: 0,
        username: '',
        role: '',
        password: '',
        image_url: '',
    })

    const getUsers = async () => {
        const result = await findAllUsers()
        setUsers(result.data)
    }

    useEffect(() => {
        getUsers()
    }, [])

    const handlerAddUser = async (user) => {
        if (user.id > 0) {
            const response = await updateUser(user)
            setUsers(
                users.map(u => {
                    if (u.id == user.id) {
                        return { ...response.data };
                    }
                    return u
                })
            )
            Swal.fire({
                title: "actualizado con éxito",
                text: `Usuario ${user.username} actualizado con éxito`,
                icon: "success"
            });
        } else {
            const response = await createUser(user);
            setUsers([...users, { ...response.data }]);
            Swal.fire({
                title: "Creado con éxito",
                text: `Usuario ${user.username} creado con éxito`,
                icon: "success"
            });
        }
    }

    const handlerUserSelected = (user) => {
        setUserSelected({ ...user })
        console.log(userSelected)
    }

    const handlerRemoveUser = (id) => {

        Swal.fire({
            title: "¿Está seguro de eliminar el usuario?",
            text: "Esta acción no se puede revertir",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "¡Continuar!",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                removeUser(id)
                setUsers(
                    users.filter(user => user.id != id)
                )
                Swal.fire({
                    title: "¡Eliminado!",
                    text: "El usuario ha sido eliminado con éxito",
                    icon: "success"
                });
            }
        });
    }

    return (
        <>
            <h2>Usuarios</h2>

            <div className="row">
                <div className="col-md-4">
                    <UserForm
                        handlerAdd={handlerAddUser}
                        userSelected={userSelected}
                    />
                </div>

                <div className="col-md-8">
                    {users.length > 0 ? (
                        <UserTable
                            users={users}
                            handlerUserSelected={handlerUserSelected}
                            handlerRemoveUser={handlerRemoveUser}
                        />
                    ) : (
                        <div className="alert alert-warning">
                            No hay usuarios
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
