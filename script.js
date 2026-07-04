const btn = document.getElementById("openBtn");
const music = document.getElementById("music");

btn.addEventListener("click", async () => {
    try {
        await music.play();
        alert("Welcome Alvina ❤️");
    } catch (error) {
        alert("Musik gagal diputar!");
        console.log(error);
    }
});
