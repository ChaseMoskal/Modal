
/// <reference path="../typings/browser.d.ts"/>

// The region contains all modals on the page.
import ModalRegion, {WindowOverride} from "./modalRegion";

// DOM utilities.
import makeElement from "./dom/makeElement";
import isNested from "./dom/isNested";

/**
 * Generic modal popup – focus the user's attention.
 *  - The user cannot proceed until they satisfy the modal.
 *  - You may want to extend this class to create interesting modals, this one is rather minimalistic.
 */
export default class Modal {

    /**
     * Fixed background that covers everything behind it.
     *  - Blocks clicks from getting through to anything behind it.
     *  - Does *not* stop the user from tabbing out of the Modal interface. You'll have to manage that on your own (for now).
     *  - Does *not* block keypress events that your application might respond to, or anything like that.
     *  - Each modal has its own cover (rather than one cover for all modals) because modals must cover each other.
     *  - The fullscreen fixed background which covers everything behind the modal.
     *  - The root element of the individual modal.
     */
    cover: ModalHtmlElement = makeElement<ModalHtmlElement>("div", {"class": "modal-cover"}, e => e.modal = this);

    /**
     * Centered content box.
     * This could any interesting element, like a <form>, or perhaps an <img>, or even <audio> or <video>.
     * Or just a <div> that contains those things.
     */
    content: HTMLElement = this.createContent();

    /**
     * The modal region contains every modal on the web page.
     * There may be many modals on a page, but there should only be one ModalRegion.
     */
    region: ModalRegion = (<WindowOverride>window).modalRegion || new ModalRegion(); // Use existing region, or create the region (adds itself to the window object).

    /** HTML string that fills the modal content box. */
    protected innerHTML: string;

    /** Perform fade-in and fade-out animations. */
    protected fade: boolean;

    /** Duration, in milliseconds, of the fade-in and fade-out animations. */
    protected fadeTime: number;

    /**
     * Create a Modal popup.
     */
    constructor(options: ModalOptions = {}) {
        const clickCloseCover = (options.clickCloseCover !== undefined)
          ? options.clickCloseCover
          : true;

        this.fade = ('fade' in options)
          ? options.fade
          : true;

        this.fadeTime = ('fadeTime' in options)
          ? options.fadeTime
          : 250;

        // innerHTML option is assigned directly onto the content element.
        this.innerHTML = this.content.innerHTML = options.innerHTML;

        // Place the content element within the cover element.
        this.cover.appendChild(this.content);

        // Establish behavior to close this modal when the cover is clicked.
        if (clickCloseCover) {
            this.cover.onclick = event => {
                if (event.target === this.content || isNested(<Node>event.target, this.content))
                    return;
                this.close();
            };
        }

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
    protected appear(): Promise<any> {
        if (this.fade) {
            this.cover.style.opacity = "0";
            this.cover.style.transition = `opacity ${this.fadeTime}ms ease`;
            return new Promise((resolve, reject)=>{
                setTimeout(()=>{
                    this.cover.style.opacity = "1";
                    resolve();
                }, 0);
            });
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Play a disappearance animation.
     *  - If the `fade` option is true, a fade-out animation will be played.
     *  - Otherwise, no animation will occur (the modal will disappear instantly).
     */
    protected disappear(): Promise<any> {
        if (this.fade) {
            this.cover.style.opacity = "0";
            return new Promise((resolve, reject)=>{
                setTimeout(()=>{
                    resolve();
                }, this.fadeTime);
            });
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Close this modal.
     */
    close(): Promise<any> {
        return this.disappear().then(() => this.cover.remove());
    }
}

/**
 * Options for creating a new modal popup.
 */
export interface ModalOptions {

    /** HTML string that fills the modal content box. */
    innerHTML?: string;

    /** Perform fade-in and fade-out animations. */
    fade?: boolean;

    /** Fade animation duration in milliseconds. */
    fadeTime?: number;

    /** Close the modal whenever the modal cover is clicked. */
    clickCloseCover?: boolean;
}

/**
 * Root HTML element of an individual modal.
 * Contains expando-properties.
 */
export interface ModalHtmlElement extends HTMLElement {

    /** Reference on the HTML element pointing to the corresponding JS Modal instance. */
    modal: Modal;
}
