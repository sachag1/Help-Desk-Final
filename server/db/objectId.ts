const OBJECT_ID_PATTERN: RegExp = /^[0-9a-fA-F]{24}$/;

// Only a string made of 24 hex characters can be a MongoDB ObjectId
export function isValidObjectId(value: string): boolean {
    return OBJECT_ID_PATTERN.test(value);
}
