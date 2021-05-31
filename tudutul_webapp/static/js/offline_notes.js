const collapsibles = document.getElementsByClassName("collapsible");
let i;

for (let i = 0; i < collapsibles.length; i++) {
    collapsibles[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
          content.style.maxHeight = null;
          content.style.display = "none";
        } else {
          content.style.display = "block";
          content.style.maxHeight = content.scrollHeight + "px";
        } 
      });
}