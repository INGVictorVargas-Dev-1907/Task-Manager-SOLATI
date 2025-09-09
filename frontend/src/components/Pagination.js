import React from 'react';
import { Pagination as BootstrapPagination, Form } from 'react-bootstrap';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange
}) => {
    const maxVisiblePages = 5;
    
    // Función para determinar los números de página a mostrar
    const getPageNumbers = () => {
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
    };

    if (totalPages <= 1) return null;

    // Se extraen los números de página visibles
    const pageNumbers = getPageNumbers();
    
    // Se definen startPage y endPage para la lógica de los puntos suspensivos
    const startPage = pageNumbers[0];
    const endPage = pageNumbers[pageNumbers.length - 1];

    return (
        <div className="d-flex justify-content-between align-items-center">
            {/* Control para el número de ítems por página */}
            <div className="d-flex align-items-center">
                <span className="me-2 text-muted">Mostrar:</span>
                <Form.Select
                    size="sm"
                    style={{ width: '80px' }}
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(e.target.value)}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </Form.Select>
                <span className="ms-2 text-muted">ítems por página</span>
            </div>
            
            {/* Componente de paginación principal */}
            <BootstrapPagination>
                <BootstrapPagination.First 
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                />
                <BootstrapPagination.Prev 
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                />
                
                {/* Lógica para mostrar puntos suspensivos iniciales */}
                {startPage > 1 && <BootstrapPagination.Ellipsis />}
                
                {/* Renderizado de los números de página */}
                {pageNumbers.map(page => (
                    <BootstrapPagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </BootstrapPagination.Item>
                ))}
                
                {/* Lógica para mostrar puntos suspensivos finales */}
                {endPage < totalPages && <BootstrapPagination.Ellipsis />}

                <BootstrapPagination.Next
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                />
                <BootstrapPagination.Last
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                />
            </BootstrapPagination>
            
            {/* Indicador de la página actual y total */}
            <div className="text-muted">
                Página {currentPage} de {totalPages}
            </div>
        </div>
    );
};

export default Pagination;