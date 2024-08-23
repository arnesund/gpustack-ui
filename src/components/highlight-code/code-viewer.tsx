import hljs from 'highlight.js';
import { memo, useMemo } from 'react';
import CopyButton from '../copy-button';
import './styles/dark.less';
import { escapeHtml } from './utils';

interface CodeViewerProps {
  code: string;
  lang: string;
  autodetect?: boolean;
  ignoreIllegals?: boolean;
  copyable?: boolean;
}
const CodeViewer: React.FC<CodeViewerProps> = (props) => {
  const {
    code,
    lang,
    autodetect = true,
    ignoreIllegals = true,
    copyable = true
  } = props || {};

  const highlightedCode = useMemo(() => {
    const autodetectLang = autodetect && !lang;
    const cannotDetectLanguage = !autodetectLang && !hljs.getLanguage(lang);
    let className = '';

    if (!cannotDetectLanguage) {
      className = `hljs ${lang}`;
    }

    // No idea what language to use, return raw code
    if (cannotDetectLanguage) {
      console.warn(`The language "${lang}" you specified could not be found.`);
      return {
        value: escapeHtml(code),
        className: className
      };
    }

    if (autodetectLang) {
      const result = hljs.highlightAuto(code);
      return {
        value: result.value,
        className: className
      };
    }
    const result = hljs.highlight(code, {
      language: lang,
      ignoreIllegals: ignoreIllegals
    });
    return {
      value: result.value,
      className: className
    };
  }, [code, lang, autodetect, ignoreIllegals]);

  return (
    <pre className="code-pre dark">
      <code
        className={highlightedCode.className}
        dangerouslySetInnerHTML={{
          __html: highlightedCode.value
        }}
      ></code>
      {copyable && (
        <CopyButton
          text={code}
          size="small"
          style={{ color: '#abb2bf' }}
        ></CopyButton>
      )}
    </pre>
  );
};

export default memo(CodeViewer);
