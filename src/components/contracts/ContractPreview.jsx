import { forwardRef } from "react";
import { businessInfo } from "./contractTerms";

const formatDateLong = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${d.getDate()} de ${d.toLocaleDateString("es-MX", { month: "long" })} del ${d.getFullYear()}`;
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const h = d.getHours(), m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "p.m." : "a.m.";
    return `${d.getDate()} de ${d.toLocaleDateString("es-MX", { month: "long" })} del ${d.getFullYear()} a las ${h % 12 || 12}:${m} ${ampm}`;
};

const formatMoney = (amount) => "$" + (amount || 0).toLocaleString();

const s = {
    page: { width: "700px", padding: "35px 40px", fontFamily: "Georgia, serif", fontSize: "11px", lineHeight: "1.6", color: "#222", background: "#fff" },
    header: { textAlign: "center", marginBottom: "25px", borderBottom: "3px double #333", paddingBottom: "15px" },
    headerTitle: { fontSize: "18px", fontWeight: "bold", letterSpacing: "3px", margin: "0 0 3px", color: "#1a1a2e" },
    headerSub: { fontSize: "11px", color: "#555", margin: "2px 0" },
    contractTitle: { textAlign: "center", fontSize: "14px", fontWeight: "bold", margin: "20px 0", letterSpacing: "1.5px", color: "#1a1a2e" },
    sectionTitle: { fontSize: "11px", fontWeight: "bold", margin: "18px 0 6px", color: "#1a1a2e", borderBottom: "1px solid #ccc", paddingBottom: "3px" },
    partiesGrid: { display: "flex", gap: "20px", marginBottom: "15px" },
    partyBox: { flex: 1, border: "1px solid #ddd", borderRadius: "6px", padding: "10px 12px", background: "#fafafa" },
    partyLabel: { fontSize: "9px", fontWeight: "bold", color: "#667eea", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" },
    partyName: { fontSize: "12px", fontWeight: "bold", marginBottom: "3px" },
    partyDetail: { fontSize: "10px", color: "#555", margin: "1px 0" },
    eventBox: { border: "1px solid #667eea", borderRadius: "6px", padding: "10px 14px", background: "#f8f4ff", marginBottom: "15px" },
    table: { width: "100%", borderCollapse: "collapse", margin: "10px 0" },
    th: { padding: "6px 8px", background: "#1a1a2e", color: "#fff", fontSize: "10px", textAlign: "left" },
    thRight: { padding: "6px 8px", background: "#1a1a2e", color: "#fff", fontSize: "10px", textAlign: "right" },
    td: { padding: "5px 8px", borderBottom: "1px solid #eee", fontSize: "10px" },
    tdRight: { padding: "5px 8px", borderBottom: "1px solid #eee", fontSize: "10px", textAlign: "right" },
    paragraph: { textAlign: "justify", marginBottom: "8px" },
    indent: { textAlign: "justify", marginBottom: "6px", paddingLeft: "20px" },
    clauseNum: { fontWeight: "bold", color: "#667eea" },
    hr: { border: "none", borderTop: "1px solid #ccc", margin: "20px 0" },
    sigBox: { flex: 1, textAlign: "center" },
    sigLine: { borderTop: "1px solid #333", marginTop: "55px", paddingTop: "8px" },
    sigRole: { fontWeight: "bold", fontSize: "10px" },
    sigName: { fontSize: "11px" },
    sigSub: { fontSize: "9.5px", color: "#666", fontStyle: "italic" }
};

export const ContractPreview = forwardRef(({ rental }, ref) => {
    if (!rental) return null;

    const clientName = rental.client?.name || "—";
    const userName = rental.user?.username || "—";
    const userPhone = rental.user?.phone || "";
    const today = new Date();
    const todayStr = `${today.getDate()} dias del mes de ${today.toLocaleDateString("es-MX", { month: "long" })} del ano ${today.getFullYear()}`;

    return (
        <div ref={ref} style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <h1 style={s.headerTitle}>{businessInfo.displayName.toUpperCase()}</h1>
                <p style={s.headerSub}>{businessInfo.address}</p>
                <p style={s.headerSub}>Tel: {businessInfo.phones.join(", ")}</p>
            </div>

            {/* Titulo */}
            <div style={s.contractTitle}>CONTRATO DE ARRENDAMIENTO DE MOBILIARIO, EQUIPO Y SERVICIO PARA EVENTOS</div>
            <p style={{ textAlign: "center", fontSize: "10px", color: "#666" }}>
                Contrato No. <strong>R-{rental.id}</strong> | Fecha: <strong>{formatDateLong(new Date().toISOString())}</strong>
            </p>

            {/* PARTES */}
            <div style={s.sectionTitle}>PARTES</div>
            <div style={s.partiesGrid}>
                <div style={s.partyBox}>
                    <div style={s.partyLabel}>Arrendador</div>
                    <div style={s.partyName}>{businessInfo.owner}</div>
                    <div style={s.partyDetail}>{businessInfo.name}</div>
                    <div style={s.partyDetail}>Tel: {businessInfo.phones.join(", ")}</div>
                    <div style={{ ...s.partyDetail, marginTop: "6px", borderTop: "1px solid #eee", paddingTop: "4px" }}>
                        <strong>Realizo:</strong> {userName}
                    </div>
                    {userPhone && (
                        <div style={s.partyDetail}>Tel: {userPhone}</div>
                    )}
                </div>
                <div style={s.partyBox}>
                    <div style={s.partyLabel}>Arrendatario</div>
                    <div style={s.partyName}>{clientName}</div>
                    <div style={s.partyDetail}>Tel: {rental.client?.phone || "—"}</div>
                    {rental.client?.email && (
                        <div style={s.partyDetail}>Email: {rental.client.email}</div>
                    )}
                    <div style={s.partyDetail}>Dir: {rental.client?.address || "—"}</div>
                </div>
            </div>

            {/* DATOS DEL EVENTO */}
            <div style={s.sectionTitle}>DATOS DEL EVENTO</div>
            <div style={s.eventBox}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <div><strong>Entrega:</strong> {formatDateTime(rental.startDate)}</div>
                    <div><strong>Recogida:</strong> {formatDateTime(rental.endDate)}</div>
                </div>
                <div style={{ marginTop: "5px" }}>
                    <strong>Direccion del evento:</strong> {rental.address}
                </div>
            </div>

            {/* MOBILIARIO */}
            <div style={s.sectionTitle}>MOBILIARIO ARRENDADO</div>
            <table style={s.table}>
                <thead>
                    <tr>
                        <th style={s.th}>Producto</th>
                        <th style={s.thRight}>Cantidad</th>
                        <th style={s.thRight}>P. Unitario</th>
                        <th style={s.thRight}>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {rental.items?.map((item, idx) => (
                        <tr key={idx} style={idx % 2 === 0 ? {} : { background: "#f9f9f9" }}>
                            <td style={s.td}>{item.productName}</td>
                            <td style={s.tdRight}>{item.quantity}</td>
                            <td style={s.tdRight}>{formatMoney(item.unitPrice)}</td>
                            <td style={s.tdRight}>{formatMoney(item.subtotal)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr style={{ borderTop: "2px solid #1a1a2e" }}>
                        <td colSpan="3" style={{ ...s.tdRight, fontWeight: "bold", fontSize: "11px", borderBottom: "none" }}>MONTO TOTAL</td>
                        <td style={{ ...s.tdRight, fontWeight: "bold", fontSize: "13px", color: "#667eea", borderBottom: "none" }}>{formatMoney(rental.total)}</td>
                    </tr>
                </tfoot>
            </table>

            {/* CLAUSULAS */}
            <div style={s.sectionTitle}>CLAUSULAS</div>

            <p style={s.paragraph}>
                <span style={s.clauseNum}>1. </span><strong>OBJETO DEL CONTRATO. </strong>
                El ARRENDADOR se compromete a entregar al ARRENDATARIO el mobiliario descrito en el presente contrato,
                en las condiciones y cantidades acordadas, para su uso temporal en el evento especificado.
                El ARRENDADOR podra cobrar una cantidad adicional, debidamente prevista en el presupuesto,
                en el caso de que el evento prolongue su duracion.
            </p>

            <p style={s.paragraph}>
                <span style={s.clauseNum}>2. </span><strong>ENTREGA Y DEVOLUCION. </strong>
                El mobiliario sera entregado en la direccion del evento en la fecha y hora acordadas.
                El ARRENDATARIO se compromete a facilitar el acceso para la entrega y recogida del mobiliario.
                El ARRENDATARIO no debera trasladar el mobiliario a un lugar diferente al acordado sin autorizacion previa del ARRENDADOR.
            </p>

            <p style={s.paragraph}>
                <span style={s.clauseNum}>3. </span><strong>RESPONSABILIDAD POR DANOS. </strong>
                Si los bienes destinados a la prestacion del servicio sufrieran un menoscabo por culpa o negligencia
                comprobada del ARRENDATARIO o de sus invitados, este se obliga a cubrir los gastos de reparacion
                o, en su caso, indemnizar al ARRENDADOR hasta con el 60% de su valor.
            </p>

            <p style={s.paragraph}>
                <span style={s.clauseNum}>4. </span><strong>FORMA DE PAGO. </strong>
                El ARRENDATARIO debera cubrir un anticipo minimo del 50% del monto total al momento de la firma
                del presente contrato. El saldo restante debera liquidarse a mas tardar al momento de la entrega del mobiliario.
                En caso de no cubrir el saldo, el ARRENDADOR se reserva el derecho de no realizar la entrega.
                El ARRENDATARIO debera presentar una identificacion vigente y con domicilio actual para poder llevar
                a cabo el arrendamiento del equipo.
            </p>

            <p style={s.paragraph}>
                <span style={s.clauseNum}>5. </span><strong>CANCELACION. </strong>
                En caso de cancelacion por parte del ARRENDATARIO, el anticipo no sera reembolsable.
                Si la cancelacion se realiza con menos de 48 horas de anticipacion al evento,
                el ARRENDATARIO debera cubrir el monto total acordado.
            </p>

            <p style={s.paragraph}>
                <span style={s.clauseNum}>6. </span><strong>CUIDADO DE MANTELERIA Y MOBILIARIO. </strong>
                Queda estrictamente prohibido el uso de velas, cigarros, bengalas, velas de chispero, pintura y slime
                sobre la manteleria y mobiliario rentado. En caso de dano a manteles u otros articulos textiles
                por el uso de estos materiales, el ARRENDATARIO se obliga a cubrir el costo total del articulo danado.
            </p>

            <p style={s.paragraph}>
                <span style={s.clauseNum}>7. </span><strong>INCUMPLIMIENTO DEL ARRENDADOR. </strong>
                En caso de que el ARRENDADOR incurra en incumplimiento del presente contrato por causas imputables a el,
                se le obliga, a eleccion del ARRENDATARIO:
            </p>
            <p style={s.indent}>
                A) A contratar por su cuenta a otra empresa que este en posibilidades de realizar la prestacion del servicio
                en las condiciones estipuladas por el ARRENDATARIO. El costo adicional sera absorbido por el ARRENDADOR.
            </p>
            <p style={s.indent}>
                B) A reintegrar las cantidades que se le hubieren entregado y a pagar una pena convencional del 20%
                del precio total del servicio.
            </p>

            <p style={s.paragraph}>
                <span style={s.clauseNum}>8. </span><strong>CASO FORTUITO O FUERZA MAYOR. </strong>
                En caso de que el ARRENDADOR se encuentre imposibilitado para prestar el servicio por caso fortuito
                o fuerza mayor, como incendio, temblor u otros acontecimientos de la naturaleza o hechos del hombre
                ajenos a su voluntad, no se incurrira en incumplimiento, unicamente el ARRENDADOR reintegrara
                al ARRENDATARIO el anticipo que le hubiere entregado.
            </p>

            <p style={s.paragraph}>
                <span style={s.clauseNum}>9. </span><strong>JURISDICCION. </strong>
                La Procuraduria Federal del Consumidor es competente en la via administrativa para resolver cualquier
                controversia que se suscite sobre la interpretacion o cumplimiento del presente contrato. Sin perjuicio
                de lo anterior, las partes se someten a la jurisdiccion de los tribunales competentes en {businessInfo.city},
                renunciando expresamente a cualquier otra jurisdiccion que pudiera corresponderles.
            </p>

            {/* Cierre */}
            <hr style={s.hr} />
            <p style={s.paragraph}>
                Leido que fue por las partes el contenido del presente contrato y sabedoras de su alcance legal,
                lo firman por duplicado en la Ciudad de {businessInfo.city} a los {todayStr}.
            </p>

            {/* 3 Firmas: Arrendador, Realizo, Arrendatario */}
            <div style={{ display: "flex", gap: "25px", marginTop: "10px" }}>
                <div style={s.sigBox}>
                    <div style={s.sigLine}>
                        <div style={s.sigRole}>ARRENDADOR</div>
                        <div style={s.sigName}>{businessInfo.owner}</div>
                        <div style={s.sigSub}>{businessInfo.name}</div>
                    </div>
                </div>
                <div style={s.sigBox}>
                    <div style={s.sigLine}>
                        <div style={s.sigRole}>REALIZO</div>
                        <div style={s.sigName}>{userName}</div>
                        {userPhone && <div style={s.sigSub}>Tel: {userPhone}</div>}
                    </div>
                </div>
                <div style={s.sigBox}>
                    <div style={s.sigLine}>
                        <div style={s.sigRole}>ARRENDATARIO</div>
                        <div style={s.sigName}>{clientName}</div>
                    </div>
                </div>
            </div>
        </div>
    );
});

ContractPreview.displayName = "ContractPreview";
