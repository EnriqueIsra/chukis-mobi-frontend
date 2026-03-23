import { useState, useEffect } from "react";
import * as expenseService from "../services/expenseService";
import { ExpenseCard } from "../components/expenses/ExpenseCard";
import { ExpenseTable } from "../components/expenses/ExpenseTable";
import { ExpenseModal } from "../components/expenses/ExpenseModal";
import { ExpensesToolbar } from "../components/expenses/ExpensesToolbar";
import { ModuleHeader } from "../components/common/ModuleHeader";

const emptyExpense = {
    id: 0, amount: "", expenseDate: "", category: "", description: "", imageUrl: ""
};

export const ExpensesPage = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [expenses, setExpenses] = useState([]);
    const [viewMode, setViewMode] = useState("cards");
    const [showInactive, setShowInactive] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expenseSelected, setExpenseSelected] = useState(emptyExpense);

    const loadExpenses = async () => {
        const res = showInactive
            ? await expenseService.findInactive()
            : await expenseService.findAll();
        if (res) setExpenses(res.data);
    };

    useEffect(() => {
        loadExpenses();
    }, [showInactive]);

    // Filtrado por categoría en el frontend
    const filteredExpenses = categoryFilter
        ? expenses.filter((e) => e.category === categoryFilter)
        : expenses;

    const handleAdd = async (expense) => {
        // Asegurar formato correcto de fecha para el backend (LocalDateTime)
        const expenseToSend = {
            ...expense,
            amount: Number(expense.amount),
            expenseDate: expense.expenseDate
                ? (expense.expenseDate.includes("T") ? expense.expenseDate : expense.expenseDate + "T00:00:00")
                : null,
            userId: currentUser.id
        };
        if (expense.id > 0) {
            await expenseService.update(expenseToSend);
        } else {
            await expenseService.create(expenseToSend);
        }
        setExpenseSelected(emptyExpense);
        loadExpenses();
    };

    const handleEdit = (expense) => {
        setExpenseSelected(expense);
        setIsModalOpen(true);
    };

    const handleDeactivate = async (id, reason) => {
        await expenseService.deactivate(id, reason, currentUser.id);
        loadExpenses();
    };

    const handleActivate = async (id) => {
        await expenseService.activate(id);
        loadExpenses();
    };

    const handleOpenModal = () => {
        setExpenseSelected(emptyExpense);
        setIsModalOpen(true);
    };

    return (
        <>
            <ModuleHeader title="Gastos Operativos">
                <div className="col-12">
                    <ExpensesToolbar
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        showInactive={showInactive}
                        onToggleInactive={() => setShowInactive(!showInactive)}
                        categoryFilter={categoryFilter}
                        onCategoryChange={setCategoryFilter}
                        onOpenModal={handleOpenModal}
                        currentUser={currentUser}
                    />
                </div>
            </ModuleHeader>

            {/* Vista Cards */}
            {viewMode === "cards" && (
                <div className="row">
                    {filteredExpenses.length === 0 ? (
                        <p className="text-muted">No hay gastos registrados</p>
                    ) : (
                        filteredExpenses.map((expense) => (
                            <ExpenseCard
                                key={expense.id}
                                expense={expense}
                                onEdit={handleEdit}
                                onDeactivate={handleDeactivate}
                                onActivate={handleActivate}
                                currentUser={currentUser}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Vista Tabla */}
            {viewMode === "table" && (
                <ExpenseTable
                    expenses={filteredExpenses}
                    onEdit={handleEdit}
                    onDeactivate={handleDeactivate}
                    onActivate={handleActivate}
                    showInactive={showInactive}
                    currentUser={currentUser}
                />
            )}

            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setExpenseSelected(emptyExpense);
                }}
                handlerAdd={handleAdd}
                expenseSelected={expenseSelected}
            />
        </>
    );
};
