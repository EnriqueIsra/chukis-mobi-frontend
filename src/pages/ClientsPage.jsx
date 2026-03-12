import { useState, useEffect } from "react";
import { ClientTable } from "../components/clients/ClientTable";
import { ClientsToolbar } from "../components/clients/ClientsToolbar";
import { ClientCard } from "../components/clients/ClientCard";
import { ClientModal } from "../components/clients/ClientModal";
import Swal from "sweetalert2";
import { findAll, create, update, remove } from "../services/clientService";
import { ModuleHeader } from "../components/common/ModuleHeader";

export const ClientsPage = () => {

    const [clients, setClients] = useState([])

    // Guarda el texto que el usuario escribe en el buscador
    // Es un useStatew con string vacío. Cada vez que el usuario escriba algo en el input, este estado se actualiza y React re-renderiza con los resultados filtrados.
    const [searchTerm, setSearchTerm] = useState("")
    const [clientSelected, setClientSelected] = useState({
        id: 0,
        nombre: '',
        telefono: '',
        direccion: '',
        email: ''
    })
    const [viewMode, setViewMode] = useState("cards");
    const [isModalOpen, setIsModalOpen] = useState(false);


    const getClients = async () => {
        const result = await findAll()
        if (result && result.data) {
            setClients(result.data)
        }
    }

    useEffect(() => {
        getClients()
    }, [])

    // Filtrado de clientes (frontend) se filtra por: Nombre, Teléfono, Dirección y Email.
    // Convierte todo a minúsculas para que la búsqueda no sea sensible a maypusculas.
    // Si searchTerm está vacío, .includes("") siempre es true -> se muestran todos
    const filteredClients = Array.isArray(clients) ? clients.filter(client => {
        const search = searchTerm.toLowerCase()

        return (
            client.nombre?.toLowerCase().includes(search) ||
            client.telefono?.toLowerCase().includes(search) ||
            client.direccion?.toLowerCase().includes(search) ||
            client.email?.toLowerCase().includes(search)
        )
        /* Explicación:
        Array.isArray(clients) -> verifica que clients sea un arreglo (por seguridad) .filter() -> recorre cada cliente y solo deja pasar los que coincidan searchTerm.toLowerCase() -> convierte la búsqueda a minpusculas client.nombre?.toLowerCase().includes(search) -> el ?. es optional chaining, si el nombre es null/undefined no truena, simplemente retorna false Se busca en los 4 campos con || (OR) -> si coincide en CUALQUIER campo, se incluye */
    })
        : []

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
                        /* value={searchTerm} -> el input siempre muestra lo que hay en el estado (input controlado) onChange={(e) => setSearchTerm(e.target.value)} -> cada tecla que escribe el usuario actualiza el estado -> React re-renderiza -> filteredClients se recalcula automáticamente */
                    />
                </div>

                <div className="col-12 col-lg-auto">
                    <ClientsToolbar viewMode={viewMode} setViewMode={setViewMode} />
                </div>
            </ModuleHeader>



            {viewMode === "table" ? (
                <div className="row">
                    <div className="col-12">
                        {clients.length > 0 ? (
                            <ClientTable
                                clients={filteredClients}
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
                        filteredClients.map(client => (
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
