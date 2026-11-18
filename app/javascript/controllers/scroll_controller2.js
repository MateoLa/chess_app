import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  initialize() {
    this.resetScrollWithoutThreshold(messages);
  }

  /** On start */
  connect() {
    console.log("Connected scroll 2");

    const messages = document.getElementById("messages");

    this.observer = new MutationObserver(function(mutations) {
     for (let mutation of mutations) {
       if (mutation.type === 'childList') { this.resetScroll }
     }
    });
    this.observer.observe(messages, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });
    this.resetScrollWithoutThreshold(messages);
  }

  /** On stop */
  disconnect() {
    this.observer.disconnect();
    console.log("Scroll disconnected");
  }

  /** Custom functions */
  resetScroll() {
    this.element.scrollIntoView({ behavior: "smooth" });
    const audio_tag = document.getElementById("audio-tag");
    audio_tag.play();
  }

  resetScrollWithoutThreshold(messages) {
    this.element.scrollIntoView({ behavior: "smooth" });
  }
}
