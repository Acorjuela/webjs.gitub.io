// Generar números del 000 al 999
const numbersContainer = document.getElementById('numbersContainer');
for (let i = 0; i < 1000; i++) {
    const numberDiv = document.createElement('div');
    numberDiv.classList.add('number');
    numberDiv.textContent = i.toString().padStart(3, '0');
    numbersContainer.appendChild(numberDiv);

    // Selección de número
    numberDiv.addEventListener('click', function () {
        if (numberDiv.classList.contains('selected')) {
            numberDiv.classList.remove('selected');
        } else {
            const selectedNumbers = document.querySelectorAll('.number.selected');
            const maxNumbers = parseInt(document.getElementById('selectionOption').value) || 0;
            if (selectedNumbers.length < maxNumbers) {
                numberDiv.classList.add('selected');
            } else {
                Swal.fire('Límite alcanzado', `Solo puedes seleccionar ${maxNumbers} números.`, 'warning');
            }
        }
    });
}

// Habilitar botón de registro según la opción seleccionada
const selectionOption = document.getElementById('selectionOption');
const registerBtn = document.getElementById('registerBtn');
selectionOption.addEventListener('change', function () {
    registerBtn.disabled = false;
});

// Mostrar modal con datos seleccionados
registerBtn.addEventListener('click', function () {
    const selectedNumbers = [...document.querySelectorAll('.number.selected')].map(el => el.textContent);
    if (selectedNumbers.length === 0) {
        Swal.fire('Error', 'No has seleccionado ningún número.', 'error');
        return;
    }

    // Calcular el total a pagar
    const total = selectedNumbers.length * 20000; // $20,000 por cada número seleccionado

    // Mostrar los números seleccionados y el total en el modal
    document.getElementById('modalSelectedNumbers').textContent = `Números seleccionados: ${selectedNumbers.join(', ')}`;
    document.getElementById('modalTotalValue').textContent = `Total a pagar: $${total.toLocaleString()}`;

    document.getElementById('modal').style.display = 'flex';
});

// Enviar datos a Google Sheets
const modalForm = document.getElementById('modalForm');
modalForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nombres = document.getElementById('Nombres').value;
    const apellido = document.getElementById('Apellido').value;
    const email = document.getElementById('Email').value;
    const ciudad = document.getElementById('Ciudad').value;
    const pais = document.getElementById('País').value;
    const responsable = document.getElementById('Nombre_de_responsable').value;
    const celular = document.getElementById('Celular_de_responsable').value;
    const premio = document.getElementById('Premio').value;

    // Formatear los números seleccionados a 3 dígitos y asegurar que estén correctamente formateados
    const selectedNumbers = [...document.querySelectorAll('.number.selected')]
        .map(el => el.textContent.trim().padStart(3, '0')); // .trim() para eliminar posibles espacios

    // Calcular el total a pagar
    const total = selectedNumbers.length * 20000; // $20,000 por cada número seleccionado

    // Crear el objeto de datos para enviar a Google Sheets
    const data = {
        Nombres: nombres,
        Apellido: apellido,
        Email: email,
        Ciudad: ciudad,
        País: pais,
        Responsable: responsable,
        CelularResponsable: celular,
        Premio: premio,
        NúmerosSeleccionados: selectedNumbers, // Unir los números con coma
        Total: total, // Agregar el total aquí
    };

    // Enviar los datos a Google Sheets
    fetch('https://api.sheetbest.com/sheets/a6a7621c-2cf3-4448-bcff-ff6fe51c9433', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                html: ` 
                    <p><b>Nombres:</b> ${nombres}</p>
                    <p><b>Apellido:</b> ${apellido}</p>
                    <p><b>Email:</b> ${email}</p>
                    <p><b>Ciudad:</b> ${ciudad}</p>
                    <p><b>País:</b> ${pais}</p>
                    <p><b>Responsable:</b> ${responsable}</p>
                    <p><b>Celular Responsable:</b> ${celular}</p>
                    <p><b>Premio:</b> ${premio}</p>
                    <p><b>Números Seleccionados:</b> ${selectedNumbers.join(', ')}</p>
                    <p><b>Total a pagar:</b> $${total.toLocaleString()}</p>
                    <br>
                    <p>No olvides realizar las capturas de pantalla, por favor y Gracias por registrarte. ¡Buena suerte!</p>
                `,
            }).then(() => {
                // Resetear formulario y modal
                modalForm.reset();
                document.getElementById('modal').style.display = 'none';
                document.querySelectorAll('.number.selected').forEach(el => el.classList.remove('selected'));
                registerBtn.disabled = true;
            });
        } else {
            Swal.fire('Error', 'Hubo un problema al enviar los datos.', 'error');
        }
    })
    .catch(err => {
        console.error(err);
        Swal.fire('Error', 'No se pudo conectar con Google Sheets.', 'error');
    });
});