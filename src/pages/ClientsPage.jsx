import { useState, useEffect } from "react";
import { ClientTable } from "../components/clients/ClientTable";
import { ClientsToolbar } from "../components/clients/ClientsToolbar";
import { ClientCard } from "../components/clients/ClientCard";
import { ClientModal } from "../components/clients/ClientModal";
import Swal from "sweetalert2";
import { findAll, findInactive, create, update, deactivate, activate } from "../services/clientService";
import { ModuleHeader } from "../components/common/ModuleHeader";

export const ClientsPage = () => {

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [clientSelected, setClientSelected] = useState({
        id: 0, nombre: '', telefono: '', direccion: '', email: ''
    });
    const [viewMode, setViewMode] = useState("cards");
    const [showInactive, setShowInactive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadClients = async () => {
        const result = showInactive ? await findInactive() : await findAll();
        if (result && result.data) {
            setClients(result.data);
        }
    };

    useEffect(() => {
        loadClients();
    }, [showInactive]);

    const filteredClients = Array.isArray(clients) ? clients.filter(client => {
        const search = searchTerm.toLowerCase();
        return (
            client.nombre?.toLowerCase().includes(search) ||
            client.telefono?.toLowerCase().includes(search) ||
            client.direccion?.toLowerCase().includes(search) ||
            client.email?.toLowerCase().includes(search)
        );
    }) : [];

    const handlerAddClient = async (client) => {
        if (client.id > 0) {
            await update(client);
            Swal.fire({
                title: "Actualizado con éxito",
                text: `Cliente ${client.nombre} actualizado con éxito`,
                icon: "success"
            });
        } else {
            await create(client);
            Swal.fire({
                title: "Creado con éxito",
                text: `Cliente ${client.nombre} creado con éxito`,
                icon: "success"
            });
        }
        loadClients();
    };

    const handlerClientSelected = (client) => {
        setClientSelected({ ...client });
        setIsModalOpen(true);
    };

    const handlerOpenModal = () => {
        setClientSelected({
            id: 0, nombre: '', telefono: '', direccion: '', email: ''
        });
        setIsModalOpen(true);
    };

    const handlerCloseModal = () => {
        setIsModalOpen(false);
        setClientSelected({
            id: 0, nombre: '', telefono: '', direccion: '', email: ''
        });
    };

    const handleDeactivate = async (id, reason) => {
        await deactivate(id, reason, currentUser.id);
        loadClients();
    };

    const handleActivate = async (id) => {
        await activate(id);
        loadClients();
    };

    return (
        <>
            <ModuleHeader title="Clientes">
                <div className="col-12 col-lg-auto">
                    <button className="btn btn-primary w-100" onClick={handlerOpenModal}>
                        <i className="bi bi-plus-lg"></i> Agregar Nuevo Cliente
                    </button>
                </div>

                <div className="col-12 col-lg">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre, teléfono, dirección o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="col-12 col-lg-auto">
                    <ClientsToolbar viewMode={viewMode} setViewMode={setViewMode} />
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
                <ClientTable
                    clients={filteredClients}
                    onEdit={handlerClientSelected}
                    onDeactivate={handleDeactivate}
                    onActivate={handleActivate}
                    showInactive={showInactive}
                />
            ) : (
                <div className="row">
                    {filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                            <ClientCard
                                key={client.id}
                                client={client}
                                onEdit={handlerClientSelected}
                                onDeactivate={handleDeactivate}
                                onActivate={handleActivate}
                            />
                        ))
                    ) : (
                        <p className="text-muted">No hay clientes</p>
                    )}
                </div>
            )}

            <ClientModal
                isOpen={isModalOpen}
                onClose={handlerCloseModal}
                handlerAdd={handlerAddClient}
                clientSelected={clientSelected}
            />
        </>
    );
};
