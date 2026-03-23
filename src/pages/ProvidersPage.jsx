import { useState, useEffect } from "react";
import * as providerService from "../services/providerService";
import { ProviderTable } from "../components/providers/ProviderTable";
import { ProviderModal } from "../components/providers/ProviderModal";
import { ModuleHeader } from "../components/common/ModuleHeader";

const emptyProvider = { id: 0, name: "", phone: "", notes: "" };

export const ProvidersPage = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [providers, setProviders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [providerSelected, setProviderSelected] = useState(emptyProvider);

    const loadProviders = async () => {
        const res = showInactive
            ? await providerService.findInactive()
            : await providerService.findAll();
        if (res) setProviders(res.data);
    };

    useEffect(() => {
        loadProviders();
    }, [showInactive]);

    const handleAdd = async (provider) => {
        if (provider.id > 0) {
            await providerService.update(provider);
        } else {
            await providerService.create(provider);
        }
        setProviderSelected(emptyProvider);
        loadProviders();
    };

    const handleEdit = (provider) => {
        setProviderSelected(provider);
        setIsModalOpen(true);
    };

    const handleDeactivate = async (id, reason) => {
        await providerService.deactivate(id, reason, currentUser.id);
        loadProviders();
    };

    const handleActivate = async (id) => {
        await providerService.activate(id);
        loadProviders();
    };

    return (
        <>
            <ModuleHeader title="Proveedores">
                <div className="col-12 col-lg-auto">
                    <button
                        className="btn btn-primary w-100"
                        onClick={() => {
                            setProviderSelected(emptyProvider);
                            setIsModalOpen(true);
                        }}
                    >
                        <i className="bi bi-plus-lg me-1"></i>
                        Registrar Proveedor
                    </button>
                </div>
                <div className="col-12 col-lg">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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

            <ProviderTable
                providers={providers.filter(p => {
                    const search = searchTerm.toLowerCase();
                    return (
                        p.name?.toLowerCase().includes(search) ||
                        p.phone?.toLowerCase().includes(search)
                    );
                })}
                onEdit={handleEdit}
                onDeactivate={handleDeactivate}
                onActivate={handleActivate}
                showInactive={showInactive}
            />

            <ProviderModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setProviderSelected(emptyProvider);
                }}
                handlerAdd={handleAdd}
                providerSelected={providerSelected}
            />
        </>
    );
};
