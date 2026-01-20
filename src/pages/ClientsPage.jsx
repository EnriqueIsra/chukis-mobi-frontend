import { useState, useEffect } from "react";
import { ClientTable } from "../components/clients/ClientTable";
import { ClientsToolbar } from "../components/clients/ClientsToolbar";
import { ClientCard } from "../components/clients/ClientCard";
import { ClientModal } from "../components/clients/ClientModal";
import Swal from "sweetalert2";
import { findAll, create, update, remove } from "../services/clientService";

export const ClientsPage = () => {

    const [clients, setClients] = useState([])
    const [clientSelected, setClientSelected] = useState({
        id: 0,
        nombre: '',
        telefono: '',
        direccion: '',
        email: ''
    })
    const [viewMode, setViewMode] = useState("table");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getClients = async () => {
        const result = await findAll()
        setClients(result.data)
    }

    useEffect(() => {
        getClients()
    }, [])

    const handlerAddClient = async (client) => {
        console.log('handlerAddClient received:', client);
        if (client.id > 0) {
            const response = await update(client)
            console.log('Update response:', response.data);
            setClients(
                clients.map(cli => {
                    if (cli.id === client.id) {
                        return { ...response.data };
                    }
                    return cli
                })
            )
            Swal.fire({
                title: "Actualizado con éxito",
                text: `Cliente ${client.nombre} actualizado con éxito`,
                icon: "success"
            });
        } else {
            const response = await create(client);
            console.log('Create response:', response.data);
            setClients([...clients, { ...response.data }]);
            Swal.fire({
                title: "Creado con éxito",
                text: `Cliente ${client.nombre} creado con éxito`,
                icon: "success"
            });
        }
    }

    const handlerClientSelected = (client) => {
        setClientSelected({ ...client })
        setIsModalOpen(true)
    }

    const handlerOpenModal = () => {
        setClientSelected({
            id: 0,
            nombre: '',
            telefono: '',
            direccion: '',
            email: ''
        })
        setIsModalOpen(true)
    }

    const handlerCloseModal = () => {
        setIsModalOpen(false)
        setClientSelected({
            id: 0,
            nombre: '',
            telefono: '',
            direccion: '',
            email: ''
        })
    }

    const handlerRemoveClient = (id) => {

        Swal.fire({
            title: "¿Está seguro de eliminar el cliente?",
            text: "Esta acción no se puede revertir",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "¡Continuar!",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                remove(id)
                setClients(
                    clients.filter(client => client.id != id)
                )
                Swal.fire({
                    title: "¡Eliminado!",
                    text: "El cliente ha sido eliminado con éxito",
                    icon: "success"
                });
            }
        });
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Clientes</h2>
                <button
                    className="btn btn-primary"
                    onClick={handlerOpenModal}
                >
                    <i className="bi bi-plus-lg"></i> Agregar Cliente
                </button>
            </div>

            <ClientsToolbar viewMode={viewMode} setViewMode={setViewMode} />

            {viewMode === "table" ? (
                <div className="row">
                    <div className="col-12">
                        {clients.length > 0 ? (
                            <ClientTable
                                clients={clients}
                                handlerClientSelected={handlerClientSelected}
                                handlerRemoveClient={handlerRemoveClient}
                            />
                        ) : (
                            <div className="alert alert-warning">
                                No hay clientes
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="row">
                    {clients.length > 0 ? (
                        clients.map(client => (
                            <ClientCard
                                key={client.id}
                                client={client}
                                onEdit={handlerClientSelected}
                                onRemove={handlerRemoveClient}
                            />
                        ))
                    ) : (
                        <div className="col-12">
                            <div className="alert alert-warning">
                                No hay clientes
                            </div>
                        </div>
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
