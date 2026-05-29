import React from 'react';

export type BujjiCodeProps = {
  code: string;
  title?: string;
  functions?: string[];
  noTrim?: boolean;
  className?: string;
};

export const keywords = new Set([
  'aagu',
  'adugu',
  'ante',
  'anicheppu',
  'bujji',
  'chaalu',
  'idhi',
  'ithe',
  'ki',
  'leda',
  'lo',
  'malli',
  'nijam',
  'pampi',
  'poni',
  'prati',
]);

export const operators = new Set(['=', '+', '-', '*', '/', '%', '^', '>', '<', '!', ':']);

export function tokenClass(token: string, functions: Set<string>) {
  if (/^".*"$/.test(token)) {
    return 'bujjiCodeString';
  }

  if (keywords.has(token)) {
    return 'bujjiCodeKeyword';
  }

  if (functions.has(token)) {
    return 'bujjiCodeFunction';
  }

  if (/^\d+(\.\d+)?$/.test(token)) {
    return 'bujjiCodeNumber';
  }

  if ([...token].every((character) => operators.has(character))) {
    return 'bujjiCodeOperator';
  }

  return undefined;
}

export function tokenize(line: string) {
  return line.match(/"[^"]*"|\s+|[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|>=|<=|==|!=|./g) ?? [];
}

export default function BujjiCode({
  code,
  title,
  functions = [],
  noTrim = false,
  className = '',
}: BujjiCodeProps) {
  const functionNames = new Set(functions);
  const lines = noTrim ? code.split('\n') : code.trim().split('\n');

  return (
    <div
      className={`bujjiCodeBlock ${className}`}
      aria-label={title ? `${title} code snippet` : 'Bujji code snippet'}
    >
      {title && <div className="bujjiCodeTitle">{title}</div>}
      <pre>
        <code>
          {lines.map((line, lineIndex) => (
            <span key={`${line}-${lineIndex}`}>
              {line === '' ? (noTrim ? '' : '\n') : tokenize(line).map((token, tokenIndex) => {
                if (/^\s+$/.test(token)) {
                  return token;
                }

                const className = tokenClass(token, functionNames);

                return className ? (
                  <span className={className} key={`${token}-${tokenIndex}`}>
                    {token}
                  </span>
                ) : (
                  token
                );
              })}
              {noTrim && lineIndex < lines.length - 1 && '\n'}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

