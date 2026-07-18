/**
 * HTTP router provided by application (Express Router at runtime).
 * Domain stays free of framework imports — see AGENTS.md.
 */
export interface IController {
  readonly router: unknown;
}
