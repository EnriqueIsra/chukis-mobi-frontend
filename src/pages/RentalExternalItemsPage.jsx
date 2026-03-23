import { useState, useEffect } from "react";
import * as itemService from "../services/rentalExternalItemService";
import * as providerService from "../services/providerService";
import { ExternalItemTable } from "../components/externalItems/ExternalItemTable";
import { ExternalItemModal } from "../components/externalItems/ExternalItemModal";
import { RentalProfitabilityCard } from "../components/externalItems/RentalProfitabilityCard";
import { RentalSearchDropdown } from "../components/externalItems/RentalSearchDropdown";
import { ModuleHeader } from "../components/common/ModuleHeader";

const emptyItem = {
    id: 0, rentalId: "", providerId: "", description: "", quantity: "", unitCost: "", notes: ""
};

export const RentalExternalItemsPage = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [items, setItems] = useState([]);
    const [providers, setProviders] = useState([]);
    const [selectedRental, setSelectedRental] = useState(null);
    const [showInactive, setShowInactive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemSelected, setItemSelected] = useState(emptyItem);
    const [profitability, setProfitability] = useState(null);

    useEffect(() => {
        providerService.findAll().then((res) => {
            if (res) setProviders(res.data);
        });
    }, []);

    // Carga inicial: todos los items activos o inactivos
    const loadAllItems = async () => {
        const res = showInactive
            ? await itemService.findInactive()
            : await itemService.findAll();
        if (res) setItems(res.data);
    };

    const loadItemsForRental = async (rentalId, inactive = false) => {
        if (inactive) {
            // No hay endpoint de inactivos por renta, filtramos client-side
            const res = await itemService.findInactive();
            if (res) setItems(res.data.filter(item => item.rentalId === rentalId));
        } else {
            const res = await itemService.findByRental(rentalId);
            if (res) setItems(res.data);
        }
        const profRes = await itemService.getProfitability(rentalId);
        if (profRes) setProfitability(profRes.data);
    };

    useEffect(() => {
        if (selectedRental) {
            loadItemsForRental(selectedRental.id, showInactive);
        } else {
            loadAllItems();
        }
    }, [showInactive, selectedRental]);

    const handleSelectRental = (rental) => {
        setSelectedRental(rental);
        setShowInactive(false);
    };

    const handleClearRental = () => {
        setSelectedRental(null);
        setItems([]);
        setProfitability(null);
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
        setItemSelected({ ...emptyItem, rentalId: selectedRental?.id || "" });
        if (selectedRental) {
            loadItemsForRental(selectedRental.id, showInactive);
        } else {
            loadAllItems();
        }
    };

    const handleEdit = (item) => {
        setItemSelected(item);
        setIsModalOpen(true);
    };

    const handleDeactivate = async (id, reason) => {
        await itemService.deactivate(id, reason, currentUser.id);
        if (selectedRental) loadItemsForRental(selectedRental.id, showInactive);
        else loadAllItems();
    };

    const handleActivate = async (id) => {
        await itemService.activate(id);
        if (selectedRental) loadItemsForRental(selectedRental.id, showInactive);
        else loadAllItems();
    };

    const handleOpenModal = () => {
        setItemSelected({ ...emptyItem, rentalId: selectedRental?.id || "" });
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setItemSelected(emptyItem);
        if (selectedRental) loadItemsForRental(selectedRental.id, showInactive);
        else loadAllItems();
    };

    return (
        <>
            <ModuleHeader title="Mobiliario Subcontratado">
                {selectedRental && (
                    <div className="col-12 col-lg-auto">
                        <button className="btn btn-primary w-100" onClick={handleOpenModal}>
                            <i className="bi bi-plus-lg me-1"></i>
                            Registrar Ítem
                        </button>
                    </div>
                )}
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

            {/* Buscador fuera del header para que el dropdown no se corte */}
            <div className="mb-3">
                <RentalSearchDropdown
                    selectedRental={selectedRental}
                    onSelect={handleSelectRental}
                    onClear={handleClearRental}
                />
            </div>

            {selectedRental && <RentalProfitabilityCard profitability={profitability} />}

            <ExternalItemTable
                items={items}
                onEdit={handleEdit}
                onDeactivate={handleDeactivate}
                onActivate={handleActivate}
                showInactive={showInactive}
            />

            <ExternalItemModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                handlerAdd={handleAdd}
                itemSelected={itemSelected}
                providers={providers}
                lockRentalId={!!selectedRental}
            />
        </>
    );
};
