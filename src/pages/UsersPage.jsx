import { useState, useEffect } from "react";
import { UserTable } from "../components/users/UserTable";
import { UsersToolbar } from "../components/users/UsersToolbar";
import { UserCard } from "../components/users/UserCard";
import { UserModal } from "../components/users/UserModal";
import Swal from "sweetalert2";
import { findAllUsers, findInactiveUsers, createUser, updateUser, deactivateUser, activateUser } from "../services/userService";
import { ModuleHeader } from "../components/common/ModuleHeader";

export const UsersPage = () => {

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [userSelected, setUserSelected] = useState({
        id: 0, username: '', role: '', password: '', imageUrl: ''
    });
    const [viewMode, setViewMode] = useState("cards");
    const [showInactive, setShowInactive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadUsers = async () => {
        const result = showInactive ? await findInactiveUsers() : await findAllUsers();
        if (result?.data) {
            setUsers(result.data);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [showInactive]);

    const filteredUsers = Array.isArray(users) ? users.filter(user => {
        const search = searchTerm.toLowerCase();
        return (
            user.username?.toLowerCase().includes(search) ||
            user.telefono?.toLowerCase().includes(search) ||
            user.role?.toLowerCase().includes(search)
        );
    }) : [];

    const handlerAddUser = async (user) => {
        if (user.id > 0) {
            await updateUser(user);
            Swal.fire({
                title: "Actualizado con éxito",
                text: `Usuario ${user.username} actualizado con éxito`,
                icon: "success"
            });
        } else {
            await createUser(user);
            Swal.fire({
                title: "Creado con éxito",
                text: `Usuario ${user.username} creado con éxito`,
                icon: "success"
            });
        }
        loadUsers();
    };

    const handlerUserSelected = (user) => {
        setUserSelected({ ...user });
        setIsModalOpen(true);
    };

    const handlerOpenModal = () => {
        setUserSelected({
            id: 0, username: '', role: '', password: '', imageUrl: ''
        });
        setIsModalOpen(true);
    };

    const handlerCloseModal = () => {
        setIsModalOpen(false);
        setUserSelected({
            id: 0, username: '', role: '', password: '', imageUrl: ''
        });
    };

    const handleDeactivate = async (id, reason) => {
        await deactivateUser(id, reason, currentUser.id);
        loadUsers();
    };

    const handleActivate = async (id) => {
        await activateUser(id);
        loadUsers();
    };

    return (
        <>
            <ModuleHeader title="Usuarios">
                <div className="col-12 col-lg-auto">
                    <button className="btn btn-primary w-100" onClick={handlerOpenModal}>
                        <i className="bi bi-plus-lg"></i> Agregar Nuevo Usuario
                    </button>
                </div>

                <div className="col-12 col-lg">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre de usuario, teléfono o rol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="col-12 col-lg-auto">
                    <UsersToolbar viewMode={viewMode} setViewMode={setViewMode} />
                </div>

                <div className="col-12 col-lg-auto">
                    <div className="btn-group">
                        <button
                            className={`btn btn-outline-secondary ${!showInactive ? "active" : ""}`}
                            onClick={() => setShowInactive(false)}
                        >
                            <i className="bi bi-eye me-1"></i>Activos
                        </button>
                        <button
                            className={`btn btn-outline-secondary ${showInactive ? "active" : ""}`}
                            onClick={() => setShowInactive(true)}
                        >
                            <i className="bi bi-eye-slash me-1"></i>Inactivos
                        </button>
                    </div>
                </div>
            </ModuleHeader>

            {viewMode === "table" ? (
                <UserTable
                    users={filteredUsers}
                    onEdit={handlerUserSelected}
                    onDeactivate={handleDeactivate}
                    onActivate={handleActivate}
                    showInactive={showInactive}
                />
            ) : (
                <div className="row">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onEdit={handlerUserSelected}
                                onDeactivate={handleDeactivate}
                                onActivate={handleActivate}
                            />
                        ))
                    ) : (
                        <p className="text-muted">No hay usuarios</p>
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
