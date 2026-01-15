export class SqlSanitizer {
  static sanitizeString(input: string): string {
    if (!input) return '';

    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .trim();
  }

  static hasSqlInjection(input: string): boolean {
    const sqlKeywords = [
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'CREATE',
      'ALTER',
      'EXEC',
      'EXECUTE',
      'UNION',
      'OR',
      'AND',
      'WHERE',
      'FROM',
      'TABLE',
      'DATABASE',
      'SCRIPT',
      'SCRIPTING',
    ];

    const upperInput = input.toUpperCase();
    return sqlKeywords.some(
      (keyword) =>
        upperInput.includes(keyword) && upperInput.includes(keyword + ' '),
    );
  }
}
