 // Elementos del DOM
 const modal = document.getElementById("modal");
 const openModalButton = document.getElementById("openModalButton");
 const closeModalButton = document.getElementById("closeModal");
 const iframe = document.getElementById("iframe");
 const otpDisplay = document.getElementById("otpDisplay");
 
 // Temporizador
 const countdown = () => {
   const launchDate = new Date("Nov 28, 2024 02:10:00").getTime(); // Fecha límite
   const now = new Date().getTime();
   const timeLeft = launchDate - now;
 
   if (timeLeft < 0) {
     clearInterval(timer);
     document.querySelector(".countdown").style.display = "none";
     disableButton(); // Deshabilita el botón
     return;
   }
 
   const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
   const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
   const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
   const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
 
   document.getElementById("days").innerText = days < 10 ? "0" + days : days;
   document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
   document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
   document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
 };
 
 
 
 
 // Deshabilitar botón
 const disableButton = () => {
   openModalButton.disabled = true;
   openModalButton.innerText = "Registro cerrado";
   openModalButton.classList.add("disabled");
 };
 
 // Abrir el modal
 openModalButton.addEventListener("click", () => {
   if (!openModalButton.disabled) {
     modal.style.display = "flex";
     iframe.src = "about.html"; // Cargar el formulario desde main.html
   }
 });
 
 // Cerrar el modal
 closeModalButton.addEventListener("click", () => {
   modal.style.display = "none";
   iframe.src = ""; // Limpiar el iframe al cerrar el modal
 });
 
 // Cerrar el modal si se hace clic fuera del contenido
 window.addEventListener("click", (event) => {
   if (event.target === modal) {
     modal.style.display = "none";
     iframe.src = "";
   }
 });
 
 // Iniciar temporizador
 const timer = setInterval(countdown, 1000);
 
 
