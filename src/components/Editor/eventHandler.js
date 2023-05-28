import { tabbableSelector } from "$lib/utils"

/**
 * Usage:
 * ```
 * // inside <script>
 * const craeteEventHandler = (el) => {
 *     return eventHandler(el, changed, closeEditor, animateButtons);
 * }
 * 
 * // svelte markup
 * <editor-inner use:createEventHandler>
 *     ...
 * </editor-inner>
 * ```
 * @param {HTMLElement} editor 
 * @param {{ games: boolean, players: boolean }} changed 
 * @param {() => void} closeEditor 
 * @param {() => void} animateButtons 
 */
export default function eventHandler(editor, changed, closeEditor, animateButtons) {

    /**
     * Closes window if nothing changed, suggests to save or discard otherwise.
     */
    function maybeClose() {
        if (!Object.values(changed).some(Boolean)) closeEditor();
        else {
            // animate buttons and focus discard button
            editor.querySelector('.discard').focus();
            animateButtons()
        }
    }

    /** @type {Event} */
    function handleClickOutside(ev) {
        if (editor.contains(ev.target)) return;
        maybeClose();
    }

    /** @type {Event} */
    function keyboardHandler(ev) {
        switch (ev.code) {
            case 'Escape':
                maybeClose();
                break;

            // lock focus inside
            case 'Tab': {
                const tabbables = Array.from(editor.querySelectorAll(tabbableSelector));
                const index = tabbables.indexOf(ev.target);
                const nextIndex = index + (ev.shiftKey ? -1 : 1);
                const { length } = tabbables;

                let ignore = false;
                if (nextIndex === length) tabbables[0].focus();
                else if (nextIndex === -1) tabbables[length - 1].focus();
                else ignore = true;

                if (!ignore) {
                    ev.preventDefault();
                    ev.stopPropagation();
                }
                break;
            }

            default:
                return;
        }
    }

    // focus on close button after opening
    // it's last so, combined with Tab listener, next tab will focus first element
    // also allows to close immediately
    const closeButton = editor?.querySelector('button.close');
    closeButton?.focus();

    document.addEventListener('keydown', keyboardHandler, true);
    document.addEventListener('click', handleClickOutside, true);

    return {
        destroy: () => {
            document.removeEventListener('keydown', keyboardHandler, true);
            document.removeEventListener('click', handleClickOutside, true);
        }
    };
}