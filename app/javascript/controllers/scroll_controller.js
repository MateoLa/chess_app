import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  initialize() {
    this.resetScrollWithoutThreshold(messages);
  }

  /** On start */
  connect() {
    console.log("Connected scroll");
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
    console.log("Disconnected");
  }

  /** Custom functions */
  resetScroll() {
    const bottomOfScroll = messages.scrollHeight - messages.clientHeight;
    const upperScrollThreshold = bottomOfScroll - 500;
    // Scroll down if we're not within the threshold
    if (messages.scrollTop > upperScrollThreshold) {
      messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    }
    const audio_tag = document.getElementById("audio-tag");
    audio_tag.play();
  }

  resetScrollWithoutThreshold(messages) {
    messages.scrollTop = messages.scrollHeight - messages.clientHeight;
  }
}
