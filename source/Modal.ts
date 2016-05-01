
/// <reference path="../typings/browser.d.ts"/>

// The region contains all modals on the page.
import ModalRegion, {WindowOverride} from "./modalRegion";

// DOM utilities.
import makeElement from "./dom/makeElement";
import isNested from "./dom/isNested";

/**
 * Options for creating a new modal popup.
 */
export interface ModalOptions {

    /** Text that is put into the modal content box ('textContent' is assigned, also 'innerText' for legacy). */
    textContent?: string;

    /** HTML that is put into the modal content box ('innerHTML' is assigned) */
    innerHTML?: string;
    
    /** Establish behavior that closes the modal when the cover is clicked. */
    closeOnCoverClick?: boolean;

    /** Duration of appear/disappear animations in milliseconds. If set to 0, animations are disabled. */
    animationTime?: number;
}

/**
 * Generic modal popup – focus the user's attention.
 *  - The user cannot proceed until they satisfy the modal.
 *  - You may want to extend this class to create interesting modals. This one is rather minimalistic.
 */
export default class Modal {

    /**
     * The modal region contains every modal on the web page.
     * There may be many modals on a page, but there should only be one ModalRegion.
     * The first modal region places itself onto the global window object.
     */
    region: ModalRegion =
        // Use the globally defined 'modalRegion' object,
        (<WindowOverride>window).modalRegion
        // Or be the first to define it.
        || ((<WindowOverride>window).modalRegion = new ModalRegion());

    /**
     * Fixed background that covers everything behind it.
     *  - Blocks clicks from getting through to anything behind it.
     *  - Does *not* stop the user from tabbing out of the Modal interface. You'll have to manage that on your own (for now).
     *  - Does *not* block keypress events that your application might respond to, or anything like that.
     *  - Each modal has its own cover (rather than one cover for all modals) because modals must cover each other.
     *  - The fullscreen fixed background which covers everything behind the modal.
     *  - The root element of the individual modal.
     */
    cover: ModalHtmlElement = makeElement<ModalHtmlElement>(
      "div",
      {"class": "modal-cover"},
      e => e.modal = this
    );

    /**
     * Centered content box.
     * This could any interesting element, like a <form>, or perhaps an <img>, or even <audio> or <video>.
     * Or just a <div> that contains those things.
     */
    content: HTMLElement = this.createContent();

    /** Duration of the appear/disappear animations in milliseconds. If set to 0, animations are disabled. */
    protected animationTime: number;

    /**
     * Create a Modal popup.
     */
    constructor(options: ModalOptions = {}) {
        // Sensible errors.
        if (options.innerHTML !== undefined && options.textContent !== undefined)
            throw "Doesn't make sense to provide innerHTML and textContent at the same time – they override each other";

        // textContent option is directly assigned onto the content element.
        if (options.textContent !== undefined) {
            this.content.innerText = options.textContent; // 'innerText' for legacy browsers.
            this.content.textContent = options.textContent;
        }

        // innerHTML option is assigned directly onto the content element.
        if (options.innerHTML) {
            this.content.innerHTML = options.innerHTML;
        }

        // Place the content element within the cover element.
        this.cover.appendChild(this.content);

        // Establish behavior to close this modal when the cover is clicked.
        if ((options.closeOnCoverClick !== undefined) ? options.closeOnCoverClick : true) {
            this.cover.onclick = event => {
                if (event.target === this.content || isNested(<Node>event.target, this.content))
                    return;
                this.close();
            };
        }

        // Defaulted property representing fade duration.
        this.animationTime = ("fadeTime" in options)
          ? options.animationTime
          : 250;

        // Modal appears upon creation.
        this.appear();

        // Push this modal into the modal region.
        this.region.element.appendChild(this.cover);
    }

    /**
     * Create the content element.
     */
    protected createContent(): HTMLElement {
        return makeElement<HTMLDivElement>("div", {"class": "modal-content modal-plate"});
    }

    /**
     * Play an appearance animation.
     *  - If the `fade` option is true, a fade-in animation will be played.
     *  - Otherwise, no animation will occur (the modal will appear instantly).
     */
    protected appear(): Promise<void> {
        if (this.animationTime > 0) {
            this.cover.style.opacity = "0";
            this.cover.style.transition = `opacity ${this.animationTime}ms ease`;
            return new Promise<void>((resolve, reject)=>{
                setTimeout(()=>{
                    this.cover.style.opacity = "1";
                    resolve();
                }, 0);
            });
        } else {
            return Promise.resolve<void>();
        }
    }

    /**
     * Play a disappearance animation.
     *  - If the `fade` option is true, a fade-out animation will be played.
     *  - Otherwise, no animation will occur (the modal will disappear instantly).
     */
    protected disappear(): Promise<void> {
        if (this.animationTime > 0) {
            this.cover.style.opacity = "0";
            return new Promise<void>((resolve, reject)=>{
                setTimeout(()=>{
                    resolve();
                }, this.animationTime);
            });
        } else {
            return Promise.resolve<void>();
        }
    }

    /**
     * Close this modal by playing the disappear animation then removing the modal.
     * The modal region doesn't need to be notified, because it uses the DOM as its source of truth.
     */
    close(): Promise<void> {
        return this.disappear().then(() => this.cover.remove());
    }
}

/**
 * Root HTML element of an individual modal.
 * Contains expando-properties.
 */
export interface ModalHtmlElement extends HTMLElement {

    /** Reference on the HTML element pointing to the corresponding JS Modal instance. */
    modal: Modal;
}
