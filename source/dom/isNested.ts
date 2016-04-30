
/**
 * Check if an HTML element is nested underneath another.
 * Walk up the descendant's parentNode chain until either:
 *  - We see ancestor (returning true).
 *  - The chain ends (returning false).
 */
export default function isNested(descendant:Node, ancestor:Node) {
    let walk = descendant;
    while (walk) {
        walk = walk.parentNode;
        if (walk === ancestor) return true;
    }
    return false;
}
