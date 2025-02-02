import { AutoComplete, Form, Spin } from 'antd';
import type { AutoCompleteProps } from 'antd/lib';
import { useEffect, useRef, useState } from 'react';
import Wrapper from './components/wrapper';
import { SealFormItemProps } from './types';

const SealAutoComplete: React.FC<AutoCompleteProps & SealFormItemProps> = (
  props
) => {
  const {
    label,
    placeholder,
    required,
    description,
    isInFormItems = true,
    onSelect,
    extra,
    style,
    addAfter,
    loading,
    ...rest
  } = props;
  const [isFocus, setIsFocus] = useState(false);
  const inputRef = useRef<any>(null);
  let status = '';
  if (isInFormItems) {
    const statusData = Form?.Item?.useStatus?.();
    status = statusData?.status || '';
  }

  useEffect(() => {
    if (props.value) {
      setIsFocus(true);
    }
  }, [props.value]);

  const handleClickWrapper = () => {
    if (!props.disabled && !isFocus) {
      inputRef.current?.focus?.();
      setIsFocus(true);
    }
  };

  const handleChange = (value: string, option: any) => {
    props.onChange?.(value, option);
  };

  const handleOnFocus = (e: any) => {
    setIsFocus(true);
    props.onFocus?.(e);
  };

  const handleOnBlur = (e: any) => {
    if (!props.value) {
      setIsFocus(false);
    }
    props.onBlur?.(e);
  };

  const handleSearch = (text: string) => {
    props.onSearch?.(text);
  };

  const handleOnSelect = (value: any, option: any) => {
    onSelect?.(value, option);
  };
  const renderAfter = () => {
    if (loading) {
      return <Spin size="small"></Spin>;
    }
    return addAfter;
  };

  return (
    <Wrapper
      status={status}
      extra={extra}
      label={label || (placeholder as string)}
      isFocus={isFocus}
      required={required}
      description={description}
      disabled={props.disabled}
      addAfter={renderAfter()}
      onClick={handleClickWrapper}
    >
      <AutoComplete
        {...rest}
        ref={inputRef}
        placeholder={
          isFocus ? (
            <span style={{ paddingLeft: '12px' }}>{placeholder}</span>
          ) : (
            ''
          )
        }
        onSelect={handleOnSelect}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        onSearch={handleSearch}
        onChange={handleChange}
      ></AutoComplete>
    </Wrapper>
  );
};

export default SealAutoComplete;
