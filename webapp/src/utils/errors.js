/**
 * An error with message that can be
 * directly displayed to the user
 */
export class DisplayableError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "DisplayableError";
    }
}
