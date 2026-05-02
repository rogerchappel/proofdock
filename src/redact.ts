const REDACTION_PATTERNS: RegExp[] = [
  /ghp_[A-Za-z0-9]{20,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /sk-[A-Za-z0-9]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----/g,
  /(token|secret|password)(\s*[:=]\s*)([^\s]+)/gi,
  /(Authorization:\s*Bearer\s+)([^\s]+)/gi,
];

export function redactText(input: string): string {
  return REDACTION_PATTERNS.reduce((value, pattern) => value.replace(pattern, (_match, ...groups) => {
    if (groups.length >= 2 && typeof groups[0] === 'string') {
      const prefix = groups.slice(0, -2).filter((item) => typeof item === 'string').join('');
      if (prefix) {
        return `${prefix}[REDACTED]`;
      }
    }

    return '[REDACTED]';
  }), input);
}
