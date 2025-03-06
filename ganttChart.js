document.addEventListener("DOMContentLoaded", function () {
    const data = [
        { funcionario: "TOMÁS", inicio: "2025-03-31", fin: "2025-04-22" },
        { funcionario: "ANGIE", inicio: "2025-04-15", fin: "2025-05-08" },
        { funcionario: "ANGÉLICA", inicio: "2025-04-15", fin: "2025-05-08" },
        { funcionario: "ISABELLA", inicio: "2025-04-17", fin: "2025-05-18" },
        { funcionario: "JAVI", inicio: "2025-06-06", fin: "2025-06-27" },
        { funcionario: "CLAU", inicio: "2025-10-07", fin: "2025-10-28" }
    ];

    // Convertir fechas a objetos Date
    data.forEach(d => {
        d.inicioDate = new Date(d.inicio);
        d.finDate = new Date(d.fin);
    });

    // Encontrar la fecha de inicio más temprana (día 0)
    const fechaInicioMasTemprana = new Date(Math.min(...data.map(d => d.inicioDate)));

    // Calcular los días de inicio y duración para cada funcionario
    data.forEach(d => {
        d.diasInicio = Math.floor((d.inicioDate - fechaInicioMasTemprana) / (1000 * 60 * 60 * 24)); // Días desde el inicio
        d.duracion = Math.floor((d.finDate - d.inicioDate) / (1000 * 60 * 60 * 24)); // Duración en días
    });

    // Identificar todos los días relevantes (días en los que alguien está de vacaciones)
    const diasRelevantes = new Set();
    data.forEach(d => {
        for (let i = d.diasInicio; i <= d.diasInicio + d.duracion; i++) {
            diasRelevantes.add(i);
        }
    });

    // Convertir el Set a un array y ordenarlo
    const diasRelevantesArray = Array.from(diasRelevantes).sort((a, b) => a - b);

    // Crear un mapa para reindexar los días (eliminar huecos)
    const mapaDias = new Map();
    diasRelevantesArray.forEach((dia, index) => {
        mapaDias.set(dia, index + 1); // +1 para que el primer día sea 1 en lugar de 0
    });

    // Ajustar los días de inicio y duración según el nuevo índice
    data.forEach(d => {
        d.diasInicioCompactado = mapaDias.get(d.diasInicio);
        d.diasFinCompactado = mapaDias.get(d.diasInicio + d.duracion);
    });

    const ctx = document.getElementById("ganttChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: data.map(d => d.funcionario), // Eje Y: Nombres de funcionarios
            datasets: [{
                label: "Periodo de Vacaciones",
                data: data.map(d => ({
                    y: d.funcionario, // Eje Y: Nombre del funcionario
                    x: [d.diasInicioCompactado, d.diasFinCompactado] // Eje X: Días compactados
                })),
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
                borderSkipped: false,
                barPercentage: 0.8 // Ancho de las barras
            }]
        },
        options: {
            indexAxis: "y", // Barras horizontales
            responsive: true,
            scales: {
                x: {
                    type: "linear", // Eje X es de tipo lineal (días compactados)
                    title: {
                        display: true,
                        text: "Días"
                    },
                    ticks: {
                        stepSize: 1, // Mostrar marcas cada 1 día
                        callback: (value) => {
                            // Mostrar el día original en lugar del índice compactado
                            const diaOriginal = diasRelevantesArray[value - 1];
                            return diaOriginal !== undefined ? diaOriginal : value;
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Funcionarios"
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const start = data[context.dataIndex].inicio;
                            const end = data[context.dataIndex].fin;
                            const duracion = data[context.dataIndex].duracion;
                            return `Inicio: ${start} - Fin: ${end} (${duracion} días)`;
                        }
                    }
                }
            }
        }
    });
});