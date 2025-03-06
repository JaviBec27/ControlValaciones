# Gráfico de Gantt con Chart.js

Este proyecto genera un gráfico de Gantt interactivo utilizando **Chart.js** y datos dinámicos cargados desde un archivo CSV. El gráfico muestra los períodos de vacaciones de varios funcionarios, permitiendo visualizar cuándo empiezan, cuánto duran y si hay solapamientos entre ellos.

![Gráfico de Gantt](screenshot.png) <!-- Si tienes una imagen, añádela aquí -->

---

## Características

- **Carga dinámica de datos**: Los datos se cargan desde un archivo CSV ubicado en la raíz del proyecto.
- **Eje X compacto**: El gráfico elimina los días sin vacaciones, mostrando solo los días relevantes.
- **Tooltips informativos**: Al pasar el mouse sobre las barras, se muestran las fechas de inicio y fin, así como la duración en días.
- **Responsivo**: El gráfico se adapta a diferentes tamaños de pantalla.

---

## Requisitos

Para ejecutar este proyecto, necesitas:

- Un navegador web moderno (Chrome, Firefox, Edge, etc.).
- Un servidor local para cargar el archivo CSV (puedes usar [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) en VS Code o [http-server](https://www.npmjs.com/package/http-server)).

---

## Cómo usar

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/JaviBec27/ControlValaciones.git
   cd tu-repositorio