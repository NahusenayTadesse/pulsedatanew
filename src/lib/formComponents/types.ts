/** One option in a `SelectComp` — `value` is what posts, `name` is what shows. */
export type Item = { value: string; name: string };

/**
 * The shape a field component needs from Superforms' errors store.
 *
 * Deliberately loose. Superforms types `$errors` as `ValidationErrors<T>`, a
 * recursive mapped type over the schema, which does not narrow to a flat
 * `Record<string, string[]>` — and a component that is handed one field's
 * messages by name has no business knowing the whole schema's shape anyway.
 * Each component casts the one entry it reads.
 */
export type FieldErrors = Record<string, unknown>;
