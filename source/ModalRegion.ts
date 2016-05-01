
import makeElement from "./dom/makeElement";
import Modal, {ModalHtmlElement} from "./Modal";

/**
 * Modal region which contains all modals on a page.
 */
export default class ModalRegion {

    /** Modal region HTML element. */
    element: HTMLDivElement = makeElement<HTMLDivElement>(
      "div",
      {"data-modal-region": ""},
      e => document.body.insertBefore(e, document.body.firstChild)
    );

    /** Array of all Modal instances. */
    get modals(): Modal[] {
        return [].slice.call(this.element.children)
          .map((child: ModalHtmlElement) => child.modal);
    }
}

/**
 * Declaring that `modalRegion` is a valid `window` property.
 */
export interface WindowOverride extends Window { modalRegion: ModalRegion; }
