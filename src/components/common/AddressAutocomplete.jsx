import { useState, useEffect, useRef } from "react";

export const AddressAutocomplete = ({ value, onChange, placeholder = "Buscar dirección..." }) => {
    const [query, setQuery] = useState(value || "") // query:  
    // texto visible en el input
    const [suggestions, setSuggestions] = useState([])  // suggestions: array de resultados que devuelve Nominatim
    const [loading, setLoading] = useState(false)   // loading: controla el spinner mientras se hace la petición
    const [showDropdown, setShowDropdown] = useState(false) // Muestra las sugerencias debajo del input de busqueda
    const debounceRef = useRef(null)
    const wrapperRef = useRef(null)

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleInputChange = (e) => {
        const val = e.target.value
        setQuery(val);
        onChange(val); // sincroniza con el form padre aunque no haya seleccionado sugerencia

        clearTimeout(debounceRef.current);

        if (val.length < 3) {
            setSuggestions([])
            setShowDropdown(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const res = await fetch(
                    `https://photon.komoot.io/api/?` +
                    new URLSearchParams({
                        q: val,
                        limit: 5,
                        lang: "default",
                        lat: "21.8853", // Centro de Aguascalientes (bias de búsqueda)
                        lon: "-102.2916"
                    }),
                )
                const data = await res.json()
                // Fallback a [] si data.features no existe
                setSuggestions(data.features || [])
                setShowDropdown(true)
            } catch (err) {
                console.error("Error buscando dirección", err)
                setSuggestions([]) //  También por si hay error de red
            } finally {
                setLoading(false)
            }
        }, 500) // espera 500ms después de que el usuario deje de escribir
    }

    // Photon devuelve las propiedades dentro de feature.properties
    const handleSelect = (place) => {
        // Construimos la dirección manualmente desde los campos de Photon
        const p = place.properties
        const parts = [
            p.name,         // nombre de la calle
            p.housenumber,  // número de calle 
            p.locality,     // colonia 
            p.postcode,     // CP 
            p.street,
            p.city,
            p.state
        ].filter(Boolean)    // elimina los que sean undefined o vacíos

        const address = parts.join(", ")
        setQuery(address)
        onChange(address)
        setSuggestions([])
        setShowDropdown(false)
    }

    return (
        <div ref={wrapperRef} style={{ position: "relative" }}>
            <div className="input-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    autoComplete="off"
                />
                {loading && (
                    <span className="input-group-text">
                        <span className="spinner-border spinner-border-sm" />
                    </span>
                )}
            </div>

            {showDropdown && suggestions.length > 0 && (
                <ul
                    className="list-group shadow"
                    style={{
                        position: "absolute",
                        zIndex: 1050,
                        width: "100%",
                        maxHeight: "220px",
                        overflowY: "auto"
                    }}
                >
                    {suggestions.map((place) => (
                        <li
                            key={place.properties.osm_id}
                            className="list-group-item list-group-item-action"
                            style={{ cursor: "pointer", fontSize: "0.875rem" }}
                            onMouseDown={() => handleSelect(place)} // mouseDown antes que onBlur
                        >
                            <i className="bi bi-geo-alt me-2 text-primary" />
                            {/* Mostramos nombre + calle + ciudad para que sea legible */}
                            {[place.properties.name, place.properties.street, place.properties.locality,
                            place.properties.postcode, place.properties.city]
                                .filter(Boolean)
                                .join(", ")}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}