// Simulación de números ocupados (desde el servidor)
const numerosOcupados = ["092", "106" ,"098", "121", "123" , "000"]; // Ejemplo de datos ocupados

// Configuración inicial
const numbersContainer = document.getElementById('numbersContainer');
const selectionOption = document.getElementById('selectionOption');
const registerBtn = document.getElementById('registerBtn');
const modalForm = document.getElementById('modalForm');
const modal = document.getElementById('modal');

// Generar números del 000 al 999
for (let i = 0; i < 1000; i++) {
    const numberDiv = document.createElement('div');
    numberDiv.classList.add('number');
    const number = i.toString().padStart(3, '0');
    numberDiv.textContent = number;

    // Marcar como ocupado si está en la lista
    if (numerosOcupados.includes(number)) {
        numberDiv.classList.add('occupied'); // Clase CSS para números ocupados
    }

    // Manejo de selección de números
    numberDiv.addEventListener('click', () => {
        if (numberDiv.classList.contains('occupied')) {
            Swal.fire('Número ocupado', `El número ${number} ya está ocupado. Selecciona otro.`, 'error');
        } else {
            toggleSelection(numberDiv);
        }
    });

    numbersContainer.appendChild(numberDiv);
}

// Alternar selección de números
function toggleSelection(element) {
    const selectedNumbers = document.querySelectorAll('.number.selected');
    const maxNumbers = parseInt(selectionOption.value) || 0;

    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
    } else if (selectedNumbers.length < maxNumbers) {
        element.classList.add('selected');
    } else {
        Swal.fire('Límite alcanzado', `Solo puedes seleccionar ${maxNumbers} números.`, 'warning');
    }
}

// Habilitar botón de registro al seleccionar cantidad
selectionOption.addEventListener('change', () => {
    registerBtn.disabled = false;
});

// Mostrar modal de confirmación con datos seleccionados
registerBtn.addEventListener('click', () => {
    const selectedNumbers = [...document.querySelectorAll('.number.selected')].map(el => el.textContent);

    if (selectedNumbers.length === 0) {
        Swal.fire('Error', 'No has seleccionado ningún número.', 'error');
        return;
    }

    const total = selectedNumbers.length * 20000; // $20,000 por cada número seleccionado
    document.getElementById('modalSelectedNumbers').textContent = `Números seleccionados: ${selectedNumbers.join(', ')}`;
    document.getElementById('modalTotalValue').textContent = `Total a pagar: $${total.toLocaleString()}`;
    modal.style.display = 'flex';
});

// Enviar datos a Google Sheets
modalForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        Nombres: document.getElementById('Nombres').value,
        Apellido: document.getElementById('Apellido').value,
        Email: document.getElementById('Email').value,
        Ciudad: document.getElementById('Ciudad').value,
        País: document.getElementById('País').value,
        Responsable: document.getElementById('Nombre_de_responsable').value,
        CelularResponsable: document.getElementById('Celular_de_responsable').value,
        Premio: document.getElementById('Premio').value,
        NúmerosSeleccionados: [...document.querySelectorAll('.number.selected')]
            .map(el => el.textContent.trim().padStart(3, '0')),
    };

    formData.Total = formData.NúmerosSeleccionados.length * 20000;

    enviarDatosAGoogleSheets(formData);
});

// Enviar datos a Google Sheets con feedback
function enviarDatosAGoogleSheets(data) {
    fetch('https://api.sheetbest.com/sheets/a6a7621c-2cf3-4448-bcff-ff6fe51c9433', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro exitoso!',
                    html: `
                        <p><b>Nombres:</b> ${data.Nombres}</p>
                        <p><b>Apellido:</b> ${data.Apellido}</p>
                        <p><b>Email:</b> ${data.Email}</p>
                        <p><b>Ciudad:</b> ${data.Ciudad}</p>
                        <p><b>País:</b> ${data.País}</p>
                        <p><b>Responsable:</b> ${data.Responsable}</p>
                        <p><b>Celular Responsable:</b> ${data.CelularResponsable}</p>
                        <p><b>Premio:</b> ${data.Premio}</p>
                        <p><b>Números Seleccionados:</b> ${data.NúmerosSeleccionados.join(', ')}</p>
                        <p><b>Total a pagar:</b> $${data.Total.toLocaleString()}</p>
                        <br>
                        <p>No olvides realiza las capturas de pantalla, por favor y Gracias por registrarte. ¡Buena suerte!</p>
                    `,
                }).then(() => {
                    resetFormulario();
                });
            } else {
                Swal.fire('Error', 'No se pudo registrar los datos.', 'error');
            }
        })
        .catch(() => Swal.fire('Error', 'No se pudo conectar con Google Sheets.', 'error'));
}

// Resetear formulario y reiniciar estados
function resetFormulario() {
    modalForm.reset();
    modal.style.display = 'none';
    document.querySelectorAll('.number.selected').forEach((el) => el.classList.remove('selected'));
    registerBtn.disabled = true;
}
