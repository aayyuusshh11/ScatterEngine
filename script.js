const hero = document.querySelector(".hero-content");
const heroSection = document.querySelector(".hero");
const codeSection = document.querySelector(".code-section");

window.addEventListener("scroll", () => {

    const heroRect = heroSection.getBoundingClientRect();
    const codeRect = codeSection.getBoundingClientRect();

    // Stick when hero reaches navbar

    if(heroRect.top <= -250){

        hero.classList.add("sticky");

    }
    else{

        hero.classList.remove("sticky");

    }

    // Release when code gets close

    if(codeRect.top <= 250){

        hero.classList.remove("sticky");

    }

});