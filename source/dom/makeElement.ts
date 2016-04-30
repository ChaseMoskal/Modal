
/**
 * Fabricate an HTML element with attributes.
 */
export default function makeElement<ElementType extends HTMLElement>(

  /** HTML tag name. */
  tag: string,

  /** Attributes to be set on the HTML element. */
  attributes: {[name:string]:string} = {},

  /** Initializer functions that perform operations on or with the new HTML element. */
  ...initializers: ((element:ElementType) => void)[]

): ElementType {

    // Create the HTML element.
    let element = <ElementType> document.createElement(tag);

    // Set attributes onto element.
    for (let name of Object.keys(attributes))
        element.setAttribute(name, attributes[name]);

    // Run element through transfomers.
    for (let initializer of initializers)
        initializer(element);

    // Return the completed HTML element.
    return element;
}
