/** GIT忽略规则内容 */
export const GIT_IGNORES =
  '*.log\r\nnode_modules\r\ndist\r\n.idea\r\n.vscode/*\r\n!.vscode/settings.json\r\n!.vscode/extensions.json';

/** editorconfig */
export const EDITOR_CONFIG =
  'root = true\r\n\r\n[*]\r\ncharset = utf-8\r\nindent_style = space\r\n' +
  'indent_size = 2\r\nend_of_line = lf\r\n' +
  'insert_final_newline = true\r\ntrim_trailing_whitespace = true';

/** prettier */
export const PRETTIER = '"eslint-config-alloy/.prettierrc.js"';

/** .vscode/settings.json */
export const SETTINGS = {
  'files.eol': '\n',
  'editor.tabSize': 2,
  'editor.defaultFormatter': 'esbenp.prettier-vscode',
  '[jsonc]': {
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
  },
  'editor.codeActionsOnSave': {
    'source.fixAll.eslint': true,
  },
};

/** eslint */
export const ESLINT = {
  root: true,
  extends: [],
  rules: {
    eqeqeq: ['error', 'smart'],
    'no-eq-null': 'off',
  },
};

/** eslint ignore */
export const ESLINT_IGNORE = 'node_modules/\r\n.github/\r\n.vscode/';

/** pnpm monorepo 目标 */
export const PNPM_WORKSPACE_YAMR = "packages:\r\n\t- 'packages/*'";
