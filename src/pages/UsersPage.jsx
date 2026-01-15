import { useState, useEffect } from "react";
import { UserTable } from "../components/users/UserTable";
import { UsersToolbar } from "../components/users/UsersToolbar";
import { UserCard } from "../components/users/UserCard";
import { UserModal } from "../components/users/UserModal";
import Swal from "sweetalert2";
import { createUser, findAllUsers, removeUser, updateUser } from "../services/userService";

export const UsersPage = () => {

    const [users, setUsers] = useState([])
    const [userSelected, setUserSelected] = useState({
        id: 0,
        username: '',
        role: '',
        password: '',
        imageUrl: '',
    })
    const [viewMode, setViewMode] = useState("table");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getUsers = async () => {
        const result = await findAllUsers()
        setUsers(result.data)
    }

    useEffect(() => {
        getUsers()
        findAllUsers().then(res => setUsers(res.data));
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
        setIsModalOpen(true)
    }

    const handlerOpenModal = () => {
        setUserSelected({
            id: 0,
            username: '',
            role: '',
            password: '',
            imageUrl: '',
        })
        setIsModalOpen(true)
    }

    const handlerCloseModal = () => {
        setIsModalOpen(false)
        setUserSelected({
            id: 0,
            username: '',
            role: '',
            password: '',
            imageUrl: '',
        })
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
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Usuarios</h2>
                <button
                    className="btn btn-primary"
                    onClick={handlerOpenModal}
                >
                    <i className="bi bi-plus-lg"></i> Agregar Usuario
                </button>
            </div>

            <UsersToolbar viewMode={viewMode} setViewMode={setViewMode} />

            {viewMode === "table" ? (
                <div className="row">
                    <div className="col-12">
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
            ) : (
                <div className="row">
                    {users.length > 0 ? (
                        users.map(user => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onEdit={handlerUserSelected}
                                onRemove={handlerRemoveUser}
                            />
                        ))
                    ) : (
                        <div className="col-12">
                            <div className="alert alert-warning">
                                No hay usuarios
                            </div>
                        </div>
                    )}
                </div>
            )}

            <UserModal
                isOpen={isModalOpen}
                onClose={handlerCloseModal}
                handlerAdd={handlerAddUser}
                userSelected={userSelected}
            />
        </>
    );
};
