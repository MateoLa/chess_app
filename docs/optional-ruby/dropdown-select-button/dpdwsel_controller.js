import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="variant"
export default class extends Controller {
	static targets = ["icon", "name", "attr"];

	connect() {
	    this.pref = this.element.dataset.pref;
		console.log("Dropdown Select Connected");
	}

	set(e) {
        e.preventDefault();
		if (this.hasIconTarget) { this.iconTarget.className = e.currentTarget.dataset.icon; }
		this.nameTarget.textContent = e.currentTarget.dataset.locale;
		if (this.hasAttrTarget) { this.attrTarget.textContent = e.currentTarget.dataset.attr; }

		this.sendPref({ [this.pref]: e.currentTarget.dataset.name });
	}

    changed(e) {
        // Get the selected radio button's value
        const selectedValue = e.target.value;
        this.sendPref({ [this.pref]: selectedValue });
    }

    async sendPref(params) {
        try {
            const response = await fetch("/settings.js", {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({"setting": params})
            })

            if (!response.ok) throw new Error("DpdwSel error: ", response.status);
            const data = await response.json();
            console.log(data.message);
        } catch (error) { console.error("DpdwSel problem: ", error); };
    }
}