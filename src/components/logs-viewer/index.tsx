import useSetChunkRequest from '@/hooks/use-chunk-request';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import classNames from 'classnames';
import _ from 'lodash';
import { memo, useEffect, useRef, useState } from 'react';
import './index.less';
import useSize from './use-size';

interface LogsViewerProps {
  height: number;
  content?: string;
  url: string;
  params?: object;
}
const LogsViewer: React.FC<LogsViewerProps> = (props) => {
  const { height, content, url } = props;
  const [nowrap, setNowrap] = useState(false);
  const { setChunkRequest } = useSetChunkRequest();
  const chunkRequedtRef = useRef<any>(null);
  const scroller = useRef<any>(null);
  const termRef = useRef<any>(null);
  const termInsRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const cacheDatARef = useRef<any>(null);
  const size = useSize(scroller);

  const updateContent = (newVal: string) => {
    cacheDatARef.current = newVal;
    termRef.current?.reset();
    termRef.current?.write?.(newVal);
  };

  const fitTerm = () => {
    fitAddonRef.current.fit();
  };

  const createChunkConnection = async () => {
    chunkRequedtRef.current?.current?.cancel?.();
    chunkRequedtRef.current = setChunkRequest({
      url,
      params: {
        ...props.params,
        watch: true
      },
      contentType: 'text',
      handler: updateContent
    });
  };
  const initTerm = () => {
    termRef.current?.dispose?.();
    termRef.current = new Terminal({
      lineHeight: 1.2,
      fontSize: 12,
      fontFamily:
        "monospace,Menlo,Courier,'Courier New',Consolas,Monaco, 'Liberation Mono'",
      disableStdin: true,
      convertEol: true,
      theme: {
        background: '#1e1e1e'
      },
      cursorInactiveStyle: 'none'
      // windowOptions: {
      //   setWinPosition: true,
      //   setWinSizePixels: true,
      //   refreshWin: true
      // }
    });
    fitAddonRef.current = new FitAddon();
    termRef.current.loadAddon(fitAddonRef.current);
    termRef.current.open(termInsRef.current);
    fitAddonRef.current?.fit();
  };

  const handleResize = _.throttle(() => {
    termRef.current?.clear();
    if (cacheDatARef.current) {
      updateContent(cacheDatARef.current);
    }
    fitTerm();
  }, 100);

  useEffect(() => {
    createChunkConnection();
    return () => {
      chunkRequedtRef.current?.current?.cancel?.();
    };
  }, [url, props.params]);

  useEffect(() => {
    if (termInsRef.current) {
      initTerm();
    }
  }, []);

  useEffect(() => {
    handleResize();
    console.log('size======', size);
  }, [size]);

  return (
    <div className="logs-viewer-wrap-w2">
      <div className="wrap" style={{ height: height }} ref={scroller}>
        <div className={classNames('content', { 'line-break': nowrap })}>
          <div className="text">
            <div ref={termInsRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(LogsViewer);
