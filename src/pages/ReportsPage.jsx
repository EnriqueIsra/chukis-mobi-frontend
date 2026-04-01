import { useState, useEffect, useRef } from "react";
import * as reportService from "../services/reportService";
import { ModuleHeader } from "../components/common/ModuleHeader";

const MONTHS = [
    { value: 1, label: "Enero" }, { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" }, { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
    { value: 7, label: "Julio" }, { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" }, { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" }
];

export const ReportsPage = () => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [summary, setSummary] = useState(null);
    const reportRef = useRef(null);

    const currentYear = today.getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    useEffect(() => {
        reportService.getMonthlySummary(year, month).then((res) => {
            if (res) setSummary(res.data);
        });
    }, [year, month]);

    const handleExportPdf = async () => {
        const element = reportRef.current;
        if (!element) return;
        const html2pdf = (await import("html2pdf.js")).default;
        html2pdf()
            .set({
                margin: 10,
                filename: `Reporte_${MONTHS[month - 1].label}_${year}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
            })
            .from(element)
            .save();
    };

    const formatMoney = (amount) => {
        if (amount == null) return "$0";
        return "$" + amount.toLocaleString();
    };

    const monthLabel = MONTHS[month - 1]?.label || "";

    return (
        <div className="container-fluid py-4">
            <ModuleHeader title="Reportes">
                <div className="col-auto">
                    <select
                        className="form-select"
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                    >
                        {MONTHS.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
                <div className="col-auto">
                    <select
                        className="form-select"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div className="col-auto">
                    <button className="btn btn-outline-danger" onClick={handleExportPdf}>
                        <i className="bi bi-file-earmark-pdf me-1"></i>
                        Exportar PDF
                    </button>
                </div>
            </ModuleHeader>

            {summary && (
                <div ref={reportRef}>
                    {/* Titulo del reporte (visible en PDF) */}
                    <h4 className="text-center mb-4" style={{ fontWeight: 600 }}>
                        Reporte Mensual — {monthLabel} {year}
                    </h4>

                    {/* Cards resumen */}
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-md-6 col-lg-3">
                            <div className="card border-success h-100">
                                <div className="card-body text-center">
                                    <div className="text-muted small">Ingresos</div>
                                    <div className="fs-4 fw-bold text-success">
                                        {formatMoney(summary.totalIncome)}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                        Pagos recibidos de rentas
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <div className="card border-danger h-100">
                                <div className="card-body text-center">
                                    <div className="text-muted small">Egresos</div>
                                    <div className="fs-4 fw-bold text-danger">
                                        {formatMoney(summary.totalOutcome)}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                        Gastos + Nomina + Subcontratados
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <div className="card h-100" style={{ borderColor: summary.netProfit >= 0 ? "#198754" : "#dc3545" }}>
                                <div className="card-body text-center">
                                    <div className="text-muted small">Utilidad Neta</div>
                                    <div className={`fs-4 fw-bold ${summary.netProfit >= 0 ? "text-success" : "text-danger"}`}>
                                        {formatMoney(summary.netProfit)}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                        Ingresos - Egresos
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <div className="card border-info h-100">
                                <div className="card-body text-center">
                                    <div className="text-muted small">Margen</div>
                                    <div className="fs-4 fw-bold text-info">
                                        {summary.totalIncome > 0
                                            ? ((summary.netProfit / summary.totalIncome) * 100).toFixed(1) + "%"
                                            : "0%"
                                        }
                                    </div>
                                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                        Utilidad / Ingresos
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla desglose */}
                    <div className="card">
                        <div className="card-header fw-bold">
                            Desglose
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-bordered table-hover mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Concepto</th>
                                        <th className="text-end" style={{ width: "200px" }}>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="table-success">
                                        <td><strong>INGRESOS</strong></td>
                                        <td className="text-end"><strong>{formatMoney(summary.totalIncome)}</strong></td>
                                    </tr>
                                    <tr>
                                        <td className="ps-4">Pagos recibidos de rentas</td>
                                        <td className="text-end">{formatMoney(summary.totalIncome)}</td>
                                    </tr>
                                    <tr className="table-danger">
                                        <td><strong>EGRESOS</strong></td>
                                        <td className="text-end"><strong>-{formatMoney(summary.totalOutcome)}</strong></td>
                                    </tr>
                                    <tr>
                                        <td className="ps-4">Gastos operativos</td>
                                        <td className="text-end">-{formatMoney(summary.totalExpenses)}</td>
                                    </tr>
                                    <tr>
                                        <td className="ps-4">Nomina (pagos a trabajadores)</td>
                                        <td className="text-end">-{formatMoney(summary.totalPayroll)}</td>
                                    </tr>
                                    <tr>
                                        <td className="ps-4">Mobiliario subcontratado</td>
                                        <td className="text-end">-{formatMoney(summary.totalSubcontracted)}</td>
                                    </tr>
                                    <tr className={summary.netProfit >= 0 ? "table-success" : "table-danger"}>
                                        <td><strong>UTILIDAD NETA</strong></td>
                                        <td className="text-end">
                                            <strong>{formatMoney(summary.netProfit)}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
