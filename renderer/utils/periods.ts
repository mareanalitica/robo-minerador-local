export function getPeriodsLastYear(months: number) {
    const periods = [];
    const currentDate = new Date();

    for (let i = 0; i < months; i++) {
        const startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - (i + 1));
        const endDate = new Date(currentDate);
        endDate.setMonth(currentDate.getMonth() - i);

        // Adicione 30 dias para garantir que o intervalo seja completo
        endDate.setDate(endDate.getDate() + 30);

        const periodObject = {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
        };

        periods.push(periodObject);
    }

    return periods;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}