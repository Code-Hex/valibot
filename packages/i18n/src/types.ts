import type { BaseIssue, ErrorMessage } from 'valibot';

export type Language = {
  code:
    | 'ar'
    | 'ca'
    | 'cs'
    | 'de'
    | 'en'
    | 'es'
    | 'fr'
    | 'hu'
    | 'id'
    | 'it'
    | 'ja'
    | 'kr'
    | 'nb'
    | 'nl'
    | 'pl'
    | 'pt'
    | 'ro'
    | 'ru'
    | 'sl'
    | 'sv'
    | 'tr'
    | 'uk'
    | 'zh-CN'
    | 'zh-TW';
  schema: ErrorMessage<BaseIssue<unknown>>;
  specific: {
    base64: ErrorMessage<BaseIssue<unknown>>;
    bic: ErrorMessage<BaseIssue<unknown>>;
    bytes: ErrorMessage<BaseIssue<unknown>>;
    check: ErrorMessage<BaseIssue<unknown>>;
    checkAsync: ErrorMessage<BaseIssue<unknown>>;
    checkItems: ErrorMessage<BaseIssue<unknown>>;
    creditCard: ErrorMessage<BaseIssue<unknown>>;
    cuid2: ErrorMessage<BaseIssue<unknown>>;
    decimal: ErrorMessage<BaseIssue<unknown>>;
    digits: ErrorMessage<BaseIssue<unknown>>;
    email: ErrorMessage<BaseIssue<unknown>>;
    emoji: ErrorMessage<BaseIssue<unknown>>;
    empty: ErrorMessage<BaseIssue<unknown>>;
    endsWith: ErrorMessage<BaseIssue<unknown>>;
    everyItem: ErrorMessage<BaseIssue<unknown>>;
    excludes: ErrorMessage<BaseIssue<unknown>>;
    finite: ErrorMessage<BaseIssue<unknown>>;
    hash: ErrorMessage<BaseIssue<unknown>>;
    hexColor: ErrorMessage<BaseIssue<unknown>>;
    hexadecimal: ErrorMessage<BaseIssue<unknown>>;
    imei: ErrorMessage<BaseIssue<unknown>>;
    includes: ErrorMessage<BaseIssue<unknown>>;
    integer: ErrorMessage<BaseIssue<unknown>>;
    ip: ErrorMessage<BaseIssue<unknown>>;
    ipv4: ErrorMessage<BaseIssue<unknown>>;
    ipv6: ErrorMessage<BaseIssue<unknown>>;
    isoDate: ErrorMessage<BaseIssue<unknown>>;
    isoDateTime: ErrorMessage<BaseIssue<unknown>>;
    isoTime: ErrorMessage<BaseIssue<unknown>>;
    isoTimeSecond: ErrorMessage<BaseIssue<unknown>>;
    isoTimestamp: ErrorMessage<BaseIssue<unknown>>;
    isoWeek: ErrorMessage<BaseIssue<unknown>>;
    length: ErrorMessage<BaseIssue<unknown>>;
    mac: ErrorMessage<BaseIssue<unknown>>;
    mac48: ErrorMessage<BaseIssue<unknown>>;
    mac64: ErrorMessage<BaseIssue<unknown>>;
    maxBytes: ErrorMessage<BaseIssue<unknown>>;
    maxLength: ErrorMessage<BaseIssue<unknown>>;
    maxSize: ErrorMessage<BaseIssue<unknown>>;
    maxValue: ErrorMessage<BaseIssue<unknown>>;
    mimeType: ErrorMessage<BaseIssue<unknown>>;
    minBytes: ErrorMessage<BaseIssue<unknown>>;
    minLength: ErrorMessage<BaseIssue<unknown>>;
    minSize: ErrorMessage<BaseIssue<unknown>>;
    minValue: ErrorMessage<BaseIssue<unknown>>;
    multipleOf: ErrorMessage<BaseIssue<unknown>>;
    nanoid: ErrorMessage<BaseIssue<unknown>>;
    nonEmpty: ErrorMessage<BaseIssue<unknown>>;
    notBytes: ErrorMessage<BaseIssue<unknown>>;
    notLength: ErrorMessage<BaseIssue<unknown>>;
    notSize: ErrorMessage<BaseIssue<unknown>>;
    notValue: ErrorMessage<BaseIssue<unknown>>;
    octal: ErrorMessage<BaseIssue<unknown>>;
    partialCheck: ErrorMessage<BaseIssue<unknown>>;
    regex: ErrorMessage<BaseIssue<unknown>>;
    safeInteger: ErrorMessage<BaseIssue<unknown>>;
    size: ErrorMessage<BaseIssue<unknown>>;
    someItem: ErrorMessage<BaseIssue<unknown>>;
    startsWith: ErrorMessage<BaseIssue<unknown>>;
    ulid: ErrorMessage<BaseIssue<unknown>>;
    url: ErrorMessage<BaseIssue<unknown>>;
    uuid: ErrorMessage<BaseIssue<unknown>>;
    value: ErrorMessage<BaseIssue<unknown>>;
  };
};
