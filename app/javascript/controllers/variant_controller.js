import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="variant"
export default class extends Controller {
	static targets = ["variantIcon", "variantName", "variantId"];

	connect() {
		console.log("Variant Controller Connected");
	}

	setVariant(e) {
		e.preventDefault();
		this.variantIconTarget.className = e.currentTarget.dataset.icon;
		this.variantNameTarget.textContent = e.target.textContent;
		this.variantIdTarget.value = e.currentTarget.dataset.id;
	}
}