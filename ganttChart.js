


document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("csvFile");
    const delimiterSelect = document.getElementById("delimiter");
    const dateFormatSelect = document.getElementById("dateFormat");
    // Agregamos los event listeners
    delimiterSelect.addEventListener("change", handleChange);
    dateFormatSelect.addEventListener("change", handleChange);

    var dateFormat = dateFormatSelect.value;
    var delimeter = delimiterSelect.value;

    console.log('dateFormat', dateFormat);
    console.log('delimeter', delimeter);


    //Cambios de selectores
    function handleChange() {
        delimeter = delimiterSelect.value;
        dateFormat = dateFormatSelect.value;
        console.log('dateFormat', dateFormat);
        console.log('delimeter', delimeter);

    }



    //Cargue del archivos
    fileInput.addEventListener("change", function (event) {
        var file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const csvText = e.target.result;
                const data = csvToArray(csvText);
                generarGrafico(data);
            };
            reader.readAsText(file);
        }
    });

    function csvToArray(csvText) {
        const lines = csvText.split("\n"); // Dividir por líneas
        let headers = lines[0].split(delimeter).map(header => header.trim()); // Obtener y limpiar los encabezados
        console.log(headers);

        headers = headers.slice(0, 5);
        const result = [];

        // Procesar cada línea
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim(); // Limpiar la línea

            // Si la línea está vacía, la ignoramos
            if (!line) {
                continue;
            }

            const currentLine = line.split(delimeter);
            const obj = {};



            // Asignar valores a las propiedades del objeto
            headers.forEach((header, index) => {
                obj[header] = currentLine[index].trim();
            });

            // Validar que no haya campos vacíos en el objeto
            const hasEmptyFields = Object.values(obj).some(value => !value);
            if (hasEmptyFields) {
                console.warn(`Línea ${i + 1} ignorada: campos vacíos detectados.`);
                continue;
            }

            result.push(obj);
        }

        return result;
    }

    function parseDate(dateStr, dateFormat) {
        if (dateStr) {
            dateStr = dateStr.replace("-", "/");
        }

        if (dateFormat === "dd/MM/yyyy") {

            let [day, month, year] = dateStr.split("/").map(Number);
            console.log('dateFormat dd/mm/yyyy', year, month - 1, day);
            return new Date(year, month - 1, day); // El mes va de 0 a 11
        } else if (dateFormat === "MM/dd/yyyy") {
            let [month, day, year] = dateStr.split("-").map(Number);
            return new Date(year, month - 1, day); // El mes va de 0 a 11
        } else if (dateFormat === "yyyy/MM/dd") {
            console.log('dateFormat yyyy/MM/dd', dateStr);
            return new Date(dateStr)

        }
    }

    function generarGrafico(data) {
        // Convertir fechas a objetos Date
        data.forEach(d => {
            d.inicioDate = parseDate(d.inicio, dateFormat);
            d.finDate = parseDate(d.fin, dateFormat);
        });

        


        //Ordena por menor a mayor fecha de inicio de vacaciones
        data.sort((a, b) => {
            return a.inicioDate - b.inicioDate; // Ordenar de menor a mayor (ascendente)
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

        // Crear el gráfico
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
    }
});