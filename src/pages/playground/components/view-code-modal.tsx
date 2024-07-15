import EditorWrap from '@/components/editor-wrap';
import { BulbOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { useIntl } from '@umijs/max';
import { Button, Modal, Spin } from 'antd';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';

type ViewModalProps = {
  systemMessage?: string;
  messageList: any[];
  parameters: any;
  title: string;
  open: boolean;
  onCancel: () => void;
};

const ViewCodeModal: React.FC<ViewModalProps> = (props) => {
  const {
    title,
    open,
    onCancel,
    systemMessage,
    messageList,
    parameters = {}
  } = props || {};

  const intl = useIntl();
  const editorRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [lang, setLang] = useState('shell');

  const BaseURL = `${window.location.origin}/v1-openai/chat/completions`;

  const langOptions = [
    { label: 'Curl', value: 'shell' },
    { label: 'Python', value: 'python' },
    { label: 'Nodejs', value: 'javascript' }
  ];

  const formatCode = () => {
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current
          ?.getAction?.('editor.action.formatDocument')
          ?.run()
          .then(() => {
            console.log('format success');
          });
      }, 100);
    }
  };
  const generateCode = () => {
    if (lang === 'shell') {
      const systemList = systemMessage
        ? [{ role: 'system', content: systemMessage }]
        : [];
      const code = `curl ${window.location.origin}/v1-openai/chat/completions \\\n-H "Content-Type: application/json" \\\n-H "Authorization: Bearer $\{GPUSTACK_API_KEY}" \\\n-d '${JSON.stringify(
        {
          ...parameters,
          messages: [...systemList, ...messageList]
        },
        null,
        2
      )}'`;
      setCodeValue(code);
    } else if (lang === 'javascript') {
      const systemList = systemMessage
        ? [{ role: 'system', content: systemMessage }]
        : [];
      const code = `import OpenAI from "openai";\nconst openai = new OpenAI();\n\nconst baseURL = "${BaseURL}"\n\nasync function main(){\nconst params = ${JSON.stringify(
        {
          ...parameters,
          messages: [...systemList, ...messageList]
        },
        null,
        2
      )};\nconst chatCompletion = await openai.chat.completions.create(params);\nfor await (const chunk of chatCompletion) {\n  process.stdout.write(chunk.choices[0]?.delta?.content || '');\n}\n}\nmain();`;
      setCodeValue(code);
    } else if (lang === 'python') {
      const formattedParams = _.keys(parameters).reduce(
        (acc: string, key: string) => {
          if (parameters[key] === null) {
            return acc;
          }
          const value =
            typeof parameters[key] === 'string'
              ? `"${parameters[key]}"`
              : parameters[key];
          return acc + `  ${key}=${value},\n`;
        },
        ''
      );
      const systemList = systemMessage
        ? [{ role: 'system', content: systemMessage }]
        : [];
      const code = `from openai import OpenAI\nclient = OpenAI()\n\nbaseURL = ${BaseURL}\n\ncompletion = client.chat.completions.create(\n${formattedParams}  messages=${JSON.stringify([...systemList, ...messageList], null, 2)})\nprint(completion.choices[0].message)`;
      setCodeValue(code);
    }
    formatCode();
  };
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setLoaded(true);
  };

  const handleOnChangeLang = (value: string) => {
    setLang(value);
  };

  const handleClose = () => {
    setLang('shell');
    onCancel();
  };
  const editorConfig = {
    minimap: {
      enabled: false
    },
    formatOnType: true,
    formatOnPaste: true,
    fontWeight: '700',
    scrollbar: {
      verticalSliderSize: 8
    }
  };

  useEffect(() => {
    generateCode();
  }, [lang, systemMessage, messageList, parameters]);

  return (
    <>
      <Modal
        title={title}
        open={open}
        centered={true}
        onCancel={handleClose}
        destroyOnClose={true}
        closeIcon={true}
        maskClosable={false}
        keyboard={false}
        width={600}
        footer={null}
      >
        <div style={{ marginBottom: '10px' }}>
          {intl.formatMessage({ id: 'playground.viewcode.info' })}
        </div>
        <Spin spinning={!loaded}>
          <EditorWrap
            copyText={codeValue}
            langOptions={langOptions}
            defaultValue="shell"
            showHeader={loaded}
            onChangeLang={handleOnChangeLang}
          >
            <Editor
              height={380}
              theme="vs-dark"
              className="monaco-editor"
              defaultLanguage="shell"
              language={lang}
              value={codeValue}
              options={editorConfig}
              onMount={handleEditorDidMount}
            />
          </EditorWrap>
          <div style={{ marginTop: 10 }}>
            <BulbOutlined className="m-r-8" />
            <span>
              {intl.formatMessage(
                { id: 'playground.viewcode.tips' },
                {
                  here: (
                    <Button
                      type="link"
                      size="small"
                      href="#/api-keys"
                      target="_blank"
                    >
                      <span>
                        {' '}
                        {intl.formatMessage({ id: 'playground.viewcode.here' })}
                      </span>
                    </Button>
                  )
                }
              )}
            </span>
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default ViewCodeModal;
