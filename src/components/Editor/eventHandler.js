/**
 * Usage:
 * ```
 * // inside <script>
 * const craeteEventHandler = (el) => eventHandler(el, closeEditor, changed, animation)
 * 
 * // svelte markup
 * <editor-inner use:createEventHandler>
 *  ...
 * </editor-inner>
 * ```
 * @param {HTMLElement} editor 
 * @param {() => void} closeEditor 
 * @param {{ games: boolean, players: boolean }} changed 
 * @param {{ active: boolean }} animation 
 */
export default function eventHandler(editor, closeEditor, changed, animation) {

    /**
     * Closes window if nothing changed, suggests to save or discard otherwise.
     */
    function maybeClose() {
        if (!changed.games && !changed.players) closeEditor();
        else {
            // animate buttons and focus discard button
            editor.querySelector('.discard').focus();
            animation.active = true;
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
                const tags = ['a', 'button', 'input', 'select', '[contenteditable]'];
                const tabbableSelector = tags
                    .reduce((selector, tag) => selector + tag + ':not(:disabled),', '')
                    .slice(0, -1);
                const tabbables = Array.from(editor.querySelectorAll(tabbableSelector));
                const index = tabbables.indexOf(ev.target);
                const nextIndex = index + (ev.shiftKey ? -1 : 1);
                const { length } = tabbables;

                let ignore = false;
                if (nextIndex === length) tabbables[0].focus();
                else if (index === -1) tabbables[length - 1].focus();
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
    const closeButton = editor.querySelector('editor-buttons > button');
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