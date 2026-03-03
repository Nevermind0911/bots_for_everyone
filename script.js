document.addEventListener("DOMContentLoaded", function () {
    var burger = document.getElementById("burger-button");
    var nav = document.querySelector(".nav");

    if (burger !== null && nav !== null) {
        burger.addEventListener("click", function () {
            nav.classList.toggle("nav-open");
        });

        nav.addEventListener("click", function (event) {
            var target = event.target;

            if (target instanceof HTMLElement) {
                if (target.classList.contains("nav-link")) {
                    nav.classList.remove("nav-open");
                }
            }
        });
    }

    var scroller = document.getElementById("bots-scroller");
    var scrollLeftBtn = document.getElementById("scroll-left");
    var scrollRightBtn = document.getElementById("scroll-right");

    if (scroller !== null && scrollLeftBtn !== null && scrollRightBtn !== null) {
        var scrollStep = 280;

        scrollLeftBtn.addEventListener("click", function () {
            scroller.scrollBy({
                left: -scrollStep,
                behavior: "smooth"
            });
        });

        scrollRightBtn.addEventListener("click", function () {
            scroller.scrollBy({
                left: scrollStep,
                behavior: "smooth"
            });
        });
    }
});
