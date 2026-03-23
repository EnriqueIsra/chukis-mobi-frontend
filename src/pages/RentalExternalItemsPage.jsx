import { useState, useEffect } from "react";
import * as itemService from "../services/rentalExternalItemService";
import * as providerService from "../services/providerService";
import { ExternalItemTable } from "../components/externalItems/ExternalItemTable";
import { ExternalItemModal } from "../components/externalItems/ExternalItemModal";
import { RentalProfitabilityCard } from "../components/externalItems/RentalProfitabilityCard";
import { ModuleHeader } from "../components/common/ModuleHeader";

const emptyItem = {
    id: 0, rentalId: "", providerId: "", description: "", quantity: "", unitCost: "", notes: ""
};

export const RentalExternalItemsPage = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [items, setItems] = useState([]);
    const [providers, setProviders] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemSelected, setItemSelected] = useState(emptyItem);
    const [rentalIdFilter, setRentalIdFilter] = useState("");
    const [profitability, setProfitability] = useState(null);

    useEffect(() => {
        providerService.findAll().then((res) => {
            if (res) setProviders(res.data);
        });
    }, []);

    const loadItems = async () => {
        const res = showInactive
            ? await itemService.findInactive()
            : await itemService.findAll();
        if (res) setItems(res.data);
        setProfitability(null);
    };

    useEffect(() => {
        loadItems();
    }, [showInactive]);

    const handleSearchByRental = async () => {
        if (!rentalIdFilter) return;
        const res = await itemService.findByRental(rentalIdFilter);
        if (res) setItems(res.data);

        // Cargar rentabilidad de esa renta
        const profRes = await itemService.getProfitability(rentalIdFilter);
        if (profRes) setProfitability(profRes.data);
    };

    const handleAdd = async (item) => {
        const itemToSend = {
            ...item,
            rentalId: Number(item.rentalId),
            providerId: Number(item.providerId),
            quantity: Number(item.quantity),
            unitCost: Number(item.unitCost)
        };
        if (item.id > 0) {
            await itemService.update(itemToSend);
        } else {
            await itemService.create(itemToSend);
        }
        setItemSelected(emptyItem);
        loadItems();
    };

    const handleEdit = (item) => {
        setItemSelected(item);
        setIsModalOpen(true);
    };

    const handleDeactivate = async (id, reason) => {
        await itemService.deactivate(id, reason, currentUser.id);
        loadItems();
    };

    const handleActivate = async (id) => {
        await itemService.activate(id);
        loadItems();
    };

    const handleOpenModal = () => {
        setItemSelected({ ...emptyItem, rentalId: rentalIdFilter || "" });
        setIsModalOpen(true);
    };

    return (
        <>
            <ModuleHeader title="Mobiliario Subcontratado">
                <div className="col-12 col-lg-auto">
                    <button className="btn btn-primary w-100" onClick={handleOpenModal}>
                        <i className="bi bi-plus-lg me-1"></i>
                        Registrar Ítem
                    </button>
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
                <div className="col-12 col-lg">
                    <div className="input-group">
                        <input
                            type="number"
                            className="form-control"
                            placeholder="# Renta"
                            value={rentalIdFilter}
                            onChange={(e) => setRentalIdFilter(e.target.value)}
                        />
                        <button className="btn btn-outline-secondary" onClick={handleSearchByRental}>
                            <i className="bi bi-search"></i>
                        </button>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setRentalIdFilter("");
                                setProfitability(null);
                                loadItems();
                            }}
                        >
                            <i className="bi bi-x"></i>
                        </button>
                    </div>
                </div>
            </ModuleHeader>

            {/* Tarjeta de rentabilidad — aparece al buscar por renta */}
            <RentalProfitabilityCard profitability={profitability} />

            <ExternalItemTable
                items={items}
                onEdit={handleEdit}
                onDeactivate={handleDeactivate}
                onActivate={handleActivate}
                showInactive={showInactive}
            />

            <ExternalItemModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setItemSelected(emptyItem);
                }}
                handlerAdd={handleAdd}
                itemSelected={itemSelected}
                providers={providers}
            />
        </>
    );
};
