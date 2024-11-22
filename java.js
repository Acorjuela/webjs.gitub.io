// Referencias al DOM
const numbersContainer = document.getElementById('numbersContainer');
const selectionOption = document.getElementById('selectionOption');
const registerBtn = document.getElementById('registerBtn');
const modal = document.getElementById('modal');
const modalForm = document.getElementById('modalForm');

// URL de Google Sheets
const SHEET_URL = "https://api.sheetbest.com/sheets/a6a7621c-2cf3-4448-bcff-ff6fe51c9433";

// Función para cargar números ocupados desde Google Sheets
async function cargarNumerosOcupados() {
    const response = await fetch(SHEET_URL);
    const data = await response.json();
    const numerosOcupados = data.map(item => item.NúmerosSeleccionados).flat();
    return numerosOcupados;
}

// Generar números del 000 al 999 y marcar ocupados
async function generarNumeros() {
    const numerosOcupados = await cargarNumerosOcupados();

    for (let i = 0; i < 1000; i++) {
        const numberDiv = document.createElement('div');
        numberDiv.classList.add('number');
        const number = i.toString().padStart(3, '0');
        numberDiv.textContent = number;

        if (numerosOcupados.includes(number)) {
            numberDiv.classList.add('occupied');
        }

        numberDiv.addEventListener('click', () => {
            if (numberDiv.classList.contains('occupied')) {
                Swal.fire('Número ocupado', `El número ${number} ya está ocupado. Selecciona otro.`, 'error');
            } else {
                toggleSelection(numberDiv);
            }
        });

        numbersContainer.appendChild(numberDiv);
    }
}

// Alternar selección de números
function toggleSelection(element) {
    const selectedNumbers = document.querySelectorAll('.number.selected');
    const maxNumbers = parseInt(selectionOption.value);

    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
    } else if (selectedNumbers.length < maxNumbers) {
        element.classList.add('selected');
    } else {
        Swal.fire('Límite alcanzado', `Solo puedes seleccionar ${maxNumbers} número(s).`, 'warning');
    }

    registerBtn.disabled = document.querySelectorAll('.number.selected').length === 0;
}

// Mostrar modal con los datos seleccionados
registerBtn.addEventListener('click', () => {
    const selectedNumbers = [...document.querySelectorAll('.number.selected')].map(el => el.textContent);

    if (selectedNumbers.length === 0) {
        Swal.fire('Error', 'No has seleccionado ningún número.', 'error');
        return;
    }

    const total = selectedNumbers.length * 20000;
    document.getElementById('modalSelectedNumbers').textContent = `Números seleccionados: ${selectedNumbers.join(', ')}`;
    document.getElementById('modalTotalValue').textContent = `Total a pagar: $${total.toLocaleString()}`;
    modal.style.display = 'flex';
});

// Enviar datos a Google Sheets y bloquear números
modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Recopilación de datos del formulario
    const selectedNumbers = [...document.querySelectorAll('.number.selected')].map(el => el.textContent);
    const total = selectedNumbers.length * 20000;

    const formData = {
        Nombres: document.getElementById('Nombres').value,
        Apellido: document.getElementById('Apellido').value,
        Email: document.getElementById('Email').value,
        Ciudad: document.getElementById('Ciudad').value,
        País: document.getElementById('País').value,  // Nuevo campo
        Responsable: document.getElementById('Nombre_de_responsable').value, // Nuevo campo
        CelularResponsable: document.getElementById('Celular_de_responsable').value, // Nuevo campo
        Premio: document.getElementById('Premio').value,  // Nuevo campo
        NúmerosSeleccionados: selectedNumbers,
        Total: total
    };

    // Enviar los datos al Google Sheets
    await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });

    // Bloquear los números seleccionados
    formData.NúmerosSeleccionados.forEach(num => {
        const numberDiv = [...document.querySelectorAll('.number')].find(el => el.textContent === num);
        if (numberDiv) {
            numberDiv.classList.remove('selected');
            numberDiv.classList.add('occupied'); // Bloquear número
        }
    });

    // Mostrar mensaje de éxito
    Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        html: `
            <p><b>Nombres:</b> ${formData.Nombres}</p>
            <p><b>Apellido:</b> ${formData.Apellido}</p>
            <p><b>Email:</b> ${formData.Email}</p>
            <p><b>Ciudad:</b> ${formData.Ciudad}</p>
            <p><b>País:</b> ${formData.País}</p>
            <p><b>Responsable:</b> ${formData.Responsable}</p>
            <p><b>Celular Responsable:</b> ${formData.CelularResponsable}</p>
            <p><b>Premio:</b> ${formData.Premio}</p>
            <p><b>Números Seleccionados:</b> ${formData.NúmerosSeleccionados.join(', ')}</p>
            <p><b>Total a pagar:</b> $${formData.Total.toLocaleString()}</p>
            <br>
            <p>No olvides realizar las capturas de pantalla, por favor y gracias por registrarte. ¡Buena suerte!</p>
        `
    }).then(() => {
        // Cerrar modal y resetear formulario
        modal.style.display = 'none';
        modalForm.reset();
        registerBtn.disabled = true;
    });
});

// Inicializar la generación de números
generarNumeros();

