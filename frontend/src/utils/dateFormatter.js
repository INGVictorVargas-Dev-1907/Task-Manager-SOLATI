/**
 * Formatea una cadena de fecha ISO a un formato local legible en la zona horaria de Colombia.
 * @param {string} dateString La fecha en formato ISO 8601 (ej. "2023-10-27T10:00:00.000Z").
 * @returns {string} La fecha y hora formateada en la zona horaria de Colombia (ej. "27 de octubre de 2023 5:00 p. m.").
 */
export const formatDate = (dateString) => {
    // Si la cadena de fecha es nula o indefinida, devolvemos un valor por defecto.
    if (!dateString) {
        return 'N/A';
    }

    const date = new Date(dateString);

    // Opciones de formato de fecha y hora para Colombia.
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true, // Usa el formato de 12 horas con AM/PM
        timeZone: 'America/Bogota', // Establece la zona horaria de Colombia
    };

    // Formatea la fecha a 'es-CO' (español de Colombia)
    return new Intl.DateTimeFormat('es-CO', options).format(date);
};