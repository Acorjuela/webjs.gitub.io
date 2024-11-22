const numbersContainer = document.getElementById('numbersContainer');
const selectionOption = document.getElementById('selectionOption');
const registerBtn = document.getElementById('registerBtn');
const modal = document.getElementById('modal');
const modalForm = document.getElementById('modalForm');

// URL de Google Sheets
const SHEET_URL = "https://api.sheetbest.com/sheets/a6a7621c-2cf3-4448-bcff-ff6fe51c9433";

let numerosOcupados = [];

// Función para cargar números ocupados desde Google Sheets
async function cargarNumerosOcupados() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        numerosOcupados = data.map(item => item.NúmerosSeleccionados.split(','))
            .flat()
            .map(num => num.trim().padStart(3, '0')); // Asegurar formato de tres dígitos
        return numerosOcupados;
    } catch (error) {
        console.error('Error cargando números ocupados:', error);
        Swal.fire('Error', 'No se pudieron cargar los números ocupados. Intenta más tarde.', 'error');
        return [];
    }
}

// Generar números del 000 al 999 y marcarlos según su estado
async function generarNumeros() {
    await cargarNumerosOcupados();

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 1000; i++) {
        const numberDiv = document.createElement('div');
        numberDiv.classList.add('number');
        const number = i.toString().padStart(3, '0'); // Formato a tres dígitos
        numberDiv.textContent = number;

        if (numerosOcupados.includes(number)) {
            numberDiv.classList.add('occupied');
        }

        numberDiv.addEventListener('click', () => {
            if (numberDiv.classList.contains('occupied')) {
                Swal.fire('Número ocupado', `El número ${number} ya está ocupado.`, 'error');
            } else {
                toggleSelection(numberDiv);
            }
        });

        fragment.appendChild(numberDiv);
    }
    numbersContainer.appendChild(fragment);
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
    const selectedNumbers = [...document.querySelectorAll('.number.selected')].map(el => el.textContent.padStart(3, '0'));

    document.getElementById('modalSelectedNumbers').textContent = `Números seleccionados: ${selectedNumbers.join(', ')}`;
    document.getElementById('modalTotalValue').textContent = `Total a pagar: $${(selectedNumbers.length * 20000).toLocaleString()}`;
    modal.style.display = 'block';
   
});

// Enviar datos al servidor
modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedNumbers = [...document.querySelectorAll('.number.selected')].map(el => el.textContent.padStart(3, '0'));

    // Calcular el total a pagar
    const total = selectedNumbers.length * 20000; // $20000 por cada número seleccionado

    const formData = {
        Nombres: document.getElementById('Nombres').value,
        Apellido: document.getElementById('Apellido').value,
        Email: document.getElementById('Email').value,
        Ciudad: document.getElementById('Ciudad').value,
        País: document.getElementById('País').value,
        Responsable: document.getElementById('Nombre_de_responsable').value,
        CelularResponsable: document.getElementById('Celular_de_responsable').value,
        Premio: document.getElementById('Premio').value,
        NúmerosSeleccionados: selectedNumbers.join(','), // Guardar como "025,026,027"
        Total: total // Agregar el total al objeto
    };

    try {
        // Enviar los datos a Google Sheets
        await fetch(SHEET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        // Agregar los números seleccionados a la lista de ocupados
        numerosOcupados.push(...selectedNumbers.map(num => num.padStart(3, '0')));

        // Marcar los números seleccionados como ocupados
        selectedNumbers.forEach(num => {
            const numberDiv = [...document.querySelectorAll('.number')].find(el => el.textContent === num);
            if (numberDiv) {
                numberDiv.classList.remove('selected');
                numberDiv.classList.add('occupied');
            }
        });

        // Mostrar el mensaje de éxito con todos los detalles
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
                <p><b>Números Seleccionados:</b> ${selectedNumbers.join(', ')}</p>
                <p><b>Total a pagar:</b> $${total.toLocaleString()}</p>
                <br>
                <p>No olvides realizar las capturas de pantalla, por favor y gracias por registrarte. ¡Buena suerte!</p>
            `
        }).then(() => {
            // Cerrar el modal y resetear formulario
            modal.style.display = 'none';
           
            modalForm.reset();
            registerBtn.disabled = true;
        });
    } catch (error) {
        Swal.fire('Error', 'No se pudieron guardar los datos.', 'error');
    }
});

// Cerrar modal
function closeModal() {
    modal.style.display = 'none';
    
}

// Inicializar números
generarNumeros();

