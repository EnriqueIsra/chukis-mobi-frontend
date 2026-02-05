import { useNavigate } from 'react-router-dom'
/* 
    Componente QuickActions - Botones de acciones rápidas
    Permite navegar rápidamente a crear renta o agregar cliente
*/
export const QuickActions = () => {
    const navigate = useNavigate();

    // Navegar a la página de rentas
    const handleNewRental = () => {
        navigate('/rentals');
    }

    // navegar a la página de clientes
    const handleNewClient = () => {
        navigate('/clients');
    }

    return (
        <div className='card shadow-sm mb-4'>
            <div className='card-body'>
                <h5 className='card-title mb-3'>
                    <i className='bi bi-lightning-charge me-2 text-warning'></i>
                    Acciones Rápidas
                </h5>
                <div className='d-flex flex-wrap gap-2'>
                    <button
                        className='btn btn-primary'
                        onClick={handleNewRental}
                    >
                        <i className='bi bi-plus-lg me-2'></i>
                        Nueva Renta
                    </button>
                    <button
                        className='btn btn-outline-primary'
                        onClick={handleNewClient}
                    >
                        <i className='bi bi-person-plus me-2'></i>
                        Agregar Cliente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickActions;