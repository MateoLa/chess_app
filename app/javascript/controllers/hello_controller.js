import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
        console.log("Jelouuuu Controller Connected");
//        this.element.textContent = "Hello World!";
    }

    closeBtn = () => {
        document.getElementById('overlay').style.display = 'none';
    }
}
