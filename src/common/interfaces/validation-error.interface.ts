export interface ValidationErrorInterface {
  name: string;
  errors: Array<string>;
}

export interface ValidationPayloadInterface {
  property: string;
  constraints: Record<string, string>;
}
