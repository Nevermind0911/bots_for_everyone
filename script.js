// URL бэкенда — поменяйте на продакшн-адрес при деплое
var API_URL = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", function () {

    // --- Бургер меню ---
    var burger = document.getElementById("burger-button");
    var nav = document.querySelector(".nav");

    if (burger !== null && nav !== null) {
        burger.addEventListener("click", function () {
            nav.classList.toggle("nav-open");
        });

        nav.addEventListener("click", function (event) {
            if (event.target instanceof HTMLElement && event.target.classList.contains("nav-link")) {
                nav.classList.remove("nav-open");
            }
        });
    }

    // --- Карусель карточек ---
    var scroller = document.getElementById("bots-scroller");
    var scrollLeftBtn = document.getElementById("scroll-left");
    var scrollRightBtn = document.getElementById("scroll-right");

    if (scroller !== null && scrollLeftBtn !== null && scrollRightBtn !== null) {
        var scrollStep = 296;

        scrollLeftBtn.addEventListener("click", function () {
            scroller.scrollBy({ left: -scrollStep, behavior: "smooth" });
        });

        scrollRightBtn.addEventListener("click", function () {
            scroller.scrollBy({ left: scrollStep, behavior: "smooth" });
        });
    }

    // --- Кнопки "Заказать" на карточках ---
    var botButtons = document.querySelectorAll(".bot-btn[data-bot-type]");
    botButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            openOrderModal(btn.getAttribute("data-bot-type") || "");
        });
    });

    // --- Закрытие модала ---
    var modalOverlay = document.getElementById("order-modal");
    var modalClose = document.getElementById("modal-close");

    if (modalOverlay !== null) {
        if (modalClose !== null) {
            modalClose.addEventListener("click", closeOrderModal);
        }

        modalOverlay.addEventListener("click", function (e) {
            if (e.target === modalOverlay) {
                closeOrderModal();
            }
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
                closeOrderModal();
            }
        });
    }

    // --- Форма в модале (заявка на бота) ---
    var orderForm = document.getElementById("order-form");
    if (orderForm !== null) {
        orderForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var data = getFormData(orderForm);
            if (!validateContact(data)) return;

            submitForm(API_URL + "/api/orders", data, function () {
                closeOrderModal();
                orderForm.reset();
                showToast("Заявка отправлена! Свяжемся с вами скоро.", "success");
            });
        });
    }

    // --- Контактная форма ---
    var contactForm = document.getElementById("contact-form");
    if (contactForm !== null) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var data = getFormData(contactForm);
            if (!validateContact(data)) return;

            submitForm(API_URL + "/api/register", data, function () {
                contactForm.reset();
                showToast("Сообщение отправлено! Ответим скоро.", "success");
            });
        });
    }
});

// --- Открыть модал ---
function openOrderModal(botType) {
    var modal = document.getElementById("order-modal");
    var botTypeField = document.getElementById("bot-type-field");
    if (modal === null) return;

    if (botTypeField !== null) {
        botTypeField.value = botType || "";
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Фокус на первое поле
    setTimeout(function () {
        var firstInput = modal.querySelector("input");
        if (firstInput) firstInput.focus();
    }, 200);
}

// --- Закрыть модал ---
function closeOrderModal() {
    var modal = document.getElementById("order-modal");
    if (modal === null) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
}

// --- Собрать данные формы в объект ---
function getFormData(form) {
    var data = {};
    var elements = form.elements;
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        if (el.name) {
            data[el.name] = el.value.trim();
        }
    }
    return data;
}

// --- Валидация: имя и контакт обязательны ---
function validateContact(data) {
    if (!data.name) {
        showToast("Пожалуйста, введите ваше имя.", "error");
        return false;
    }
    if (!data.contact) {
        showToast("Пожалуйста, укажите телефон или email.", "error");
        return false;
    }
    return true;
}

// --- Отправка на бэкенд ---
function submitForm(url, data, onSuccess) {
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(function (res) {
        return res.json().then(function (body) {
            return { ok: res.ok, body: body };
        });
    })
    .then(function (result) {
        if (result.ok) {
            onSuccess();
        } else {
            showToast(result.body.error || "Ошибка при отправке.", "error");
        }
    })
    .catch(function () {
        // Бэкенд недоступен — показываем предупреждение, но не блокируем
        showToast("Сервер временно недоступен. Напишите нам в Telegram.", "error");
    });
}

// --- Toast уведомление ---
function showToast(message, type) {
    var toast = document.getElementById("toast");
    if (toast === null) return;

    toast.textContent = message;
    toast.className = "toast " + type + " visible";

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(function () {
        toast.className = "toast";
    }, 4000);
}
