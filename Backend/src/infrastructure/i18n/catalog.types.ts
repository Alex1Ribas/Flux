export type SupportedLocale = 'pt-BR' | 'en' | 'es';

export type CatalogEntry = Record<SupportedLocale, string>;

export type Catalog<T extends string> = Record<T, CatalogEntry>;
