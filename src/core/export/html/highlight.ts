import { escapeHtml } from './mini-markdown';

interface LanguageProfile {
  keywords: Set<string>;
  lineComment: string | null;
  blockComment: [string, string] | null;
  hashComment: boolean;
}

const C_KEYWORDS =
  'abstract as async await break case catch class const continue debugger default delete do else enum export extends false final finally for from function get if implements import in instanceof interface let new null of override private protected public readonly return set static struct super switch this throw true try type typeof undefined var void while with yield int long float double bool boolean byte char short string String unsigned signed sizeof namespace using template typename virtual friend operator fn impl trait mut match loop pub crate mod use where dyn ref move unsafe go chan defer fallthrough func map package range select val when object companion data sealed lateinit';

const PY_KEYWORDS =
  'and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield True False None self match case';

const SH_KEYWORDS =
  'if then else elif fi for while until do done case esac function in select time coproc echo exit return local export readonly declare set unset shift source alias cd ls rm mv cp mkdir sudo';

function words(list: string): Set<string> {
  return new Set(list.split(' '));
}

function profileFor(language: string): LanguageProfile {
  const lang = language.toLowerCase();
  if (['python', 'py'].includes(lang)) {
    return { keywords: words(PY_KEYWORDS), lineComment: null, blockComment: null, hashComment: true };
  }
  if (['bash', 'sh', 'shell', 'zsh', 'powershell', 'ps1', 'yaml', 'yml', 'toml', 'ruby', 'rb', 'r'].includes(lang)) {
    return { keywords: words(SH_KEYWORDS), lineComment: null, blockComment: null, hashComment: true };
  }
  if (['json', 'jsonc'].includes(lang)) {
    return { keywords: words('true false null'), lineComment: '//', blockComment: null, hashComment: false };
  }
  if (['css', 'scss', 'less'].includes(lang)) {
    return { keywords: words('important inherit initial unset auto none'), lineComment: '//', blockComment: ['/*', '*/'], hashComment: false };
  }
  if (['html', 'xml', 'svg', 'vue'].includes(lang)) {
    return { keywords: words(''), lineComment: null, blockComment: ['<!--', '-->'], hashComment: false };
  }
  if (['sql'].includes(lang)) {
    return {
      keywords: words(
        'select from where insert into values update delete set create table drop alter index join left right inner outer on as and or not null primary key foreign references group by order having limit offset distinct union all between like is in exists count sum avg min max',
      ),
      lineComment: '--',
      blockComment: ['/*', '*/'],
      hashComment: false,
    };
  }
  return { keywords: words(C_KEYWORDS), lineComment: '//', blockComment: ['/*', '*/'], hashComment: false };
}

export function highlightCode(code: string, language = ''): string {
  const profile = profileFor(language);
  const out: string[] = [];
  let index = 0;
  const length = code.length;

  const push = (cls: string | null, text: string) => {
    const safe = escapeHtml(text);
    out.push(cls ? `<span class="${cls}">${safe}</span>` : safe);
  };

  while (index < length) {
    const char = code[index];
    const two = code.slice(index, index + 2);

    if (profile.blockComment && code.startsWith(profile.blockComment[0], index)) {
      const end = code.indexOf(profile.blockComment[1], index + profile.blockComment[0].length);
      const stop = end === -1 ? length : end + profile.blockComment[1].length;
      push('tok-com', code.slice(index, stop));
      index = stop;
      continue;
    }
    if (
      (profile.lineComment && code.startsWith(profile.lineComment, index)) ||
      (profile.hashComment && char === '#')
    ) {
      const end = code.indexOf('\n', index);
      const stop = end === -1 ? length : end;
      push('tok-com', code.slice(index, stop));
      index = stop;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      let cursor = index + 1;
      while (cursor < length) {
        if (code[cursor] === '\\') {
          cursor += 2;
          continue;
        }
        if (code[cursor] === char) {
          cursor += 1;
          break;
        }
        if (char !== '`' && code[cursor] === '\n') break;
        cursor += 1;
      }
      push('tok-str', code.slice(index, cursor));
      index = cursor;
      continue;
    }
    if (/[0-9]/.test(char) && !/[\w$]/.test(code[index - 1] ?? '')) {
      let cursor = index + 1;
      while (cursor < length && /[\w.]/.test(code[cursor])) cursor += 1;
      push('tok-num', code.slice(index, cursor));
      index = cursor;
      continue;
    }
    if (/[A-Za-z_$]/.test(char)) {
      let cursor = index + 1;
      while (cursor < length && /[\w$]/.test(code[cursor])) cursor += 1;
      const word = code.slice(index, cursor);
      let rest = cursor;
      while (rest < length && code[rest] === ' ') rest += 1;
      if (profile.keywords.has(word)) {
        push('tok-kw', word);
      } else if (code[rest] === '(') {
        push('tok-fn', word);
      } else {
        push(null, word);
      }
      index = cursor;
      continue;
    }
    if (two === '</' || char === '<') {
      const tag = code.slice(index).match(/^<\/?[A-Za-z][\w-]*/);
      if (tag && ['html', 'xml', 'svg', 'vue', ''].includes(language.toLowerCase())) {
        push('tok-kw', tag[0]);
        index += tag[0].length;
        continue;
      }
    }
    push(null, char);
    index += 1;
  }

  return out.join('');
}
