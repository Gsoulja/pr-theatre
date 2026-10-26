/** A failure the person running the CLI can act on. Printed without a stack trace. */
export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliError";
  }
}
