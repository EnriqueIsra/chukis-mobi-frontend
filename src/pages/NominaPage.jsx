import { useState, useEffect } from "react";
import * as workerPaymentService from "../services/workerPaymentService";
import * as userService from "../services/userService";
import { WorkerPaymentTable } from "../components/nomina/WorkerPaymentTable";
import { WorkerPaymentModal } from "../components/nomina/WorkerPaymentModal";
import { WorkerCard } from "../components/nomina/WorkerCard";
import { NominaToolbar } from "../components/nomina/NominaToolbar";
import { ModuleHeader } from "../components/common/ModuleHeader";

const emptyPayment = {
    id: 0, workerId: "", amount: "", paymentDate: "", notes: "", registeredById: ""
};

export const NominaPage = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const today = new Date();

    const [payments, setPayments] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState([]);
    const [users, setUsers] = useState([]);
    const [viewMode, setViewMode] = useState("grouped");
    const [showInactive, setShowInactive] = useState(false);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentSelected, setPaymentSelected] = useState(emptyPayment);

    useEffect(() => {
        userService.findAllUsers().then((res) => {
            if (res?.data) setUsers(res.data);
        });
    }, []);

    useEffect(() => {
        if (viewMode !== "list") return;
        if (showInactive) {
            workerPaymentService.findInactive().then((res) => {
                if (res) setPayments(res.data);
            });
        } else {
            workerPaymentService.findAll().then((res) => {
                if (res) setPayments(res.data);
            });
        }
    }, [showInactive, viewMode]);

    useEffect(() => {
        if (viewMode !== "grouped") return;
        const fetchSummary = showInactive
            ? workerPaymentService.getMonthlySummaryInactive(selectedYear, selectedMonth)
            : workerPaymentService.getMonthlySummary(selectedYear, selectedMonth);
        fetchSummary.then((res) => {
            if (res) setMonthlySummary(res.data);
        });
    }, [viewMode, selectedYear, selectedMonth, showInactive]);

    const handleAdd = async (payment) => {
        const paymentToSend = {
            ...payment,
            amount: Number(payment.amount),
            paymentDate: payment.paymentDate
                ? (payment.paymentDate.includes("T") ? payment.paymentDate : payment.paymentDate + "T00:00:00")
                : null,
            registeredById: currentUser.id
        };
        if (payment.id > 0) {
            await workerPaymentService.update(paymentToSend);
        } else {
            await workerPaymentService.create(paymentToSend);
        }
        setPaymentSelected(emptyPayment);
        reloadData();
    };

    const handleEdit = (payment) => {
        setPaymentSelected(payment);
        setIsModalOpen(true);
    };

    const reloadData = async () => {
        if (viewMode === "list") {
            const res = showInactive
                ? await workerPaymentService.findInactive()
                : await workerPaymentService.findAll();
            if (res) setPayments(res.data);
        } else {
            const res = showInactive
                ? await workerPaymentService.getMonthlySummaryInactive(selectedYear, selectedMonth)
                : await workerPaymentService.getMonthlySummary(selectedYear, selectedMonth);
            if (res) setMonthlySummary(res.data);
        }
    };

    const handleDeactivate = async (id, reason) => {
        await workerPaymentService.deactivate(id, reason, currentUser.id);
        reloadData();
    };

    const handleActivate = async (id) => {
        await workerPaymentService.activate(id);
        reloadData();
    };

    const handleOpenModal = () => {
        setPaymentSelected(emptyPayment);
        setIsModalOpen(true);
    };

    return (
        <>
            <ModuleHeader title="Cagada de Aguila">
                <div className="col-12">
                    <NominaToolbar
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        showInactive={showInactive}
                        onToggleInactive={() => setShowInactive(!showInactive)}
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                        onYearChange={setSelectedYear}
                        onMonthChange={setSelectedMonth}
                        onOpenModal={handleOpenModal}
                        currentUser={currentUser}
                    />
                </div>
            </ModuleHeader>

            {viewMode === "list" && (
                <WorkerPaymentTable
                    payments={payments}
                    onEdit={handleEdit}
                    onDeactivate={handleDeactivate}
                    onActivate={handleActivate}
                    showInactive={showInactive}
                    currentUser={currentUser}
                />
            )}

            {viewMode === "grouped" && (
                <div className="row g-3">
                    {monthlySummary.length === 0 ? (
                        <p className="text-muted">Sin pagos este mes</p>
                    ) : (
                        monthlySummary.map((summary) => (
                            <div key={summary.workerId} className="col-12 col-md-6 col-lg-4">
                                <WorkerCard
                                    summary={summary}
                                    onEdit={handleEdit}
                                    onDeactivate={handleDeactivate}
                                    onActivate={handleActivate}
                                    showInactive={showInactive}
                                    currentUser={currentUser}
                                />
                            </div>
                        ))
                    )}
                </div>
            )}

            <WorkerPaymentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setPaymentSelected(emptyPayment);
                }}
                handlerAdd={handleAdd}
                paymentSelected={paymentSelected}
                users={users}
            />
        </>
    );
};
