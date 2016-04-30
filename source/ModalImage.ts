
import Modal, {ModalOptions, ModalHtmlElement} from "./Modal";
import makeElement from "./dom/makeElement";

/**
 * Simple modal which presents an image.
 * No caption area or anything like that.
 */
export default class ModalImage extends Modal {

    /** Modal image content element. */
    content: HTMLImageElement;

    /** Source URI that links to the image file. */
    protected src: string;

    /**
     * Create the image content element.
     */
    protected createContent(): HTMLImageElement {
        return makeElement<HTMLImageElement>("img", {"class": "modal-content modal-image"});
    }

    /**
     * Accept modal image options.
     */
    constructor(options:ModalImageOptions) {
        super(options);
        this.content.src = options.src || "";
        this.content.alt = "";
    }
}

/**
 * Options specific to image modals.
 */
export interface ModalImageOptions extends ModalOptions {

    /** Source URI that links to the image file. */
    src: string;
}
